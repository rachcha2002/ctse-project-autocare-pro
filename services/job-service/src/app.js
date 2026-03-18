require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const jobRoutes = require('./routes/jobs');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

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
