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

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { userId: 1, email: 'test@test.com', role: 'admin', type: 'staff' };
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
    expect(res.body.service).toBe('job-service');
  });
});

describe('Job routes — create', () => {
  it('POST /api/jobs with empty body returns 400', async () => {
    const res = await request(app).post('/api/jobs').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/jobs with valid data creates job', async () => {
    const { Job } = require('../src/models');
    Job.findOne.mockResolvedValue(null);
    Job.create.mockResolvedValue({
      id: 1, appointmentId: 1, vehicleId: 1,
      customerId: 1, serviceType: 'Full Service', status: 'created'
    });
    const res = await request(app).post('/api/jobs').send({
      appointmentId: 1, vehicleId: 1,
      customerId: 1, serviceType: 'Full Service'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('created');
  });

  it('POST /api/jobs with duplicate appointmentId returns 409', async () => {
    const { Job } = require('../src/models');
    Job.findOne.mockResolvedValue({ id: 1, appointmentId: 1 });
    const res = await request(app).post('/api/jobs').send({
      appointmentId: 1, vehicleId: 1,
      customerId: 1, serviceType: 'Oil Change'
    });
    expect(res.statusCode).toBe(409);
  });
});

describe('Job routes — read', () => {
  it('GET /api/jobs/:id returns 404 when not found', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/jobs/99999');
    expect(res.statusCode).toBe(404);
  });

  it('GET /api/jobs/:id returns job when found', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue({ id: 1, status: 'created' });
    const res = await request(app).get('/api/jobs/1');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/jobs/appointment/:id returns 404 when no job', async () => {
    const { Job } = require('../src/models');
    Job.findOne.mockResolvedValue(null);
    const res = await request(app).get('/api/jobs/appointment/99');
    expect(res.statusCode).toBe(404);
  });
});

describe('Job routes — complete validation', () => {
  it('PATCH /api/jobs/:id/complete with empty body returns 400', async () => {
    const res = await request(app)
      .patch('/api/jobs/1/complete')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/jobs/:id/complete on non-existent job returns 404', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/jobs/99/complete')
      .send({ workDescription: 'Done', partsCost: 0, laborCost: 5000 });
    expect(res.statusCode).toBe(404);
  });
});
