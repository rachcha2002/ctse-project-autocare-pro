const express = require('express');
const { Job } = require('../models');
const { authenticate, adminOnly, staffOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createJobSchema, assignJobSchema, progressSchema, completeJobSchema } = require('../utils/validationSchemas');
const cvClient = require('../services/cvClient');
const appointmentClient = require('../services/appointmentClient');
const paymentClient = require('../services/paymentClient');

const router = express.Router();

// GET /api/jobs/mechanics/list — returns list of mechanics from CV Service for admin assignment
router.get('/mechanics/list', authenticate, adminOnly, async (req, res) => {
  try {
    const mechanics = await cvClient.getMechanics();
    res.json(mechanics);
  } catch (err) {
    res.status(502).json({ error: 'Could not fetch mechanics', details: err.message });
  }
});

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
      mechanic = await cvClient.getMechanic(encodeURIComponent(req.body.mechanicId));
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

    if (!job.assignedMechanic) {
      return res.status(400).json({ error: 'Cannot start job without an assigned mechanic' });
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

// PUT /api/jobs/:id/progress — Mechanic or Admin
// Update notes, parts, costs during work
router.put('/:id/progress', authenticate, staffOnly, validate(progressSchema), async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.status === 'completed') {
      return res.status(409).json({ error: 'Cannot update completed job' });
    }

    const updates = {};
    if (req.body.workDescription !== undefined) updates.workDescription = req.body.workDescription;
    if (req.body.sparePartsUsed !== undefined) updates.sparePartsUsed = req.body.sparePartsUsed;
    if (req.body.partsCost !== undefined) updates.partsCost = req.body.partsCost;
    if (req.body.laborCost !== undefined) updates.laborCost = req.body.laborCost;
    if (req.body.status !== undefined) updates.status = req.body.status;

    await job.update(updates);
    res.json(job);
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ error: 'Failed to update job progress', details: err.message });
  }
});

// PATCH /api/jobs/:id/complete — Mechanic or Admin
// MOST IMPORTANT ROUTE — triggers 3 downstream inter-service calls:
// 1. Appointment Service — update status to completed
// 2. Customer & Vehicle Service — update vehicle service history
// 3. Payment Service — create invoice
router.patch('/:id/complete', authenticate, staffOnly, validate(completeJobSchema), async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.status === 'completed') {
      return res.status(409).json({ error: 'Job is already completed' });
    }

    if (!['in_progress', 'waiting_parts'].includes(job.status)) {
      return res.status(409).json({
        error: `Cannot complete job with status: ${job.status}. Job must be in_progress or waiting_parts.`
      });
    }

    // Save final job details
    await job.update({
      status: 'completed',
      workDescription: req.body.workDescription,
      sparePartsUsed: req.body.sparePartsUsed || '',
      partsCost: req.body.partsCost,
      laborCost: req.body.laborCost,
      completedAt: new Date()
    });

    const results = {
      job,
      appointmentUpdated: false,
      vehicleHistoryUpdated: false,
      invoiceCreated: false,
      errors: []
    };

    // === DOWNSTREAM CALL 1 ===
    // Update Appointment Service status to completed
    try {
      await appointmentClient.updateAppointmentStatus(job.appointmentId, 'completed');
      results.appointmentUpdated = true;
      console.log(`Job ${job.id}: Appointment ${job.appointmentId} marked completed`);
    } catch (err) {
      results.errors.push(`Appointment update failed: ${err.message}`);
      console.error('Failed to update appointment:', err.message);
    }

    // === DOWNSTREAM CALL 2 ===
    // Update vehicle service history in Customer & Vehicle Service
    try {
      await cvClient.updateVehicleService(job.vehicleId, {
        jobId: job.id,
        serviceDate: new Date().toISOString().split('T')[0],
        serviceType: job.serviceType,
        summary: req.body.workDescription,
        amountPaid: parseFloat(req.body.laborCost) + parseFloat(req.body.partsCost)
      });
      results.vehicleHistoryUpdated = true;
      console.log(`Job ${job.id}: Vehicle ${job.vehicleId} service history updated`);
    } catch (err) {
      results.errors.push(`Vehicle history update failed: ${err.message}`);
      console.error('Failed to update vehicle history:', err.message);
    }

    // === DOWNSTREAM CALL 3 ===
    // Trigger invoice creation in Payment Service
    try {
      const invoice = await paymentClient.createInvoice({
        jobId: job.id,
        customerId: job.customerId,
        laborCost: parseFloat(req.body.laborCost),
        partsCost: parseFloat(req.body.partsCost),
        serviceType: job.serviceType
      });
      results.invoiceCreated = true;
      results.invoice = invoice;
      console.log(`Job ${job.id}: Invoice created - ID ${invoice.id}`);
    } catch (err) {
      results.errors.push(`Invoice creation failed: ${err.message}`);
      console.error('Failed to create invoice:', err.message);
    }

    res.json(results);
  } catch (err) {
    console.error('Complete job error:', err);
    res.status(500).json({ error: 'Failed to complete job', details: err.message });
  }
});

module.exports = router;
