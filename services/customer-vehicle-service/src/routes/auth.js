const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Customer } = require('../models');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validationSchemas');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { fullName, phone, email, password, address, nic } = req.body;

    const existingEmail = await Customer.findOne({ where: { email } });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered' });

    const existingPhone = await Customer.findOne({ where: { phone } });
    if (existingPhone) return res.status(409).json({ error: 'Phone already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const customer = await Customer.create({
      fullName, phone, email, passwordHash, address, nic
    });

    // Fire and forget — never fail registration if notification is down
    try {
      if (process.env.NOTIFICATION_SERVICE_URL) {
        await axios.post(
          `${process.env.NOTIFICATION_SERVICE_URL}/api/notify/welcome`,
          { customerId: customer.id, email, name: fullName },
          { timeout: 3000 }
        );
      }
    } catch (notifyErr) {
      console.log('Notification service unavailable — continuing without notification');
    }

    const token = jwt.sign(
      { userId: customer.id, email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      customer: { id: customer.id, fullName, email, phone }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: customer.id, email, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email,
        phone: customer.phone
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/auth/validate — called by Appointment, Job, Payment services
router.get('/validate', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
