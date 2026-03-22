// Comprehensive staff routes tests for better coverage

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

describe('Staff Routes - GET /mechanics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/staff/mechanics with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findAll.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/staff/mechanics');

    expect(res.statusCode).toBe(500);
  });
});

describe('Staff Routes - GET /:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/staff/:id returns staff member', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockResolvedValue({
      id: 1,
      fullName: 'John Mechanic',
      email: 'john@autocare.com',
      role: 'mechanic',
    });

    const res = await request(app).get('/api/staff/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe('John Mechanic');
  });

  it('GET /api/staff/:id returns 404 when not found', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/staff/999');

    expect(res.statusCode).toBe(404);
  });

  it('GET /api/staff/:id with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/staff/1');

    expect(res.statusCode).toBe(500);
  });
});

describe('Staff Routes - GET / (all staff)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/staff returns all staff for admin', async () => {
    const { Staff } = require('../src/models');
    Staff.findAll.mockResolvedValue([
      { id: 1, fullName: 'Admin User', role: 'admin' },
      { id: 2, fullName: 'Mechanic User', role: 'mechanic' },
    ]);

    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/staff without token returns 401', async () => {
    const res = await request(app).get('/api/staff');

    expect(res.statusCode).toBe(401);
  });

  it('GET /api/staff with customer token returns 403', async () => {
    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('GET /api/staff with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findAll.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .get('/api/staff')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
  });
});

describe('Staff Routes - POST / (create staff)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/staff creates new staff member', async () => {
    const { Staff } = require('../src/models');
    Staff.findOne.mockResolvedValue(null);
    Staff.create.mockResolvedValue({
      id: 3,
      fullName: 'New Mechanic',
      email: 'newmech@autocare.com',
      phone: '0771234567',
      role: 'mechanic',
    });

    const res = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'New Mechanic',
        email: 'newmech@autocare.com',
        phone: '0771234567',
        password: 'Mechanic@2026',
        role: 'mechanic',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.fullName).toBe('New Mechanic');
  });

  it('POST /api/staff with duplicate email returns 409', async () => {
    const { Staff } = require('../src/models');
    Staff.findOne.mockResolvedValue({ id: 1, email: 'existing@autocare.com' });

    const res = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'New Mechanic',
        email: 'existing@autocare.com',
        phone: '0771234567',
        password: 'Mechanic@2026',
        role: 'mechanic',
      });

    expect(res.statusCode).toBe(409);
  });

  it('POST /api/staff without token returns 401', async () => {
    const res = await request(app)
      .post('/api/staff')
      .send({
        fullName: 'New Mechanic',
        email: 'newmech@autocare.com',
        phone: '0771234567',
        password: 'Mechanic@2026',
        role: 'mechanic',
      });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/staff with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findOne.mockResolvedValue(null);
    Staff.create.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'New Mechanic',
        email: 'newmech@autocare.com',
        phone: '0771234567',
        password: 'Mechanic@2026',
        role: 'mechanic',
      });

    expect(res.statusCode).toBe(500);
  });
});

describe('Staff Routes - PUT /:id (update staff)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /api/staff/:id updates staff member', async () => {
    const { Staff } = require('../src/models');
    const mockStaff = {
      id: 1,
      fullName: 'Updated Name',
      email: 'updated@autocare.com',
      role: 'mechanic',
      update: jest.fn().mockResolvedValue(true),
    };
    Staff.findByPk.mockResolvedValue(mockStaff);

    const res = await request(app)
      .put('/api/staff/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(200);
  });

  it('PUT /api/staff/:id with password updates passwordHash', async () => {
    const { Staff } = require('../src/models');
    const mockStaff = {
      id: 1,
      fullName: 'Test Staff',
      email: 'test@autocare.com',
      role: 'mechanic',
      update: jest.fn().mockResolvedValue(true),
    };
    Staff.findByPk.mockResolvedValue(mockStaff);

    const res = await request(app)
      .put('/api/staff/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: 'NewPassword@2026' });

    expect(res.statusCode).toBe(200);
    expect(mockStaff.update).toHaveBeenCalled();
  });

  it('PUT /api/staff/:id returns 404 when not found', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/staff/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/staff/:id with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put('/api/staff/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Updated Name' });

    expect(res.statusCode).toBe(500);
  });
});

describe('Staff Routes - DELETE /:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('DELETE /api/staff/:id removes staff member', async () => {
    const { Staff } = require('../src/models');
    const mockStaff = {
      id: 1,
      destroy: jest.fn().mockResolvedValue(true),
    };
    Staff.findByPk.mockResolvedValue(mockStaff);

    const res = await request(app)
      .delete('/api/staff/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('successfully');
  });

  it('DELETE /api/staff/:id returns 404 when not found', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/staff/999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

  it('DELETE /api/staff/:id without token returns 401', async () => {
    const res = await request(app).delete('/api/staff/1');

    expect(res.statusCode).toBe(401);
  });

  it('DELETE /api/staff/:id with database error returns 500', async () => {
    const { Staff } = require('../src/models');
    Staff.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .delete('/api/staff/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
  });
});
