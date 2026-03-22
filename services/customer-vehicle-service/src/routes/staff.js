const express = require('express');
const bcrypt = require('bcrypt');
const { Staff } = require('../models');
const { authenticate, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createStaffSchema, updateStaffSchema } = require('../utils/validationSchemas');

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
      attributes: ['id', 'fullName', 'phone', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff', details: err.message });
  }
});

// POST /api/staff
router.post('/', authenticate, adminOnly, validate(createStaffSchema), async (req, res) => {
  try {
    const { fullName, phone, email, password, role } = req.body;
    const existing = await Staff.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered to a staff member' });

    const passwordHash = await bcrypt.hash(password, 12);
    const staff = await Staff.create({ fullName, phone, email, passwordHash, role });

    res.status(201).json({ id: staff.id, fullName, email, phone, role });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate staff account', details: err.message });
  }
});

// PUT /api/staff/:id
router.put('/:id', authenticate, adminOnly, validate(updateStaffSchema), async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });

    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 12);
      delete updates.password;
    }

    await staff.update(updates);
    res.json({ id: staff.id, fullName: staff.fullName, email: staff.email, role: staff.role });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff member', details: err.message });
  }
});

// DELETE /api/staff/:id
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff member not found' });
    
    // Optional: Prevent deleting the super admin or self, out of scope for now but standard
    await staff.destroy();
    res.json({ message: 'Staff successfully removed from the platform' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove staff', details: err.message });
  }
});

module.exports = router;
