const express = require('express');
const { Job } = require('../models');
const { authenticate, adminOnly, staffOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createJobSchema } = require('../utils/validationSchemas');

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

module.exports = router;
