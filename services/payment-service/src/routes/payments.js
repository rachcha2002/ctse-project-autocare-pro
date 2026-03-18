const express = require('express');
const { Op } = require('sequelize');
const { Payment } = require('../models');
const { authenticate, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createInvoiceSchema } = require('../utils/validationSchemas');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');
const jobClient = require('../services/jobClient');
const cvClient = require('../services/cvClient');

const router = express.Router();

// POST /api/payments/invoice — called by Job Service (no auth — internal)
// Fetches job details and customer info, then creates invoice
router.post('/invoice', validate(createInvoiceSchema), async (req, res) => {
  try {
    const { jobId, customerId, laborCost, partsCost, serviceType } = req.body;

    // Check if invoice already exists for this job
    const existing = await Payment.findOne({ where: { jobId } });
    if (existing) {
      return res.status(409).json({
        error: 'Invoice already exists for this job',
        payment: existing
      });
    }

    // Call 1 — Get job details from Job Service
    let job;
    try {
      job = await jobClient.getJob(jobId);
    } catch (err) {
      return res.status(404).json({ error: 'Job not found in Job Service' });
    }

    // Call 2 — Get customer details from Customer & Vehicle Service
    let customer;
    try {
      customer = await cvClient.getCustomer(customerId);
    } catch (err) {
      return res.status(404).json({ error: 'Customer not found in CV Service' });
    }

    // Get vehicle registration if available
    let vehicleRegistration = null;
    try {
      const vehicle = await cvClient.getVehicle(job.vehicleId);
      vehicleRegistration = vehicle.registrationNumber;
    } catch (err) {
      console.log('Could not fetch vehicle registration:', err.message);
    }

    const totalAmount = parseFloat(laborCost) + parseFloat(partsCost);
    const invoiceNumber = await generateInvoiceNumber();

    const payment = await Payment.create({
      invoiceNumber,
      jobId,
      customerId,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      vehicleRegistration,
      serviceType,
      laborCost: parseFloat(laborCost),
      partsCost: parseFloat(partsCost),
      totalAmount,
      status: 'pending'
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ error: 'Failed to create invoice', details: err.message });
  }
});

// GET /api/payments/customer/:customerId — BEFORE /:id
router.get('/customer/:customerId', authenticate, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { customerId: req.params.customerId },
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
});

// GET /api/payments/job/:jobId — BEFORE /:id
router.get('/job/:jobId', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { jobId: req.params.jobId }
    });
    if (!payment) return res.status(404).json({ error: 'No payment found for this job' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment', details: err.message });
  }
});

// GET /api/payments/:id — called by Frontend
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment', details: err.message });
  }
});

module.exports = router;
