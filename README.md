# F&B HQ System

Full-stack assessment submission for a central HQ system that manages multiple F&B outlets. HQ owns the master menu, assigns menu items to outlets, reviews reports, and each outlet manages local inventory and sales.

## Quick Start for Evaluators

Fastest local path:

```bash
git clone https://github.com/Swannhs/techzu_assessment.git
cd techzu_assessment
./dev.sh
```

After startup:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

Seed data is loaded automatically by `./dev.sh`, so HQ screens, outlet flows, and reporting are immediately usable.

## Live Demo

- Application URL: https://techzu.youngsightcorporation.com.bd/
- In the deployed environment, the frontend is publicly accessible and proxies `/api` requests to the backend.

## Project Overview

Business flow:

`Single Company -> Multiple Outlets -> HQ assigns menu -> Outlets create sales -> HQ sees reports`

This repository implements the system as a modular monolith with:

- a React frontend for HQ and outlet workflows
- an Express API with layered architecture
- Prisma ORM over PostgreSQL
- Docker-based local, production-like, and EC2 deployment paths
- GitHub Actions CI and EC2 deployment support

Supporting documentation:

- [Architecture](docs/architecture.md)
- [ERD](docs/erd.md)

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
- Docker Compose, EC2 deployment scripts, and GitHub Actions workflows

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React, TypeScript, Vite, Redux Toolkit, Tailwind CSS, Yup |
| Backend | Node.js, Express.js, TypeScript, Zod |
| Database | PostgreSQL, Prisma ORM |
| Testing | Jest, Testing Library |
| Containers | Docker, Docker Compose |
| Deployment | EC2, Nginx, GitHub Actions |

## System Architecture

The backend follows a layered structure:

`routes -> controllers -> services -> repositories`

Supporting backend modules:

- `validators`: request schemas and request-level validation
- `middlewares`: centralized validation and error handling
- `dtos`: request and response mapping
- `config`: environment and Prisma setup

The frontend is organized by application concerns:

- `app`: application shell
- `features`: HQ and outlet feature modules
- `redux`: store, slices, and async API orchestration
- `shared`: reusable UI, hooks, and validation helpers
- `lib`: API client and shared API types

High-level runtime flow:

```text
Browser
  |
  v
React Frontend
  |
  v
Express API
  |
  v
Services -> Repositories -> PostgreSQL
           \-> Prisma transactions + raw SQL for concurrency-critical paths
```

Detailed scaling, microservices evolution, and offline strategy are documented in [docs/architecture.md](docs/architecture.md).

## Project Structure

```text
techzu_assessment/
|
├── backend/
│   ├── prisma/              # Prisma schema, migrations, seed
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── dtos/
│       ├── middlewares/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── validators/
|
├── frontend/
│   └── src/
│       ├── app/
│       ├── features/
│       ├── lib/
│       ├── redux/
│       └── shared/
|
├── docker/                  # Compose files and Dockerfiles
├── deploy/                  # EC2 deployment scripts
├── docs/                    # Architecture and ERD
└── README.md
```

## Key Design Decisions

- Modular monolith rather than microservices:
  keeps strongly transactional workflows simple while preserving clean module boundaries.
- Transactional sales:
  receipt generation, stock validation, sale persistence, and inventory deduction happen in one database transaction.
- Historical sale snapshots:
  sale items store name and price at the time of sale so receipts remain correct after menu changes.
- Outlet-scoped inventory and receipts:
  inventory is isolated per outlet and receipt numbers are sequential per outlet.
- Redux-based frontend API flow:
  async requests, loading states, and data refreshes are centralized instead of being scattered across components.

## Environment Configuration

### Backend

Reference: [backend/.env.example](backend/.env.example)

| Variable | Purpose | Example |
| --- | --- | --- |
| `NODE_ENV` | App runtime mode | `development` |
| `PORT` | Backend port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fnb_hq?schema=public` |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend

Reference: [frontend/.env.example](frontend/.env.example)

| Variable | Purpose | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Browser API base path | `/api` |
| `VITE_PROXY_TARGET` | Vite dev proxy target | `http://localhost:4000` |

### EC2 Deployment

Reference: [`.env.ec2.example`](.env.ec2.example)

| Variable | Purpose |
| --- | --- |
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
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

### Production-like Local Run

```bash
docker compose -f docker/compose.yml up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

## Deployment Instructions

### Docker and Compose Support

The repository includes:

- a default production-like compose stack: [`docker/compose.yml`](docker/compose.yml)
- a development override: [`docker/compose.dev.yml`](docker/compose.dev.yml)
- an EC2-specific compose stack: [`docker/compose.ec2.yml`](docker/compose.ec2.yml)

### Manual EC2 Deployment

Included deployment files:

- [`deploy/ec2/deploy.sh`](deploy/ec2/deploy.sh)
- [`deploy/ec2/remote-deploy.sh`](deploy/ec2/remote-deploy.sh)
- [`deploy/ec2/install-docker-ubuntu.sh`](deploy/ec2/install-docker-ubuntu.sh)

Example manual deployment:

```bash
cp .env.ec2.example .env.ec2
./deploy/ec2/deploy.sh --seed
```

Deployment flow:

```text
GitHub Actions or manual trigger
  -> EC2 host
  -> release extracted
  -> docker compose up -d --build
```

### GitHub Actions CI/CD

Included workflows:

- [`CI`](.github/workflows/ci.yml): test and build on pull requests and pushes to `main`
- [`Deploy To EC2`](.github/workflows/deploy-ec2.yml): deploy to EC2 on push to `main` or manual trigger

Required GitHub secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_KNOWN_HOSTS`
- `EC2_ENV_FILE`

Optional GitHub environment variable:

- `EC2_APP_DIR` with default `/opt/fnb-hq`

## Schema Summary

Core entities:

- `Outlet`: physical store or branch
- `MenuItem`: HQ-owned master menu item
- `OutletMenuItem`: outlet assignment table with optional outlet-specific price override
- `Inventory`: per-outlet, per-menu-item stock record
- `Sale`: sale header, tied to an outlet and receipt number
- `SaleItem`: sale line item with name and price snapshots
- `ReceiptSequence`: per-outlet counter used for sequential receipt generation

See [docs/erd.md](docs/erd.md) for the full relationship view.

## Database Constraints

The database schema enforces integrity through:

- foreign key relationships between outlets, menu items, outlet assignments, inventory, sales, and sale items
- unique outlet code: `Outlet(code)`
- unique menu SKU: `MenuItem(sku)`
- unique outlet-menu assignment: `OutletMenuItem(outletId, menuItemId)`
- unique inventory row per outlet and menu item: `Inventory(outletId, menuItemId)`
- unique receipt number per outlet: `Sale(outletId, receiptNumber)`
- check constraints for non-negative stock, non-negative prices, non-negative sale totals, and positive sale quantities

These constraints ensure menu assignment integrity, prevent duplicate receipt numbers within the same outlet, and protect against invalid stock or pricing data.

## Indexing Strategy

Indexes are added on frequently queried fields, including:

- `OutletMenuItem(outletId)`
- `Inventory(outletId, menuItemId)`
- `Sale(outletId, createdAt)`
- `SaleItem(saleId)`
- `SaleItem(menuItemId)`

These indexes improve performance for:

- outlet menu retrieval
- inventory lookups
- sale history queries
- reporting queries such as revenue by outlet and top-selling items

## Database Constraints and Indexing

### Constraints

The schema and migrations explicitly enforce:

- foreign keys across all major relationships
- unique outlet code: `Outlet(code)`
- unique menu SKU: `MenuItem(sku)`
- unique outlet assignment per menu item: `OutletMenuItem(outletId, menuItemId)`
- unique inventory row per outlet/menu item: `Inventory(outletId, menuItemId)`
- unique sequential receipt value per outlet: `Sale(outletId, receiptNumber)`
- non-negative stock with database check constraint: `Inventory.stockQuantity >= 0`
- non-negative pricing and totals with database check constraints
- positive sale quantities and positive stock deduction units

### Indexing

Frequently queried fields are indexed for outlet operations and reporting:

- `OutletMenuItem(outletId)`
- `Inventory(outletId, menuItemId)`
- `Sale(outletId, createdAt)`
- `SaleItem(saleId)`
- `SaleItem(menuItemId)`

These indexes support outlet menu lookup, inventory fetches, receipt history, and reporting aggregates.

## API Endpoints

### HQ API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/hq/outlets` | Create outlet |
| `GET` | `/api/hq/outlets` | List outlets |
| `POST` | `/api/hq/menu-items` | Create master menu item |
| `GET` | `/api/hq/menu-items` | List master menu items |
| `GET` | `/api/hq/menu-items/:id` | Get one menu item |
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

## Business Rules

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

## Scaling Strategy Summary

The implementation targets assessment-scale operation today, but the design can evolve to support larger workloads. For the 10 outlet / 100,000 transactions per month scenario, the detailed plan is documented in [docs/architecture.md](docs/architecture.md).

Summary:

- current indexed PostgreSQL design is sufficient initially
- add connection pooling and horizontal API scaling as traffic grows
- move heavy reporting toward cached or pre-aggregated reads
- introduce replicas, background jobs, and event-driven reporting when read volume grows
- evolve module boundaries toward service extraction only when scale or team ownership justifies it

## Assumptions / Limitations

- The system models a single company with multiple outlets.
- Authentication and authorization are not implemented.
- Taxes, discounts, refunds, and payment processing are out of scope.
- Offline POS support is documented as a design strategy in [docs/architecture.md](docs/architecture.md) but is not implemented in code.
- Deployment support is included for Docker Compose, EC2, and GitHub Actions CI/CD. However, production hardening concerns such as TLS termination, load balancing, managed database provisioning, and secret rotation are not automated in this repository.

## Future Improvements

- Add authentication and role-based access control for HQ and outlet users.
- Add taxes, discounts, refunds, and payment status handling.
- Add automated HTTPS/TLS and reverse proxy or load balancer configuration for production hosting.
- Add richer integration tests against a real PostgreSQL test container.
- Add audit logging and operational monitoring for production support.

## Screenshots

No screenshot assets are currently stored in the repository. If needed for submission packaging, screenshots should be added under a dedicated `docs/` or `assets/` directory and linked here.

## Notes for Evaluators

- The seed data is designed to make HQ screens, outlet screens, and reporting usable immediately.
- Local development is easiest through `./dev.sh`.
- The frontend API calls use `/api` and rely on the Vite dev proxy in development and Nginx proxying in production-style environments.
- If you want to verify core functionality quickly, test outlet creation, menu assignment, a sale submission, and the two reporting screens after seeding.
