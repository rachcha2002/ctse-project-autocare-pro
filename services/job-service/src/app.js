require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');

const jobRoutes = require('./routes/jobs');

const app = express();

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
    customSiteTitle: 'Job Service API'
  }));
} catch (e) {
  console.warn('Could not load openapi.yaml for Swagger UI:', e.message);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'job-service',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/jobs', jobRoutes);

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
