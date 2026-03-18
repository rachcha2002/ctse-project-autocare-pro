const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  customerId: Joi.number().integer().required(),
  vehicleId: Joi.number().integer().required(),
  appointmentDate: Joi.date().iso().greater('now').required(),
  serviceType: Joi.string().valid(
    'Full Service',
    'Oil Change',
    'Brake Check',
    'Tyre Rotation',
    'Engine Diagnostic',
    'Air Filter Replacement',
    'Battery Check',
    'General Repair'
  ).required(),
  notes: Joi.string().optional().allow(''),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending',
    'confirmed',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled'
  ).required()
});

module.exports = { createAppointmentSchema, updateStatusSchema };
