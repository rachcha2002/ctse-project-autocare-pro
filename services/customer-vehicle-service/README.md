# Customer Vehicle Service

AutoCare Pro - Customer and Vehicle Management Service

## Description

This microservice handles customer registration, authentication, and vehicle management for the AutoCare Pro system.

## Features

- Customer registration and authentication (JWT)
- Customer profile management
- Vehicle registration and management
- Vehicle-customer association

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
| PORT | Service port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | cv_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | - |
| JWT_SECRET | JWT signing secret | - |
| APPOINTMENT_SERVICE_URL | Appointment service URL | http://localhost:3001 |

## API Endpoints

### Available

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |

### TODO

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new customer |
| POST | /auth/login | Customer login |
| GET | /customers | List all customers |
| GET | /customers/:id | Get customer by ID |
| PUT | /customers/:id | Update customer |
| DELETE | /customers/:id | Delete customer |
| POST | /vehicles | Register new vehicle |
| GET | /vehicles | List all vehicles |
| GET | /vehicles/:id | Get vehicle by ID |
| PUT | /vehicles/:id | Update vehicle |
| DELETE | /vehicles/:id | Delete vehicle |

## Tech Stack

- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT for authentication
- Jest + Supertest for testing
