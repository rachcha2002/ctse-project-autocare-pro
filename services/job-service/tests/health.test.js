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
  Job: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock inter-service clients
jest.mock('../src/services/cvClient', () => ({
  getMechanics: jest.fn(),
  getMechanic: jest.fn(),
  updateVehicleService: jest.fn(),
}));

jest.mock('../src/services/appointmentClient', () => ({
  updateAppointmentStatus: jest.fn(),
  getAppointment: jest.fn(),
}));

jest.mock('../src/services/paymentClient', () => ({
  createInvoice: jest.fn(),
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
    expect(res.body.service).toBe('job-service');
  });
});

describe('Job routes — validation', () => {
  it('POST /api/jobs with empty body returns 400', async () => {
    const res = await request(app).post('/api/jobs').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/jobs without appointmentId returns 400', async () => {
    const res = await request(app).post('/api/jobs').send({
      vehicleId: 1,
      customerId: 1,
      serviceType: 'Oil Change',
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('Job routes — assign validation', () => {
  it('PATCH /api/jobs/:id/assign without mechanicId returns 400', async () => {
    const res = await request(app).patch('/api/jobs/1/assign').send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('Job routes — complete validation', () => {
  it('PATCH /api/jobs/:id/complete without required fields returns 400', async () => {
    const res = await request(app).patch('/api/jobs/1/complete').send({});
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/jobs/:id/complete without workDescription returns 400', async () => {
    const res = await request(app).patch('/api/jobs/1/complete').send({
      partsCost: 100,
      laborCost: 50,
    });
    expect(res.statusCode).toBe(400);
  });
});
