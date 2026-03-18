const express = require('express');
const { Customer, Vehicle } = require('../models');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateCustomerSchema, updateSpendingSchema } = require('../utils/validationSchemas');

const router = express.Router();

// GET /api/customers/:id — called by Appointment Service and Payment Service
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Vehicle, as: 'vehicles' }]
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer', details: err.message });
  }
});

// PUT /api/customers/:id — protected, frontend only
router.put('/:id', authenticate, validate(updateCustomerSchema), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    await customer.update(req.body);
    const updated = await Customer.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer', details: err.message });
  }
});

// PATCH /api/customers/:id/spending — called by Payment Service (no auth needed for internal call)
router.patch('/:id/spending', validate(updateSpendingSchema), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    await customer.increment({ totalSpent: req.body.amount, totalServices: 1 });
    await customer.reload();

    res.json({
      id: customer.id,
      totalSpent: customer.totalSpent,
      totalServices: customer.totalServices
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update spending', details: err.message });
  }
});

module.exports = router;
