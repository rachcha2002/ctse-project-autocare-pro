const express = require('express');
const { Op } = require('sequelize');
const { Appointment } = require('../models');
const { authenticate, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createAppointmentSchema } = require('../utils/validationSchemas');
const cvClient = require('../services/cvClient');

const router = express.Router();

// POST /api/appointments — book appointment
router.post('/', authenticate, validate(createAppointmentSchema), async (req, res) => {
  try {
    const { customerId, vehicleId, appointmentDate, serviceType, notes } = req.body;

    // Call 1 — Verify customer exists in CV Service
    let customer;
    try {
      customer = await cvClient.getCustomer(customerId);
    } catch (err) {
      return res.status(404).json({ error: 'Customer not found in system' });
    }

    // Call 2 — Verify vehicle exists and is not in_service
    let vehicle;
    try {
      vehicle = await cvClient.getVehicle(vehicleId);
    } catch (err) {
      return res.status(404).json({ error: 'Vehicle not found in system' });
    }

    if (vehicle.status === 'in_service') {
      return res.status(409).json({
        error: 'Vehicle is currently being serviced. Cannot book a new appointment.'
      });
    }

    if (vehicle.customerId !== customerId) {
      return res.status(403).json({ error: 'Vehicle does not belong to this customer' });
    }

    const appointment = await Appointment.create({
      customerId, vehicleId, appointmentDate, serviceType, notes
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
});

// GET /api/appointments/available — get available slots for a date
router.get('/available', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query parameter required' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const booked = await Appointment.findAll({
      where: {
        appointmentDate: { [Op.between]: [startOfDay, endOfDay] },
        status: { [Op.notIn]: ['cancelled'] }
      },
      attributes: ['appointmentDate']
    });

    // Available slots: 8am to 5pm, every hour
    const allSlots = [];
    for (let hour = 8; hour <= 17; hour++) {
      const slot = new Date(date);
      slot.setHours(hour, 0, 0, 0);
      allSlots.push(slot.toISOString());
    }

    const bookedTimes = booked.map(a => new Date(a.appointmentDate).getHours());
    const availableSlots = allSlots.filter(slot => {
      const slotHour = new Date(slot).getHours();
      return !bookedTimes.includes(slotHour);
    });

    res.json({ date, availableSlots, bookedCount: booked.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get available slots', details: err.message });
  }
});

// GET /api/appointments/customer/:customerId
router.get('/customer/:customerId', authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { customerId: req.params.customerId },
      order: [['appointmentDate', 'DESC']]
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
});

// GET /api/appointments/vehicle/:vehicleId
router.get('/vehicle/:vehicleId', authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { vehicleId: req.params.vehicleId },
      order: [['appointmentDate', 'DESC']]
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
});

// GET /api/appointments/:id — called by Job Service and Frontend
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointment', details: err.message });
  }
});

module.exports = router;
