jest.mock('../src/config/database', () => ({
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  define: jest.fn().mockReturnValue({}),
}));

jest.mock('../src/models', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
  },
  Payment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    update: jest.fn(),
  },
}));

jest.mock('../src/services/jobClient', () => ({
  getJob: jest.fn(),
}));

jest.mock('../src/services/cvClient', () => ({
  getCustomer: jest.fn(),
  getVehicle: jest.fn(),
  updateCustomerSpending: jest.fn(),
}));

jest.mock('../src/utils/invoiceGenerator', () => ({
  generateInvoiceNumber: jest.fn().mockResolvedValue('INV-20260318-0001'),
}));

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, email: 'admin@test.com', role: 'admin', type: 'staff' };
    next();
  },
  adminOnly: (req, res, next) => next(),
  staffOnly: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('payment-service');
  });
});

describe('Invoice creation', () => {
  it('POST /api/payments/invoice with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/payments/invoice')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/payments/invoice creates invoice when job and customer exist', async () => {
    const { Payment } = require('../src/models');
    const jobClient = require('../src/services/jobClient');
    const cvClient = require('../src/services/cvClient');

    Payment.findOne.mockResolvedValue(null);
    jobClient.getJob.mockResolvedValue({
      id: 1, vehicleId: 1, customerId: 1,
      serviceType: 'Full Service', laborCost: 2000, partsCost: 1500
    });
    cvClient.getCustomer.mockResolvedValue({
      id: 1, fullName: 'Nimal Perera', phone: '0712345678'
    });
    cvClient.getVehicle.mockResolvedValue({
      id: 1, registrationNumber: 'CAB-1234'
    });
    Payment.create.mockResolvedValue({
      id: 1, invoiceNumber: 'INV-20260318-0001',
      totalAmount: 3500, status: 'pending'
    });

    const res = await request(app)
      .post('/api/payments/invoice')
      .send({
        jobId: 1, customerId: 1,
        laborCost: 2000, partsCost: 1500,
        serviceType: 'Full Service'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  it('POST /api/payments/invoice returns 409 for duplicate job', async () => {
    const { Payment } = require('../src/models');
    Payment.findOne.mockResolvedValue({ id: 1, jobId: 1 });
    const res = await request(app)
      .post('/api/payments/invoice')
      .send({
        jobId: 1, customerId: 1,
        laborCost: 2000, partsCost: 1500,
        serviceType: 'Oil Change'
      });
    expect(res.statusCode).toBe(409);
  });
});

describe('Payment processing', () => {
  it('POST /api/payments/:id/pay with invalid method returns 400', async () => {
    const res = await request(app)
      .post('/api/payments/1/pay')
      .send({ paymentMethod: 'bitcoin' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/payments/:id/pay returns 404 when payment not found', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/payments/99/pay')
      .send({ paymentMethod: 'cash' });
    expect(res.statusCode).toBe(404);
  });
});

describe('Read routes', () => {
  it('GET /api/payments/:id returns 404 when not found', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/payments/99999');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/payments/job/:jobId returns 404 when no payment', async () => {
    const { Payment } = require('../src/models');
    Payment.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/payments/job/99');
    expect(res.statusCode).toBe(404);
  });
});
