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

const stripePaySchema = Joi.object({
  cardNumber: Joi.string().required(),
  expiry: Joi.string().required(),
  cvv: Joi.string().required(),
  cardHolder: Joi.string().required(),
});

module.exports = { createInvoiceSchema, processPaymentSchema, stripePaySchema };
