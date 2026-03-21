require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const vehicleRoutes = require('./routes/vehicles');
const staffRoutes = require('./routes/staff');

const app = express();

// Relax helmet CSP so Swagger UI assets load correctly
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Swagger UI — served at /api-docs
try {
  const swaggerDocument = YAML.load(
    fs.readFileSync(path.join(__dirname, '..', 'openapi.yaml'), 'utf8')
  );
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Customer & Vehicle Service API'
  }));
} catch (e) {
  console.warn('Could not load openapi.yaml for Swagger UI:', e.message);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'customer-vehicle-service',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/staff', staffRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
