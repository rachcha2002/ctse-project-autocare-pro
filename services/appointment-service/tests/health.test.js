// Mock database before any imports
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
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
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

describe('Appointment routes', () => {
  it('GET /api/appointments/available without date returns 400', async () => {
    const res = await request(app).get('/api/appointments/available');
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/appointments/:id/status with invalid status returns 400', async () => {
    const res = await request(app)
      .patch('/api/appointments/1/status')
      .send({ status: 'invalid_status' });
    expect(res.statusCode).toBe(400);
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Route not found');
  });
});
