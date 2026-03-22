// Comprehensive auth route tests for better coverage

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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Auth Routes - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/login with valid credentials returns token', async () => {
    const { Customer } = require('../src/models');
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    Customer.findOne.mockResolvedValue({
      id: 1,
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '0771234567',
      passwordHash: hashedPassword,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('customer');
  });

  it('POST /api/auth/login with wrong password returns 401', async () => {
    const { Customer } = require('../src/models');
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    Customer.findOne.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      passwordHash: hashedPassword,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword!',
      });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/login with non-existent email returns 404', async () => {
    const { Customer } = require('../src/models');
    Customer.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'notfound@example.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(404);
  });

  it('POST /api/auth/login with database error returns 500', async () => {
    const { Customer } = require('../src/models');
    Customer.findOne.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(500);
  });
});

describe('Auth Routes - Staff Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/staff/login with valid credentials returns token', async () => {
    const { Staff } = require('../src/models');
    const hashedPassword = await bcrypt.hash('Admin@2026', 12);

    Staff.findOne.mockResolvedValue({
      id: 1,
      fullName: 'Admin User',
      email: 'admin@autocare.com',
      role: 'admin',
      passwordHash: hashedPassword,
    });

    const res = await request(app)
      .post('/api/auth/staff/login')
      .send({
        email: 'admin@autocare.com',
        password: 'Admin@2026',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.staff.role).toBe('admin');
  });

  it('POST /api/auth/staff/login with wrong password returns 401', async () => {
    const { Staff } = require('../src/models');
    const hashedPassword = await bcrypt.hash('Admin@2026', 12);

    Staff.findOne.mockResolvedValue({
      id: 1,
      email: 'admin@autocare.com',
      passwordHash: hashedPassword,
    });

    const res = await request(app)
      .post('/api/auth/staff/login')
      .send({
        email: 'admin@autocare.com',
        password: 'WrongPassword!',
      });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/staff/login with non-existent staff returns 404', async () => {
    const { Staff } = require('../src/models');
    Staff.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/staff/login')
      .send({
        email: 'notfound@autocare.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(404);
  });

  it('POST /api/auth/staff/login with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findOne.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/auth/staff/login')
      .send({
        email: 'admin@autocare.com',
        password: 'Admin@2026',
      });

    expect(res.statusCode).toBe(500);
  });
});

describe('Auth Routes - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register with duplicate phone returns 409', async () => {
    const { Customer } = require('../src/models');
    // First call for email check returns null (email not taken)
    // Second call for phone check returns existing customer (phone taken)
    Customer.findOne
      .mockResolvedValueOnce(null) // email check
      .mockResolvedValueOnce({ id: 1, phone: '0771234567' }); // phone check

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        phone: '0771234567',
        email: 'new@example.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toContain('Phone');
  });

  it('POST /api/auth/register with database error returns 500', async () => {
    const { Customer } = require('../src/models');
    Customer.findOne.mockResolvedValue(null);
    Customer.create.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        phone: '0771234567',
        email: 'test@example.com',
        password: 'Password123!',
      });

    expect(res.statusCode).toBe(500);
  });
});

describe('Auth Routes - Validate Token', () => {
  it('GET /api/auth/validate with valid token returns user info', async () => {
    const token = jwt.sign(
      { userId: 1, email: 'test@example.com', role: 'customer' },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .get('/api/auth/validate')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.user).toHaveProperty('email');
  });

  it('GET /api/auth/validate with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/validate')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(401);
  });

  it('GET /api/auth/validate without token returns 401', async () => {
    const res = await request(app).get('/api/auth/validate');
    expect(res.statusCode).toBe(401);
  });
});
