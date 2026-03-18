const Joi = require('joi');

const createInvoiceSchema = Joi.object({
  jobId: Joi.number().integer().required(),
  customerId: Joi.number().integer().required(),
  laborCost: Joi.number().min(0).required(),
  partsCost: Joi.number().min(0).required(),
  serviceType: Joi.string().required(),
});

const processPaymentSchema = Joi.object({
  paymentMethod: Joi.string().valid('cash', 'card').required(),
});

module.exports = { createInvoiceSchema, processPaymentSchema };
