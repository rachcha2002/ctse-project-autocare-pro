const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  address: Joi.string().optional().allow(''),
  nic: Joi.string().optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const vehicleSchema = Joi.object({
  customerId: Joi.number().integer().required(),
  registrationNumber: Joi.string().required(),
  brand: Joi.string().optional().allow(''),
  model: Joi.string().optional().allow(''),
  year: Joi.number().integer().min(1900).max(2100).optional(),
  fuelType: Joi.string().optional().allow(''),
  currentMileage: Joi.number().integer().min(0).optional(),
});

const updateVehicleSchema = Joi.object({
  brand: Joi.string().optional(),
  model: Joi.string().optional(),
  year: Joi.number().integer().optional(),
  fuelType: Joi.string().optional(),
  currentMileage: Joi.number().integer().optional(),
  status: Joi.string().valid('active', 'in_service', 'inactive').optional(),
});

const updateCustomerSchema = Joi.object({
  fullName: Joi.string().optional(),
  phone: Joi.string().optional(),
  address: Joi.string().optional().allow(''),
  nic: Joi.string().optional().allow(''),
});

const updateSpendingSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

const serviceUpdateSchema = Joi.object({
  jobId: Joi.number().integer().optional(),
  paymentId: Joi.number().integer().optional(),
  serviceType: Joi.string().optional(),
  summary: Joi.string().optional(),
  amountPaid: Joi.number().optional(),
});

module.exports = {
  registerSchema, loginSchema, vehicleSchema,
  updateVehicleSchema, updateCustomerSchema,
  updateSpendingSchema, serviceUpdateSchema
};
