// Additional tests for Payment Service — customer payments, pay flow, receipt, cancel
// These extend the existing health.test.js tests

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
  generateInvoiceNumber: jest.fn().mockResolvedValue('INV-20260320-0001'),
}));

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, email: 'customer@test.com', role: 'customer' };
    next();
  },
  adminOnly: (req, res, next) => next(),
  staffOnly: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../src/app');

// ---- GET by customer ----
describe('Payment — GET /customer/:id', () => {
  it('returns payment list for a customer', async () => {
    const { Payment } = require('../src/models');
    Payment.findAll.mockResolvedValue([
      { id: 1, customerId: 1, invoiceNumber: 'INV-001', totalAmount: 3500, status: 'paid' },
    ]);
    const res = await request(app).get('/api/payments/customer/1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('returns empty array when no payments for customer', async () => {
    const { Payment } = require('../src/models');
    Payment.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/payments/customer/999');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});

// ---- GET /:id ----
describe('Payment — GET /:id', () => {
  it('returns 200 when payment found', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue({
      id: 1, invoiceNumber: 'INV-001', totalAmount: 3500, status: 'pending',
    });
    const res = await request(app).get('/api/payments/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.invoiceNumber).toBe('INV-001');
  });
});

// ---- Process payment ----
describe('Payment — POST /:id/pay', () => {
  it('returns 400 when invoice already paid', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue({
      id: 1, status: 'paid', totalAmount: 3500,
    });
    const res = await request(app)
      .post('/api/payments/1/pay')
      .send({ paymentMethod: 'cash' });
    expect(res.statusCode).toBe(400);
  });

  it('processes payment successfully', async () => {
    const { Payment } = require('../src/models');
    const cvClient = require('../src/services/cvClient');
    Payment.findByPk.mockResolvedValue({
      id: 1, status: 'pending', totalAmount: 3500, customerId: 1,
      update: jest.fn().mockResolvedValue({
        id: 1, status: 'paid', paymentMethod: 'cash',
        paidAt: new Date().toISOString(), totalAmount: 3500,
      }),
    });
    cvClient.updateCustomerSpending.mockResolvedValue({});
    const res = await request(app)
      .post('/api/payments/1/pay')
      .send({ paymentMethod: 'cash' });
    expect(res.statusCode).toBe(200);
  });
});

// ---- Receipt ----
describe('Payment — GET /:id/receipt', () => {
  it('returns 400 when invoice is still pending', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue({ id: 1, status: 'pending' });
    const res = await request(app).get('/api/payments/1/receipt');
    expect(res.statusCode).toBe(400);
  });

  it('returns receipt for paid invoice', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue({
      id: 1, status: 'paid', invoiceNumber: 'INV-001',
      customerName: 'Nimal Perera', customerPhone: '0712345678',
      vehicleRegistration: 'CAB-1234', serviceType: 'Oil Change',
      laborCost: 2000, partsCost: 1500, totalAmount: 3500,
      paymentMethod: 'cash', paidAt: new Date().toISOString(),
    });
    const res = await request(app).get('/api/payments/1/receipt');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('invoiceNumber');
  });
});

// ---- Cancel ----
describe('Payment — PATCH /:id/cancel', () => {
  it('returns 404 when payment not found', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/payments/9999/cancel');
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when trying to cancel a paid invoice', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue({ id: 1, status: 'paid' });
    const res = await request(app).patch('/api/payments/1/cancel');
    expect(res.statusCode).toBe(400);
  });

  it('cancels pending invoice successfully', async () => {
    const { Payment } = require('../src/models');
    Payment.findByPk.mockResolvedValue({
      id: 1, status: 'pending',
      update: jest.fn().mockResolvedValue({ id: 1, status: 'cancelled' }),
    });
    const res = await request(app).patch('/api/payments/1/cancel');
    expect(res.statusCode).toBe(200);
  });
});

// ---- Admin list all ----
describe('Payment — GET / (admin)', () => {
  it('returns all payments for admin', async () => {
    const { Payment } = require('../src/models');
    Payment.findAll.mockResolvedValue([
      { id: 1, status: 'paid', totalAmount: 3500 },
      { id: 2, status: 'pending', totalAmount: 2000 },
    ]);
    const res = await request(app).get('/api/payments');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
