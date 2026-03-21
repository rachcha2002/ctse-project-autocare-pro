// Additional tests for Appointment Service — confirm, cancel, customer list routes
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
  Appointment: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
}));

jest.mock('../src/services/cvClient', () => ({
  getCustomer: jest.fn(),
  getVehicle: jest.fn(),
  updateVehicleStatus: jest.fn(),
}));

jest.mock('../src/services/jobClient', () => ({
  createJob: jest.fn(),
}));

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, email: 'test@test.com', role: 'customer' };
    next();
  },
  adminOnly: (req, res, next) => {
    req.user = { userId: 1, email: 'admin@test.com', role: 'admin' };
    next();
  },
  staffOnly: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../src/app');

// ---- GET by ID ----
describe('Appointment — GET /:id', () => {
  it('returns 200 when appointment found', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue({
      id: 1, customerId: 1, vehicleId: 1,
      serviceType: 'Oil Change', status: 'pending',
      appointmentDate: new Date(Date.now() + 86400000).toISOString(),
    });
    const res = await request(app).get('/api/appointments/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('returns 404 when appointment not found', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/appointments/9999');
    expect(res.statusCode).toBe(404);
  });
});

// ---- GET by Customer ----
describe('Appointment — GET /customer/:id', () => {
  it('returns list of customer appointments', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findAll.mockResolvedValue([
      { id: 1, customerId: 1, serviceType: 'Oil Change', status: 'pending' },
      { id: 2, customerId: 1, serviceType: 'Brake Service', status: 'completed' },
    ]);
    const res = await request(app).get('/api/appointments/customer/1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});

// ---- Confirm Appointment ----
describe('Appointment — PATCH /:id/confirm', () => {
  it('returns 404 when appointment not found', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/appointments/9999/confirm');
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when appointment is already confirmed', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue({
      id: 1, status: 'confirmed', customerId: 1, vehicleId: 1,
      serviceType: 'Oil Change',
    });
    const res = await request(app).patch('/api/appointments/1/confirm');
    expect(res.statusCode).toBe(400);
  });

  it('confirms pending appointment and creates job', async () => {
    const { Appointment } = require('../src/models');
    const cvClient = require('../src/services/cvClient');
    const jobClient = require('../src/services/jobClient');

    Appointment.findByPk.mockResolvedValue({
      id: 1, status: 'pending', customerId: 1, vehicleId: 1,
      serviceType: 'Oil Change',
      update: jest.fn().mockResolvedValue({ id: 1, status: 'confirmed' }),
    });
    cvClient.updateVehicleStatus.mockResolvedValue({});
    jobClient.createJob.mockResolvedValue({ id: 10, status: 'created' });

    const res = await request(app).patch('/api/appointments/1/confirm');
    expect(res.statusCode).toBe(200);
  });
});

// ---- Cancel Appointment ----
describe('Appointment — DELETE /:id', () => {
  it('returns 404 when appointment not found', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue(null);
    const res = await request(app).delete('/api/appointments/9999');
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when try to cancel a completed appointment', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue({
      id: 1, status: 'completed',
    });
    const res = await request(app).delete('/api/appointments/1');
    expect(res.statusCode).toBe(400);
  });

  it('cancels a pending appointment successfully', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue({
      id: 1, status: 'pending',
      update: jest.fn().mockResolvedValue({ id: 1, status: 'cancelled' }),
    });
    const res = await request(app).delete('/api/appointments/1');
    expect(res.statusCode).toBe(200);
  });
});

// ---- Status update (internal) ----
describe('Appointment — PATCH /:id/status', () => {
  it('updates status successfully', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findByPk.mockResolvedValue({
      id: 1, status: 'confirmed',
      update: jest.fn().mockResolvedValue({ id: 1, status: 'in_progress' }),
    });
    const res = await request(app)
      .patch('/api/appointments/1/status')
      .send({ status: 'in_progress' });
    expect(res.statusCode).toBe(200);
  });
});
