const axios = require('axios');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const { data } = await axios.get(
      `${process.env.CUSTOMER_VEHICLE_SERVICE_URL}/api/auth/validate`,
      {
        headers: { authorization: authHeader },
        timeout: 5000
      }
    );
    if (!data.valid) return res.status(401).json({ error: 'Invalid token' });
    req.user = data.user;
    next();
  } catch (err) {
    if (err.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.status(503).json({ error: 'Auth service unavailable' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const staffOnly = (req, res, next) => {
  if (!req.user || !['admin', 'mechanic'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
};

module.exports = { authenticate, adminOnly, staffOnly };
