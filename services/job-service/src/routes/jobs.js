const express = require('express');
const { Job } = require('../models');
const { authenticate, adminOnly, staffOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createJobSchema, assignJobSchema } = require('../utils/validationSchemas');
const cvClient = require('../services/cvClient');
const appointmentClient = require('../services/appointmentClient');

const router = express.Router();

// POST /api/jobs — called by Appointment Service (no auth — internal call)
router.post('/', validate(createJobSchema), async (req, res) => {
  try {
    const {
      appointmentId, vehicleId, customerId,
      serviceType, issueDescription
    } = req.body;

    // Check if job already exists for this appointment
    const existing = await Job.findOne({ where: { appointmentId } });
    if (existing) {
      return res.status(409).json({
        error: 'Job already exists for this appointment',
        job: existing
      });
    }

    const job = await Job.create({
      appointmentId, vehicleId, customerId,
      serviceType, issueDescription,
      status: 'created'
    });

    res.status(201).json(job);
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ error: 'Failed to create job', details: err.message });
  }
});

// GET /api/jobs/appointment/:appointmentId — BEFORE /:id
router.get('/appointment/:appointmentId', async (req, res) => {
  try {
    const job = await Job.findOne({
      where: { appointmentId: req.params.appointmentId }
    });
    if (!job) return res.status(404).json({ error: 'No job found for this appointment' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job', details: err.message });
  }
});

// GET /api/jobs/vehicle/:vehicleId — BEFORE /:id
router.get('/vehicle/:vehicleId', authenticate, async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { vehicleId: req.params.vehicleId },
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
  }
});

// GET /api/jobs/:id — called by Payment Service and Frontend (no auth — internal)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job', details: err.message });
  }
});

// PATCH /api/jobs/:id/assign — Admin only
// Gets mechanic list from CV Service before assigning
router.patch('/:id/assign', authenticate, adminOnly, validate(assignJobSchema), async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.status === 'completed') {
      return res.status(409).json({ error: 'Cannot assign mechanic to completed job' });
    }

    // Call CV Service to verify mechanic exists
    let mechanic;
    try {
      mechanic = await cvClient.getMechanic(req.body.mechanicId);
      if (mechanic.role !== 'mechanic') {
        return res.status(400).json({ error: 'Specified staff member is not a mechanic' });
      }
    } catch (err) {
      return res.status(404).json({ error: 'Mechanic not found in system' });
    }

    await job.update({
      assignedMechanic: mechanic.id,
      status: 'pending'
    });

    res.json({
      job,
      mechanic: {
        id: mechanic.id,
        fullName: mechanic.fullName,
        phone: mechanic.phone
      }
    });
  } catch (err) {
    console.error('Assign job error:', err);
    res.status(500).json({ error: 'Failed to assign job', details: err.message });
  }
});

// GET /api/jobs/mechanics — get available mechanics list for assignment dropdown
// Admin only — no auth since called from frontend admin panel
router.get('/mechanics/list', authenticate, adminOnly, async (req, res) => {
  try {
    const mechanics = await cvClient.getMechanics();
    res.json(mechanics);
  } catch (err) {
    res.status(503).json({ error: 'Unable to fetch mechanics list', details: err.message });
  }
});

// PATCH /api/jobs/:id/start — Mechanic or Admin
// Updates job to in_progress and notifies Appointment Service
router.patch('/:id/start', authenticate, staffOnly, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (!['created', 'pending'].includes(job.status)) {
      return res.status(409).json({
        error: `Cannot start job with status: ${job.status}`
      });
    }

    await job.update({ status: 'in_progress' });

    // Call Appointment Service to update status
    try {
      await appointmentClient.updateAppointmentStatus(
        job.appointmentId, 'in_progress'
      );
    } catch (err) {
      console.error('Failed to update appointment status:', err.message);
    }

    res.json(job);
  } catch (err) {
    console.error('Start job error:', err);
    res.status(500).json({ error: 'Failed to start job', details: err.message });
  }
});

module.exports = router;
