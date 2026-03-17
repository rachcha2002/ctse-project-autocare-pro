# Appointment Service

AutoCare Pro - Appointment Booking Service

## Description

This microservice handles service appointment scheduling and management for the AutoCare Pro system.

## Features

- Appointment creation and scheduling
- Service type management
- Availability checking
- Appointment status tracking
- Integration with Customer Vehicle Service

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
| PORT | Service port | 3001 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | appt_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| CUSTOMER_VEHICLE_SERVICE_URL | Customer Vehicle service URL | http://localhost:3000 |
| JOB_SERVICE_URL | Job service URL | http://localhost:3002 |

## API Endpoints

### Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |

### TODO

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /appointments | Create new appointment |
| GET | /appointments | List all appointments |
| GET | /appointments/:id | Get appointment by ID |
| PUT | /appointments/:id | Update appointment |
| PATCH | /appointments/:id/status | Update status |
| DELETE | /appointments/:id | Cancel appointment |
| GET | /service-types | List service types |
| GET | /availability | Get available slots |

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize ORM
- Jest + Supertest for testing
