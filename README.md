# AutoCare Pro

Vehicle Service Center Management System - A microservices-based application for managing vehicle service operations.

## Description

AutoCare Pro is a comprehensive vehicle service center management system built using microservices architecture. It enables service centers to manage customers, vehicles, appointments, job tracking, and payments efficiently.

## Architecture Overview

The system consists of 4 backend microservices and 1 React frontend:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                            Port: 80                              │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Customer    │    │  Appointment  │    │     Job       │
│   Vehicle     │◄──►│    Service    │◄──►│   Service     │
│   Service     │    │               │    │               │
│  Port: 3000   │    │  Port: 3001   │    │  Port: 3002   │
└───────┬───────┘    └───────────────┘    └───────┬───────┘
        │                                         │
        │                                         ▼
        │                                ┌───────────────┐
        │                                │    Payment    │
        └───────────────────────────────►│    Service    │
                                         │  Port: 3003   │
                                         └───────────────┘
```

## Services

| Service | Port | Owner | Description | Tech Stack |
|---------|------|-------|-------------|------------|
| customer-vehicle-service | 3000 | Student 1 | Customer registration, authentication, vehicle management | Node.js, Express, PostgreSQL, JWT |
| appointment-service | 3001 | Student 2 | Service appointment scheduling and management | Node.js, Express, PostgreSQL |
| job-service | 3002 | Student 3 | Mechanic job assignment and progress tracking | Node.js, Express, PostgreSQL |
| payment-service | 3003 | Student 4 | Invoice generation and payment processing | Node.js, Express, PostgreSQL |
| frontend | 80 | Student 1 | User interface for customers and admins | React, Vite, TailwindCSS |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd autocare-pro
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost
- Customer Vehicle Service: http://localhost:3000
- Appointment Service: http://localhost:3001
- Job Service: http://localhost:3002
- Payment Service: http://localhost:3003

### Running Individual Services

Each service can be run independently for development:

```bash
# Navigate to the service directory
cd services/customer-vehicle-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials

# Run in development mode
npm run dev
```

### Running Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

## Testing

Each service includes Jest tests with coverage:

```bash
cd services/<service-name>
npm test
```

## Project Structure

```
autocare-pro/
├── services/
│   ├── customer-vehicle-service/
│   ├── appointment-service/
│   ├── job-service/
│   └── payment-service/
├── frontend/
├── .github/
│   └── workflows/
│       ├── customer-vehicle.yml
│       ├── appointment.yml
│       ├── job.yml
│       ├── payment.yml
│       └── frontend.yml
├── docker-compose.yml
├── .gitignore
└── README.md
```

## CI/CD

Each service has its own GitHub Actions workflow with:
- Automated testing with coverage
- SonarCloud code quality analysis
- Docker image building and pushing to Docker Hub
- Deployment to AWS (Phase 6)

Workflows are triggered only when files in the respective service directory change.

## Links

| Resource | URL |
|----------|-----|
| API Gateway | TBD |
| SonarCloud | TBD |
| GitHub Actions | [View Workflows](.github/workflows/) |
| Docker Hub | TBD |

## Environment Variables

See `.env.example` in each service directory for required environment variables.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass
4. Create a pull request

## License

ISC
