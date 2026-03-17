# Job Service

AutoCare Pro - Job Management Service

## Description

This microservice handles mechanic job assignments and progress tracking for the AutoCare Pro system.

## Features

- Job creation from appointments
- Mechanic assignment
- Job progress tracking
- Task management within jobs
- Integration with Appointment and Payment services

## How to Run Locally

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### Running Tests

```bash
npm test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 3002 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | job_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| CUSTOMER_VEHICLE_SERVICE_URL | Customer Vehicle service URL | http://localhost:3000 |
| APPOINTMENT_SERVICE_URL | Appointment service URL | http://localhost:3001 |
| PAYMENT_SERVICE_URL | Payment service URL | http://localhost:3003 |

## API Endpoints

### Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |

### TODO

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /jobs | Create new job |
| GET | /jobs | List all jobs |
| GET | /jobs/:id | Get job by ID |
| PUT | /jobs/:id | Update job |
| PATCH | /jobs/:id/status | Update job status |
| PATCH | /jobs/:id/progress | Update progress |
| GET | /mechanics | List mechanics |
| POST | /mechanics/:id/assign | Assign job |

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize ORM
- Jest + Supertest for testing
