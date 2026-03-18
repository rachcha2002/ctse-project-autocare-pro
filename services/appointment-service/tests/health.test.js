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
    create: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock inter-service clients
jest.mock('../src/services/cvClient', () => ({
  getCustomer: jest.fn(),
  getVehicle: jest.fn(),
  updateVehicleStatus: jest.fn(),
}));

jest.mock('../src/services/jobClient', () => ({
  createJob: jest.fn(),
}));

// Mock auth middleware to avoid calling CV service in tests
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

describe('Health check', () => {
  it('GET /health returns 200 with ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('appointment-service');
  });
});

describe('Appointment routes — validation', () => {
  it('POST /api/appointments with empty body returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/appointments with past date returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        customerId: 1,
        vehicleId: 1,
        appointmentDate: '2020-01-01T10:00:00',
        serviceType: 'Oil Change'
      });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/appointments with invalid service type returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        customerId: 1,
        vehicleId: 1,
        appointmentDate: new Date(Date.now() + 86400000).toISOString(),
        serviceType: 'Invalid Service'
      });
    expect(res.statusCode).toBe(400);
  });
});

describe('Appointment routes — status update', () => {
  it('PATCH /api/appointments/:id/status with invalid status returns 400', async () => {
    const res = await request(app)
      .patch('/api/appointments/1/status')
      .send({ status: 'invalid_status' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Appointment routes — available slots', () => {
  it('GET /api/appointments/available without date returns 400', async () => {
    const res = await request(app).get('/api/appointments/available');
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/appointments/available with valid date returns slots', async () => {
    const { Appointment } = require('../src/models');
    Appointment.findAll.mockResolvedValue([]);
    const res = await request(app)
      .get('/api/appointments/available?date=2026-12-25');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.availableSlots)).toBe(true);
  });
});
