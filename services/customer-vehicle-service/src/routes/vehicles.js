const express = require('express');
const { Vehicle, Customer, VehicleServiceHistory } = require('../models');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { vehicleSchema, updateVehicleSchema, serviceUpdateSchema } = require('../utils/validationSchemas');

const router = express.Router();

// POST /api/vehicles
router.post('/', authenticate, validate(vehicleSchema), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.body.customerId);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Registration number already exists' });
    }
    res.status(500).json({ error: 'Failed to create vehicle', details: err.message });
  }
});

// GET /api/vehicles/customer/:customerId — MUST be before /:id
router.get('/customer/:customerId', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { customerId: req.params.customerId }
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles', details: err.message });
  }
});

// GET /api/vehicles/:id — called by Appointment and Job services
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{
        model: VehicleServiceHistory,
        as: 'serviceHistory',
        limit: 10,
        order: [['serviceDate', 'DESC']]
      }]
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle', details: err.message });
  }
});

// PUT /api/vehicles/:id
router.put('/:id', authenticate, validate(updateVehicleSchema), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    await vehicle.update(req.body);
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle', details: err.message });
  }
});

// PATCH /api/vehicles/:id/service-update — called by Job Service (no auth for internal call)
router.patch('/:id/service-update', validate(serviceUpdateSchema), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    await vehicle.update({
      lastServiceDate: new Date(),
      status: 'active'
    });

    const historyEntry = await VehicleServiceHistory.create({
      vehicleId: vehicle.id,
      jobId: req.body.jobId,
      paymentId: req.body.paymentId,
      serviceDate: new Date(),
      serviceType: req.body.serviceType,
      summary: req.body.summary,
      amountPaid: req.body.amountPaid,
    });

    res.json({ vehicle, historyEntry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update service', details: err.message });
  }
});

// GET /api/vehicles/:id/history
router.get('/:id/history', async (req, res) => {
  try {
    const history = await VehicleServiceHistory.findAll({
      where: { vehicleId: req.params.id },
      order: [['serviceDate', 'DESC']]
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
});

module.exports = router;
