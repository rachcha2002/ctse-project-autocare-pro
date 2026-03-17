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
  Customer: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    increment: jest.fn(),
  },
  Vehicle: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  VehicleServiceHistory: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const request = require('supertest');
const app = require('../src/app');

describe('Health check', () => {
  it('GET /health returns 200 with ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('customer-vehicle-service');
  });
});

describe('Auth routes', () => {
  it('GET /api/auth/validate without token returns 401', async () => {
    const res = await request(app).get('/api/auth/validate');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/login with empty body returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/register with invalid email returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test',
      phone: '0712345678',
      email: 'not-an-email',
      password: 'password123'
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('Vehicle routes', () => {
  it('POST /api/vehicles without token returns 401', async () => {
    const res = await request(app).post('/api/vehicles').send({
      customerId: 1,
      registrationNumber: 'CAB-1234'
    });
    expect(res.statusCode).toBe(401);
  });
});
