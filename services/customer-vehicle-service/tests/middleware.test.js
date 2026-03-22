// Tests for middleware - auth and validate

const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Import middleware directly
const { authenticate, adminOnly, staffOnly, customerOnly } = require('../src/middleware/auth');
const validate = require('../src/middleware/validate');
const Joi = require('joi');

describe('Auth Middleware - authenticate', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 401 when no authorization header', () => {
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it('returns 401 when authorization header does not start with Bearer', () => {
    req.headers.authorization = 'Basic sometoken';
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 when token is invalid', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
  });

  it('calls next when token is valid', () => {
    const token = jwt.sign({ userId: 1, role: 'customer' }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;
    authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});

describe('Auth Middleware - adminOnly', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 403 when user is not admin', () => {
    req.user = { role: 'customer' };
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required' });
  });

  it('returns 403 when no user', () => {
    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next when user is admin', () => {
    req.user = { role: 'admin' };
    adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('Auth Middleware - staffOnly', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 403 when user is customer', () => {
    req.user = { role: 'customer' };
    staffOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next when user is admin', () => {
    req.user = { role: 'admin' };
    staffOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('calls next when user is mechanic', () => {
    req.user = { role: 'mechanic' };
    staffOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('Auth Middleware - customerOnly', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 403 when user is not customer', () => {
    req.user = { role: 'admin' };
    customerOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('calls next when user is customer', () => {
    req.user = { role: 'customer' };
    customerOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('Validate Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('returns 400 when validation fails', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    });

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when validation passes', () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    });

    req.body = { name: 'Test Name' };
    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
