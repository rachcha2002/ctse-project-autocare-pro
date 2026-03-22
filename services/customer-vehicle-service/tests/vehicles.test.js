// Comprehensive vehicle routes tests for better coverage

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
const customerToken = jwt.sign({ userId: 1, email: 'customer@test.com', role: 'customer' }, process.env.JWT_SECRET);

describe('Vehicles Routes - POST create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/vehicles creates vehicle successfully', async () => {
    const { Customer, Vehicle } = require('../src/models');
    Customer.findByPk.mockResolvedValue({ id: 1, fullName: 'Test Customer' });
    Vehicle.create.mockResolvedValue({
      id: 1,
      customerId: 1,
      registrationNumber: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
    });

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId: 1,
        registrationNumber: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.registrationNumber).toBe('ABC-1234');
  });

  it('POST /api/vehicles with non-existent customer returns 404', async () => {
    const { Customer } = require('../src/models');
    Customer.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId: 999,
        registrationNumber: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      });

    expect(res.statusCode).toBe(404);
  });

  it('POST /api/vehicles with duplicate registration returns 409', async () => {
    const { Customer, Vehicle } = require('../src/models');
    Customer.findByPk.mockResolvedValue({ id: 1 });

    const error = new Error('Unique constraint');
    error.name = 'SequelizeUniqueConstraintError';
    Vehicle.create.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId: 1,
        registrationNumber: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      });

    expect(res.statusCode).toBe(409);
  });

  it('POST /api/vehicles with database error returns 500', async () => {
    const { Customer, Vehicle } = require('../src/models');
    Customer.findByPk.mockResolvedValue({ id: 1 });
    Vehicle.create.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        customerId: 1,
        registrationNumber: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
      });

    expect(res.statusCode).toBe(500);
  });
});

describe('Vehicles Routes - PATCH status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PATCH /api/vehicles/:id/status updates status successfully', async () => {
    const { Vehicle } = require('../src/models');
    const mockVehicle = {
      id: 1,
      status: 'active',
      update: jest.fn().mockResolvedValue(true),
    };
    Vehicle.findByPk.mockResolvedValue(mockVehicle);

    const res = await request(app)
      .patch('/api/vehicles/1/status')
      .send({ status: 'in_service' });

    expect(res.statusCode).toBe(200);
  });

  it('PATCH /api/vehicles/:id/status with non-existent vehicle returns 404', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/vehicles/999/status')
      .send({ status: 'in_service' });

    expect(res.statusCode).toBe(404);
  });

  it('PATCH /api/vehicles/:id/status with database error returns 500', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .patch('/api/vehicles/1/status')
      .send({ status: 'in_service' });

    expect(res.statusCode).toBe(500);
  });
});

describe('Vehicles Routes - GET by customer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/vehicles/customer/:id with database error returns 500', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findAll.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .get('/api/vehicles/customer/1')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(500);
  });
});

describe('Vehicles Routes - GET by ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/vehicles/:id with database error returns 500', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/vehicles/1');

    expect(res.statusCode).toBe(500);
  });
});

describe('Vehicles Routes - PUT update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /api/vehicles/:id updates vehicle successfully', async () => {
    const { Vehicle } = require('../src/models');
    const mockVehicle = {
      id: 1,
      registrationNumber: 'ABC-1234',
      brand: 'Toyota',
      update: jest.fn().mockResolvedValue(true),
    };
    Vehicle.findByPk.mockResolvedValue(mockVehicle);

    const res = await request(app)
      .put('/api/vehicles/1')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ brand: 'Honda' });

    expect(res.statusCode).toBe(200);
  });

  it('PUT /api/vehicles/:id returns 404 when not found', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/vehicles/999')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ brand: 'Honda' });

    expect(res.statusCode).toBe(404);
  });

  it('PUT /api/vehicles/:id with database error returns 500', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .put('/api/vehicles/1')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ brand: 'Honda' });

    expect(res.statusCode).toBe(500);
  });
});

describe('Vehicles Routes - PATCH service-update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PATCH /api/vehicles/:id/service-update updates service info', async () => {
    const { Vehicle, VehicleServiceHistory } = require('../src/models');
    const mockVehicle = {
      id: 1,
      update: jest.fn().mockResolvedValue(true),
    };
    Vehicle.findByPk.mockResolvedValue(mockVehicle);
    VehicleServiceHistory.create.mockResolvedValue({
      id: 1,
      vehicleId: 1,
      serviceType: 'Oil Change',
    });

    const res = await request(app)
      .patch('/api/vehicles/1/service-update')
      .send({
        jobId: 1,
        paymentId: 1,
        serviceType: 'Oil Change',
        summary: 'Changed oil',
        amountPaid: 5000,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('vehicle');
    expect(res.body).toHaveProperty('historyEntry');
  });

  it('PATCH /api/vehicles/:id/service-update returns 404 when not found', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/vehicles/999/service-update')
      .send({
        jobId: 1,
        paymentId: 1,
        serviceType: 'Oil Change',
        summary: 'Changed oil',
        amountPaid: 5000,
      });

    expect(res.statusCode).toBe(404);
  });

  it('PATCH /api/vehicles/:id/service-update with database error returns 500', async () => {
    const { Vehicle } = require('../src/models');
    Vehicle.findByPk.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .patch('/api/vehicles/1/service-update')
      .send({
        jobId: 1,
        paymentId: 1,
        serviceType: 'Oil Change',
        summary: 'Changed oil',
        amountPaid: 5000,
      });

    expect(res.statusCode).toBe(500);
  });
});

describe('Vehicles Routes - GET history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/vehicles/:id/history with database error returns 500', async () => {
    const { VehicleServiceHistory } = require('../src/models');
    VehicleServiceHistory.findAll.mockRejectedValue(new Error('Database error'));

    const res = await request(app)
      .get('/api/vehicles/1/history')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(500);
  });
});
