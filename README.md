# F&B HQ System

Full-stack assessment submission for a central HQ system that manages multiple F&B outlets. HQ owns the master menu, assigns items to outlets, reviews reports, and each outlet manages its own inventory and sales.

## Project Overview

Business flow:

`Single Company -> Multiple Outlets -> HQ assigns menu -> Outlets create sales -> HQ sees reports`

The application is implemented as a modular monolith with:

- a React frontend for HQ and outlet workflows
- an Express API with layered architecture
- Prisma ORM over PostgreSQL
- Docker-based local, production-like, and EC2 deployment paths

Supporting documentation:

- [Architecture](/workspaces/techzu_assessment/docs/architecture.md)
- [ERD](/workspaces/techzu_assessment/docs/erd.md)

## Features Implemented

### HQ

- Create and list outlets
- Create, list, get, and update master menu items
- Assign menu items to outlets
- Override outlet-specific prices
- View revenue by outlet
- View top-selling items by outlet

### Outlet

- View only menu items assigned to that outlet
- View outlet-specific inventory
- Adjust outlet inventory
- Create multi-item sales
- Receive sequential outlet-specific receipt numbers

### Platform

- Transactional sale creation
- Negative stock protection
- Historical sale item snapshots for name and price
- Centralized request validation and error handling
- Seed data for quick evaluator setup
- Jest-based frontend and backend tests
- GitHub Actions CI and EC2 deployment workflow

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, Redux Toolkit, Tailwind CSS, Yup |
| Backend | Node.js, Express.js, TypeScript, Zod |
| Database | PostgreSQL, Prisma ORM |
| Testing | Jest, Testing Library |
| Containers | Docker, Docker Compose |
| Deployment | EC2, Nginx, GitHub Actions |

## Architecture Summary

The backend follows a layered structure:

`routes -> controllers -> services -> repositories`

Supporting modules:

- `validators`: request schemas and request-level validation
- `middlewares`: validation and centralized error handling
- `dtos`: request and response mapping
- `config`: environment and Prisma setup

The frontend is organized by application concerns:

- `app`: application shell
- `features`: HQ and outlet feature modules
- `redux`: slices, store, hooks
- `shared`: reusable UI, hooks, and validation helpers
- `lib`: API client and shared API types

## Project Structure

```text
/
  backend/
    prisma/
    src/
  frontend/
    src/
  docs/
  docker/
  deploy/
  .github/
  README.md
```

## Environment Configuration

### Backend

Reference: [backend/.env.example](/workspaces/techzu_assessment/backend/.env.example)

| Variable | Purpose | Example |
| --- | --- | --- |
| `NODE_ENV` | App runtime mode | `development` |
| `PORT` | Backend port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fnb_hq?schema=public` |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend

Reference: [frontend/.env.example](/workspaces/techzu_assessment/frontend/.env.example)

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Browser API base path | `/api` |
| `VITE_PROXY_TARGET` | Vite dev proxy target | `http://localhost:4000` |

### EC2 Deployment

Reference: [`.env.ec2.example`](/workspaces/techzu_assessment/.env.ec2.example)

| Variable | Purpose |
| --- | --- |
| `POSTGRES_DB` | Postgres database name |
| `POSTGRES_USER` | Postgres user |
| `POSTGRES_PASSWORD` | Postgres password |
| `DATABASE_URL` | Backend database connection string |
| `CLIENT_ORIGIN` | Public application URL |
| `PUBLIC_HTTP_PORT` | Public HTTP port for the frontend container |

## Setup Instructions

### Prerequisites

- Node.js 22+
- npm
- Docker and Docker Compose
- PostgreSQL if running without Docker

### Quick Start

The fastest local development path is:

```bash
./dev.sh
```

This starts the development containers, waits for PostgreSQL, applies Prisma migrations, and runs the seed script.

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## Docker Instructions

### Development

```bash
docker compose -f docker/compose.yml -f docker/compose.dev.yml up --build
docker compose -f docker/compose.yml -f docker/compose.dev.yml exec backend npm run prisma:seed
```

Services:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

### Production-Like Local Run

```bash
docker compose -f docker/compose.yml -f docker/compose.prod.yml up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

## Database and Seed

### Run migrations

```bash
cd backend
npx prisma migrate deploy
```

### Run seed

```bash
cd backend
npm run prisma:seed
```

The seed creates:

- 3 outlets
- 6 menu items
- outlet menu assignments with outlet-specific prices
- outlet inventory records
- receipt sequence rows
- sample sales and sale items so reporting screens are populated immediately

## Deployment Instructions

### EC2 Deployment Support

The repository includes a single-instance EC2 deployment path:

- [`docker/compose.ec2.yml`](/workspaces/techzu_assessment/docker/compose.ec2.yml)
- [`deploy/ec2/deploy.sh`](/workspaces/techzu_assessment/deploy/ec2/deploy.sh)
- [`deploy/ec2/remote-deploy.sh`](/workspaces/techzu_assessment/deploy/ec2/remote-deploy.sh)
- [`deploy/ec2/install-docker-ubuntu.sh`](/workspaces/techzu_assessment/deploy/ec2/install-docker-ubuntu.sh)

Deployment shape:

- the frontend is publicly exposed
- the backend remains private inside the Docker network
- PostgreSQL remains private inside the Docker network
- backend startup runs Prisma migrations automatically

### Manual EC2 Deployment

```bash
cp .env.ec2.example .env.ec2
./deploy/ec2/deploy.sh --seed
```

### GitHub Actions CI/CD

Included workflows:

- [`CI`](/workspaces/techzu_assessment/.github/workflows/ci.yml): test and build on pull requests and pushes to `main`
- [`Deploy To EC2`](/workspaces/techzu_assessment/.github/workflows/deploy-ec2.yml): deploy to EC2 on push to `main` or manual trigger

Required GitHub secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_KNOWN_HOSTS`
- `EC2_ENV_FILE`

Optional GitHub environment variable:

- `EC2_APP_DIR` with default `/opt/fnb-hq`

## API / Main Modules

### HQ API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/hq/outlets` | Create outlet |
| `GET` | `/api/hq/outlets` | List outlets |
| `POST` | `/api/hq/menu-items` | Create master menu item |
| `GET` | `/api/hq/menu-items` | List master menu items |
| `GET` | `/api/hq/menu-items/:id` | Get menu item |
| `PUT` | `/api/hq/menu-items/:id` | Update menu item |
| `POST` | `/api/hq/outlets/:outletId/menu-items` | Assign menu item to outlet |
| `PUT` | `/api/hq/outlets/:outletId/menu-items/:menuItemId` | Update outlet assignment |
| `GET` | `/api/hq/reports/revenue-by-outlet` | Revenue report |
| `GET` | `/api/hq/reports/top-items-by-outlet` | Top items report |

### Outlet API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/outlets/:outletId/menu` | Get assigned outlet menu |
| `GET` | `/api/outlets/:outletId/inventory` | Get outlet inventory |
| `POST` | `/api/outlets/:outletId/inventory/adjust` | Adjust inventory |
| `POST` | `/api/outlets/:outletId/sales` | Create sale |

### Main Modules

- [`backend/src/services`](/workspaces/techzu_assessment/backend/src/services): business rules and transaction orchestration
- [`backend/src/repositories`](/workspaces/techzu_assessment/backend/src/repositories): Prisma and SQL access
- [`backend/src/controllers`](/workspaces/techzu_assessment/backend/src/controllers): HTTP orchestration and DTO mapping
- [`frontend/src/features/hq`](/workspaces/techzu_assessment/frontend/src/features/hq): HQ screens and logic
- [`frontend/src/features/outlet`](/workspaces/techzu_assessment/frontend/src/features/outlet): outlet screens and sales flow
- [`frontend/src/redux`](/workspaces/techzu_assessment/frontend/src/redux): global state and async API calls

## Key Business Rules

- Menu items are defined centrally and then assigned to outlets.
- Outlets only see menu items assigned to them.
- Outlet assignments can override the base menu price.
- Inventory is tracked per outlet and per menu item.
- Sale creation is transactional.
- Sale items store historical name and price snapshots.
- Stock cannot go below zero.
- Receipt numbers are sequential per outlet.
- Receipt generation is concurrency-safe through `ReceiptSequence` and database transaction boundaries.
- Sale requests fail atomically if any requested line cannot be fulfilled.

## Testing

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm test
```

## Assumptions / Limitations

- The system models a single company with multiple outlets.
- Authentication and authorization are not implemented.
- Taxes, discounts, refunds, and payment processing are out of scope.
- Offline POS support is documented in [architecture.md](/workspaces/techzu_assessment/docs/architecture.md) but not implemented in code.
- Deployment support exists for Docker Compose, EC2, and GitHub Actions CI/CD, but production-grade infrastructure concerns such as TLS termination, load balancing, managed database provisioning, and secret rotation are not automated in this repository.

## Future Improvements

- Add authentication and role-based access control for HQ and outlet users.
- Add taxes, discounts, refunds, and payment status handling.
- Add automated HTTPS/TLS and a reverse proxy or load balancer for production hosting.
- Add richer integration tests against a real PostgreSQL test container.
- Add audit logging and operational monitoring for production support.

## Notes for Evaluators

- The seed data is designed to make HQ screens, outlet screens, and reporting usable immediately.
- Local development is easiest through `./dev.sh`.
- The frontend API calls use `/api` and rely on the Vite dev proxy in development and Nginx proxying in production-style environments.
