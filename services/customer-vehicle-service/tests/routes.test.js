// Additional tests for Customer & Vehicle Service — registration, vehicles, and customer routes
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
  Customer: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    increment: jest.fn(),
  },
  Staff: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Vehicle: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  VehicleServiceHistory: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
const validToken = jwt.sign({ id: 1, role: 'customer' }, process.env.JWT_SECRET);

// ---- Auth: Register ----
describe('Auth — register validation', () => {
  it('POST /api/auth/register with missing password returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Nimal Perera',
      phone: '0712345678',
      email: 'nimal@example.com',
    });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/register with duplicate email returns 409', async () => {
    const { Customer } = require('../src/models');
    const bcrypt = require('bcrypt');
    Customer.findOne.mockResolvedValue({ id: 1, email: 'nimal@example.com' });
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Nimal',
      phone: '0712345679',
      email: 'nimal@example.com',
      password: 'Password123!',
    });
    expect(res.statusCode).toBe(409);
  });

  it('POST /api/auth/register with valid data returns 201 and token', async () => {
    const { Customer } = require('../src/models');
    Customer.findOne.mockResolvedValue(null);
    Customer.create.mockResolvedValue({
      id: 1, fullName: 'Nimal Perera', email: 'nimal@example.com',
      phone: '0712345678', role: 'customer',
    });
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Nimal Perera',
      phone: '0712345678',
      email: 'nimal@example.com',
      password: 'Password123!',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});

// ---- Customers routes ----
describe('Customers — GET /:id', () => {
  it('GET /api/customers/:id returns 200 when customer found', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockResolvedValue({
      id: 1, fullName: 'Nimal Perera', email: 'nimal@example.com', vehicles: [],
    });
    const res = await request(app).get('/api/customers/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('GET /api/customers/:id returns 404 when not found', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/customers/9999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Customers — spending update', () => {
  it('PATCH /api/customers/:id/spending returns 404 when customer not found', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockResolvedValue(null);
    const res = await request(app)
      .patch('/api/customers/9999/spending')
      .send({ amount: 3500 });
    expect(res.statusCode).toBe(404);
  });

  it('PATCH /api/customers/:id/spending with missing amount returns 400', async () => {
    const res = await request(app)
      .patch('/api/customers/1/spending')
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('PATCH /api/customers/:id/spending updates successfully', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockResolvedValue({
      id: 1,
      increment: jest.fn().mockResolvedValue(true),
      reload: jest.fn().mockResolvedValue(true),
      totalSpent: 7000,
      totalServices: 2,
    });
    const res = await request(app)
      .patch('/api/customers/1/spending')
      .send({ amount: 3500 });
    expect(res.statusCode).toBe(200);
  });
});

// ---- Vehicles ----
describe('Vehicles — GET by customer', () => {
  it('GET /api/vehicles/customer/:id returns vehicle list', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findAll.mockResolvedValue([
      { id: 1, registrationNumber: 'CAB-1234', make: 'Toyota', model: 'Prius' }
    ]);
    const res = await request(app).get('/api/vehicles/customer/1')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Vehicles — GET /:id', () => {
  it('GET /api/vehicles/:id returns 200 when found', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockResolvedValue({
      id: 1, registrationNumber: 'CAB-1234', status: 'active'
    });
    const res = await request(app).get('/api/vehicles/1');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/vehicles/:id returns 404 when not found', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockResolvedValue(null);
    const res = await request(app).get('/api/vehicles/9999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Vehicles — POST register', () => {
  it('POST /api/vehicles without token returns 401', async () => {
    const res = await request(app).post('/api/vehicles').send({
      customerId: 1,
      registrationNumber: 'CAB-5678',
      make: 'Toyota',
      model: 'Prius',
      year: 2022,
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/vehicles with missing required fields returns 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ customerId: 1 });
    expect(res.statusCode).toBe(400);
  });
});

describe('Vehicles — service history', () => {
  it('GET /api/vehicles/:id/history returns history array', async () => {
    const { VehicleServiceHistory } = require('../src/models');
    VehicleServiceHistory.findAll.mockResolvedValue([
      { id: 1, vehicleId: 1, serviceType: 'Oil Change', serviceDate: '2026-01-01' }
    ]);
    const res = await request(app)
      .get('/api/vehicles/1/history')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
