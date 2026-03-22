// Comprehensive customer routes tests for better coverage

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
const adminToken = jwt.sign({ userId: 1, email: 'admin@test.com', role: 'admin' }, process.env.JWT_SECRET);
const customerToken = jwt.sign({ userId: 1, email: 'customer@test.com', role: 'customer' }, process.env.JWT_SECRET);

describe('Customers Routes - GET all', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/customers returns list of customers', async () => {
    const { Customer } = require('../src/models');
    Customer.findAll.mockResolvedValue([
      { id: 1, fullName: 'Customer 1', email: 'c1@test.com' },
      { id: 2, fullName: 'Customer 2', email: 'c2@test.com' },
    ]);

    const res = await request(app).get('/api/customers');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('GET /api/customers with database error returns 500', async () => {
    const { Customer } = require('../src/models');
    Customer.findAll.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/customers');

    expect(res.statusCode).toBe(500);
  });
});

describe('Customers Routes - GET by ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/customers/:id with database error returns 500', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/customers/1');

    expect(res.statusCode).toBe(500);
  });
});

describe('Customers Routes - PUT update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /api/customers/:id updates customer successfully', async () => {
    const { Customer } = require('../src/models');
    const mockCustomer = {
      id: 1,
      fullName: 'Updated Name',
      email: 'updated@test.com',
      update: jest.fn().mockResolvedValue(true),
    };

    Customer.findByPk
      .mockResolvedValueOnce(mockCustomer)
      .mockResolvedValueOnce({
        id: 1,
        fullName: 'Updated Name',
        email: 'updated@test.com',
      });

    const res = await request(app)
      .put('/api/customers/1')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(200);
  });

  it('PUT /api/customers/:id returns 404 when not found', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/customers/999')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/customers/:id without token returns 401', async () => {
    const res = await request(app)
      .put('/api/customers/1')
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(401);
  });

  it('PUT /api/customers/:id with database error returns 500', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put('/api/customers/1')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(500);
  });
});

describe('Customers Routes - PATCH spending', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PATCH /api/customers/:id/spending with database error returns 500', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .patch('/api/customers/1/spending')
      .send({ amount: 1000 });

    expect(res.statusCode).toBe(500);
  });
});
