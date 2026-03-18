const Joi = require('joi');

const createJobSchema = Joi.object({
  appointmentId: Joi.number().integer().required(),
  vehicleId: Joi.number().integer().required(),
  customerId: Joi.number().integer().required(),
  serviceType: Joi.string().required(),
  issueDescription: Joi.string().optional().allow(''),
});

const assignJobSchema = Joi.object({
  mechanicId: Joi.number().integer().required(),
});

const progressSchema = Joi.object({
  workDescription: Joi.string().optional().allow(''),
  sparePartsUsed: Joi.string().optional().allow(''),
  partsCost: Joi.number().min(0).optional(),
  laborCost: Joi.number().min(0).optional(),
  status: Joi.string().valid(
    'in_progress', 'waiting_parts'
  ).optional(),
});

const completeJobSchema = Joi.object({
  workDescription: Joi.string().required(),
  sparePartsUsed: Joi.string().optional().allow(''),
  partsCost: Joi.number().min(0).required(),
  laborCost: Joi.number().min(0).required(),
});

module.exports = {
  createJobSchema,
  assignJobSchema,
  progressSchema,
  completeJobSchema
};
