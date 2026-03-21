# AutoCare Pro — Vehicle Service Center Management System

SE4010 Cloud Computing Assignment | Team of 4 | AWS Free Tier

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                  Vite + TailwindCSS  |  Port 3080                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (Nginx)  |  Port 80              │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Customer &  │    │  Appointment  │    │     Job       │
│   Vehicle     │◄──►│    Service    │◄──►│   Service     │
│   Service     │    │               │    │               │
│  Port: 3000   │    │  Port: 3001   │    │  Port: 3002   │
└───────┬───────┘    └───────────────┘    └───────┬───────┘
        │                                         │
        └────────────────────────────────────────►│
                                                  ▼
                                         ┌───────────────┐
                                         │    Payment    │
                                         │    Service    │
                                         │  Port: 3003   │
                                         └───────────────┘
```

## Services

| Service | Port | Owner | Description |
|---------|------|-------|-------------|
| gateway | 80 | All | Nginx API Gateway — routes /api/* to backend services |
| customer-vehicle-service | 3000 | Student 1 | Customer auth, vehicle management, JWT issuance |
| appointment-service | 3001 | Student 2 | Appointment booking, slot availability, status lifecycle |
| job-service | 3002 | Student 3 | Mechanic job tracking, progress updates, completion (triggers 3 downstream calls) |
| payment-service | 3003 | Student 4 | Invoice generation, payment processing, receipts |
| frontend | 3080 | Student 1 | React SPA — dark automotive theme, customer + admin flows |

## Quick Start (Docker Compose)

```bash
git clone <repository-url>
cd ctse-project-autocare-pro
docker-compose up --build
```

Access at: **http://localhost:3080**

## Default Staff Accounts

Run the seed script once against the deployed database to create admin and mechanic accounts:

```bash
cd services/customer-vehicle-service
npm run seed:staff
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@autocare.com | Admin@2026 |
| Mechanic | mechanic1@autocare.com | Mechanic@2026 |

> Staff accounts are never self-registered — only created via this seed script.

## Local Development (Individual Services)

```bash
cd services/<service-name>
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Testing

All services use Jest + Supertest. Each has two test files:
- `tests/health.test.js` — health check + core route validation
- `tests/routes.test.js` — extended route coverage (success + error cases)

```bash
cd services/<service-name>
npm test             # runs all tests + coverage
```

## API Documentation (OpenAPI)

Each service has a complete `openapi.yaml` at its root:
- [`customer-vehicle-service/openapi.yaml`](services/customer-vehicle-service/openapi.yaml)
- [`appointment-service/openapi.yaml`](services/appointment-service/openapi.yaml)
- [`job-service/openapi.yaml`](services/job-service/openapi.yaml)
- [`payment-service/openapi.yaml`](services/payment-service/openapi.yaml)

## CI/CD Pipeline (per service)

Each `.github/workflows/*.yml` runs on push to `main` (path-filtered):

1. **Test** — `npm test --coverage`
2. **Security Scan** — SonarCloud SAST
3. **Build** — Docker image tagged `:latest` + `:git-sha`
4. **Push** — Docker Hub registry
5. **Deploy** — Cloud platform (to be configured)

## Project Structure

```
ctse-project-autocare-pro/
├── gateway/               # Nginx config + Dockerfile
├── services/
│   ├── customer-vehicle-service/   # Student 1
│   ├── appointment-service/        # Student 2
│   ├── job-service/                # Student 3
│   └── payment-service/            # Student 4
├── frontend/              # React + Vite + TailwindCSS (Student 1)
├── .github/workflows/     # CI/CD (one per service + frontend)
├── docker-compose.yml     # Local full-stack orchestration
└── README.md
```

## Links

| Resource | URL |
|----------|-----|
| GitHub Repo | [github.com/rachcha2002/ctse-project-autocare-pro](https://github.com/rachcha2002/ctse-project-autocare-pro) |
| SonarCloud | TBD — populate after first push to main |
| Docker Hub | TBD — populate after first CI run |
| Live API Gateway | TBD — populate after deployment |
| Live Frontend | TBD — populate after deployment |

## Report — Known Corrections

The project report uses **AWS** as the cloud provider but some sections accidentally mention **Azure Container Apps**. The correct service is either:
- **AWS ECS Fargate** (if deploying to AWS), or
- **Azure Container Apps** (if deploying to Azure)

Pick one and ensure all sections of the report are consistent.

The report also lists these auth endpoint paths incorrectly:
- ~~`POST /api/customers/register`~~ → correct: `POST /api/auth/register`
- ~~`POST /api/customers/login`~~ → correct: `POST /api/auth/login`
- ~~`GET /api/customers/health`~~ → correct: `GET /health`

## License

ISC




## Description

AutoCare Pro is a comprehensive vehicle service center management system built using microservices architecture. It enables service centers to manage customers, vehicles, appointments, job tracking, and payments efficiently.

## Architecture Overview

The system consists of 4 backend microservices, 1 React frontend, and an Nginx API Gateway:

All external traffic goes through the Nginx API Gateway on port 80. The frontend uses http://localhost:80 locally and the AWS API Gateway URL in production.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                           Port: 3080                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway (Nginx)                          │
│                           Port: 80                               │
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
| gateway | 80 | All students | API Gateway routing all external traffic | Nginx |
| customer-vehicle-service | 3000 | Student 1 | Customer registration, authentication, vehicle management | Node.js, Express, PostgreSQL, JWT |
| appointment-service | 3001 | Student 2 | Service appointment scheduling and management | Node.js, Express, PostgreSQL |
| job-service | 3002 | Student 3 | Mechanic job assignment and progress tracking | Node.js, Express, PostgreSQL |
| payment-service | 3003 | Student 4 | Invoice generation and payment processing | Node.js, Express, PostgreSQL |
| frontend | 3080 | Student 1 | User interface for customers and admins | React, Vite, TailwindCSS |

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
- API Gateway: http://localhost (port 80)
- Frontend: http://localhost:3080
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
├── gateway/
│   ├── nginx.conf
│   └── Dockerfile
├── services/
│   ├── customer-vehicle-service/
│   ├── appointment-service/
│   ├── job-service/
│   └── payment-service/
├── frontend/
├── .github/
│   └── workflows/
│       ├── gateway.yml
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
