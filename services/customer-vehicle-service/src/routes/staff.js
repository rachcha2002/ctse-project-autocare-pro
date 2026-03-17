const express = require('express');
const { Staff } = require('../models');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/staff/mechanics
// Called by Job Service to get list of mechanics for assignment
// No auth required — internal service call
router.get('/mechanics', async (req, res) => {
  try {
    const mechanics = await Staff.findAll({
      where: { role: 'mechanic' },
      attributes: ['id', 'fullName', 'phone', 'email', 'role']
    });
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mechanics', details: err.message });
  }
});

// GET /api/staff/:id
// Called by Job Service to get mechanic details
// No auth required — internal service call
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      attributes: ['id', 'fullName', 'phone', 'email', 'role']
    });
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff', details: err.message });
  }
});

// GET /api/staff
// Admin only — get all staff
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const staff = await Staff.findAll({
      attributes: ['id', 'fullName', 'phone', 'email', 'role', 'createdAt']
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff', details: err.message });
  }
});

module.exports = router;
