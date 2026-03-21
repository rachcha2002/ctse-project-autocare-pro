// Additional tests for Job Service — assign, start, progress, complete flows
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
    req.user = { userId: 1, email: 'mechanic@test.com', role: 'mechanic', type: 'staff' };
    next();
  },
  adminOnly: (req, res, next) => next(),
  staffOnly: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../src/app');

// ---- GET vehicle jobs ----
describe('Job — GET by vehicle', () => {
  it('returns empty array when no jobs for vehicle', async () => {
    const { Job } = require('../src/models');
    Job.findAll.mockResolvedValue([]);
    const res = await request(app).get('/api/jobs/vehicle/1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('returns jobs for a vehicle', async () => {
    const { Job } = require('../src/models');
    Job.findAll.mockResolvedValue([
      { id: 1, vehicleId: 1, status: 'completed' },
      { id: 2, vehicleId: 1, status: 'in_progress' },
    ]);
    const res = await request(app).get('/api/jobs/vehicle/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

// ---- Assign mechanic ----
describe('Job — PATCH /:id/assign', () => {
  it('returns 404 when job not found', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/jobs/9999/assign')
      .send({ mechanicId: 2 });
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when mechanicId is missing', async () => {
    const res = await request(app)
      .patch('/api/jobs/1/assign')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('assigns mechanic successfully', async () => {
    const { Job } = require('../src/models');
    const cvClient = require('../src/services/cvClient');
    Job.findByPk.mockResolvedValue({
      id: 1, status: 'created', assignedMechanic: null,
      update: jest.fn().mockResolvedValue({ id: 1, assignedMechanic: 2, status: 'pending' }),
    });
    cvClient.getMechanic.mockResolvedValue({ id: 2, fullName: 'Mechanic One', role: 'mechanic' });
    const res = await request(app)
      .patch('/api/jobs/1/assign')
      .send({ mechanicId: 2 });
    expect(res.statusCode).toBe(200);
  });
});

// ---- Start job ----
describe('Job — PATCH /:id/start', () => {
  it('returns 404 when job not found', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue(null);
    const res = await request(app).patch('/api/jobs/9999/start');
    expect(res.statusCode).toBe(404);
  });

  it('returns 400 when no mechanic assigned', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue({
      id: 1, status: 'created', assignedMechanic: null,
    });
    const res = await request(app).patch('/api/jobs/1/start');
    expect(res.statusCode).toBe(400);
  });

  it('starts job and updates appointment status', async () => {
    const { Job } = require('../src/models');
    const appointmentClient = require('../src/services/appointmentClient');
    Job.findByPk.mockResolvedValue({
      id: 1, status: 'pending', assignedMechanic: 2, appointmentId: 1,
      update: jest.fn().mockResolvedValue({ id: 1, status: 'in_progress' }),
    });
    appointmentClient.updateAppointmentStatus.mockResolvedValue({});
    const res = await request(app).patch('/api/jobs/1/start');
    expect(res.statusCode).toBe(200);
  });
});

// ---- Update progress ----
describe('Job — PUT /:id/progress', () => {
  it('returns 404 when job not found', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/jobs/9999/progress')
      .send({ workDescription: 'Replacing oil' });
    expect(res.statusCode).toBe(404);
  });

  it('updates progress successfully', async () => {
    const { Job } = require('../src/models');
    Job.findByPk.mockResolvedValue({
      id: 1, status: 'in_progress',
      update: jest.fn().mockResolvedValue({
        id: 1, status: 'in_progress', workDescription: 'Replacing oil filter'
      }),
    });
    const res = await request(app)
      .put('/api/jobs/1/progress')
      .send({ workDescription: 'Replacing oil filter', partsCost: 500, laborCost: 1000 });
    expect(res.statusCode).toBe(200);
  });
});

// ---- Mechanics list ----
describe('Job — GET /mechanics/list', () => {
  it('returns mechanics list from CV service', async () => {
    const cvClient = require('../src/services/cvClient');
    cvClient.getMechanics.mockResolvedValue([
      { id: 2, fullName: 'Mechanic One', role: 'mechanic' }
    ]);
    const res = await request(app).get('/api/jobs/mechanics/list');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
