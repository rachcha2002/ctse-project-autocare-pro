# Payment Service

AutoCare Pro - Payment and Invoice Service

## Description

This microservice handles invoice generation and payment processing for the AutoCare Pro system.

## Features

- Invoice generation from completed jobs
- Payment processing
- Refund handling
- Revenue reporting
- Integration with Customer Vehicle and Job services

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
| PORT | Service port | 3003 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | pay_db |
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
| POST | /invoices | Create invoice |
| GET | /invoices | List invoices |
| GET | /invoices/:id | Get invoice by ID |
| PUT | /invoices/:id | Update invoice |
| POST | /payments | Process payment |
| GET | /payments | List payments |
| GET | /payments/:id | Get payment by ID |
| POST | /payments/:id/refund | Process refund |
| GET | /reports/revenue | Revenue report |

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize ORM
- Jest + Supertest for testing
