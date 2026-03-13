# F&B HQ System

Full-stack assessment submission for a central HQ system that manages multiple F&B outlets. HQ owns the master menu, assigns items to outlets, reviews reports, and each outlet manages its own inventory and sales.

---

## Quick Start for Evaluators

Fastest local path:

```bash
git clone https://github.com/Swannhs/techzu_assessment.git
cd techzu_assessment
./dev.sh
```

Then open:

* Frontend: http://localhost:5173
* Backend API: http://localhost:4000/api
* Health check: http://localhost:4000/api/health

Seed data is automatically loaded so HQ workflows, outlet flows, and reports are usable immediately.

If you prefer a hosted environment, use the live demo below.

---

## Live Demo

* Application URL: https://techzu.youngsightcorporation.com.bd/
* In the deployed environment, the frontend is publicly accessible and proxies `/api` requests to the backend.

---

## Project Overview

Business flow:

`Single Company -> Multiple Outlets -> HQ assigns menu -> Outlets create sales -> HQ sees reports`

The application is implemented as a modular monolith with:

* a React frontend for HQ and outlet workflows
* an Express API with layered architecture
* Prisma ORM over PostgreSQL
* Docker-based local, production-like, and EC2 deployment paths

Supporting documentation:

* [Architecture](docs/architecture.md)
* [ERD](docs/erd.md)

---

## Features Implemented

### HQ

* Create and list outlets
* Create, list, get, and update master menu items
* Assign menu items to outlets
* Override outlet-specific prices
* View revenue by outlet
* View top-selling items by outlet

### Outlet

* View only menu items assigned to that outlet
* View outlet-specific inventory
* Adjust outlet inventory
* Create multi-item sales
* Receive sequential outlet-specific receipt numbers

### Platform

* Transactional sale creation
* Negative stock protection
* Historical sale item snapshots for name and price
* Centralized request validation and error handling
* Seed data for quick evaluator setup
* Jest-based frontend and backend tests
* GitHub Actions CI and EC2 deployment workflow

---

## Tech Stack

| Layer      | Stack                                                     |
| ---------- | --------------------------------------------------------- |
| Frontend   | React, TypeScript, Vite, Redux Toolkit, Tailwind CSS, Yup |
| Backend    | Node.js, Express.js, TypeScript, Zod                      |
| Database   | PostgreSQL, Prisma ORM                                    |
| Testing    | Jest, Testing Library                                     |
| Containers | Docker, Docker Compose                                    |
| Deployment | EC2, Nginx, GitHub Actions                                |

---

## System Architecture

The backend follows a layered structure:

`routes -> controllers -> services -> repositories`

Supporting modules:

* `validators`: request schemas and request-level validation
* `middlewares`: validation and centralized error handling
* `dtos`: request and response mapping
* `config`: environment and Prisma setup

The frontend is organized by application concerns:

* `app`: application shell
* `features`: HQ and outlet feature modules
* `redux`: slices, store, hooks
* `shared`: reusable UI, hooks, and validation helpers
* `lib`: API client and shared API types

System flow:

```
React UI -> Express API -> Services -> Repositories -> PostgreSQL
                 |
                 -> Prisma transactions + raw SQL for concurrency-critical paths
```

---

## Project Structure

```
techzu_assessment/
├── backend/        # Express API, Prisma, business logic
├── frontend/       # React application
├── docs/           # Architecture and ERD documentation
├── docker/         # Docker Compose files
├── deploy/         # EC2 deployment scripts
├── .github/        # CI/CD workflows
├── dev.sh          # Local development bootstrap
└── README.md
```

---

## Key Design Decisions

* **Modular monolith rather than microservices**
  Keeps transactional workflows simple while preserving clear module boundaries.

* **Transactional sales**
  Receipt generation, stock validation, inventory deduction, and sale persistence happen in one database transaction.

* **Historical sale snapshots**
  Receipts remain accurate even if menu names or prices change later.

* **Outlet-scoped inventory and receipts**
  Inventory is isolated per outlet and receipt numbering is sequential per outlet.

* **Frontend state management with Redux Toolkit**
  API calls and loading states are centralized instead of being scattered across components.

---

## Environment Configuration

### Backend

Reference: [backend/.env.example](backend/.env.example)

| Variable      | Purpose                          | Example                                                            |
| ------------- | -------------------------------- | ------------------------------------------------------------------ |
| NODE_ENV      | App runtime mode                 | development                                                        |
| PORT          | Backend port                     | 4000                                                               |
| DATABASE_URL  | PostgreSQL connection string     | postgresql://postgres:postgres@localhost:5432/fnb_hq?schema=public |
| CLIENT_ORIGIN | Allowed frontend origin for CORS | http://localhost:5173                                              |

### Frontend

Reference: [frontend/.env.example](frontend/.env.example)

| Variable          | Purpose               | Example               |
| ----------------- | --------------------- | --------------------- |
| VITE_API_BASE_URL | Browser API base path | /api                  |
| VITE_PROXY_TARGET | Vite dev proxy target | http://localhost:4000 |

### EC2 Deployment

Reference: [.env.ec2.example](.env.ec2.example)

| Variable          | Purpose                                     |
| ----------------- | ------------------------------------------- |
| POSTGRES_DB       | Postgres database name                      |
| POSTGRES_USER     | Postgres user                               |
| POSTGRES_PASSWORD | Postgres password                           |
| DATABASE_URL      | Backend database connection string          |
| CLIENT_ORIGIN     | Public application URL                      |
| PUBLIC_HTTP_PORT  | Public HTTP port for the frontend container |

---

## Setup Instructions

### Prerequisites

* Node.js 22+
* npm
* Docker and Docker Compose
* PostgreSQL if running without Docker

### Quick Start

The fastest local development path is:

```bash
./dev.sh
```

This starts the development containers, waits for PostgreSQL, applies Prisma migrations, and runs the seed script.

---

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

* Frontend: http://localhost:5173
* Backend API: http://localhost:4000/api
* Health check: http://localhost:4000/api/health

---

## Docker Instructions

### Development

```bash
docker compose -f docker/compose.yml -f docker/compose.dev.yml up --build
docker compose -f docker/compose.yml -f docker/compose.dev.yml exec backend npm run prisma:seed
```

Services:

* Frontend: http://localhost:5173
* Backend API: http://localhost:4000/api
* PostgreSQL: localhost:5432

### Production-Like Local Run

```bash
docker compose -f docker/compose.yml up --build
```

Services:

* Frontend: http://localhost:8080
* Backend API: http://localhost:4000/api
* PostgreSQL: localhost:5432

---

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

* 3 outlets
* 6 menu items
* outlet menu assignments with outlet-specific prices
* outlet inventory records
* receipt sequence rows
* sample sales and sale items so reporting screens are populated immediately

---

## Deployment Instructions

### EC2 Deployment Support

The repository includes a single-instance EC2 deployment path:

* docker/compose.ec2.yml
* deploy/ec2/deploy.sh
* deploy/ec2/remote-deploy.sh
* deploy/ec2/install-docker-ubuntu.sh

Deployment shape:

* the frontend is publicly exposed
* the backend remains private inside the Docker network
* PostgreSQL remains private inside the Docker network
* backend startup runs Prisma migrations automatically

### Manual EC2 Deployment

```bash
cp .env.ec2.example .env.ec2
./deploy/ec2/deploy.sh --seed
```

Deployment flow:

```
GitHub Actions -> SSH to EC2 -> release extracted -> docker compose up -d --build
```

---

## API

### HQ API

| Method | Endpoint                                         | Purpose                    |
| ------ | ------------------------------------------------ | -------------------------- |
| POST   | /api/hq/outlets                                  | Create outlet              |
| GET    | /api/hq/outlets                                  | List outlets               |
| POST   | /api/hq/menu-items                               | Create master menu item    |
| GET    | /api/hq/menu-items                               | List master menu items     |
| GET    | /api/hq/menu-items/:id                           | Get menu item              |
| PUT    | /api/hq/menu-items/:id                           | Update menu item           |
| POST   | /api/hq/outlets/:outletId/menu-items             | Assign menu item to outlet |
| PUT    | /api/hq/outlets/:outletId/menu-items/:menuItemId | Update outlet assignment   |
| GET    | /api/hq/reports/revenue-by-outlet                | Revenue report             |
| GET    | /api/hq/reports/top-items-by-outlet              | Top items report           |

### Outlet API

| Method | Endpoint                                | Purpose                  |
| ------ | --------------------------------------- | ------------------------ |
| GET    | /api/outlets/:outletId/menu             | Get assigned outlet menu |
| GET    | /api/outlets/:outletId/inventory        | Get outlet inventory     |
| POST   | /api/outlets/:outletId/inventory/adjust | Adjust inventory         |
| POST   | /api/outlets/:outletId/sales            | Create sale              |

---

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

---

## Assumptions / Limitations

* The system models a single company with multiple outlets.
* Authentication and authorization are not implemented.
* Taxes, discounts, refunds, and payment processing are out of scope.
* Offline POS support is documented in `docs/architecture.md` but not implemented.
* Deployment support exists through Docker Compose, EC2 scripts, and GitHub Actions CI/CD.
* Production hardening concerns such as TLS termination, load balancing, managed database provisioning, and secret rotation are outside the scope of this repository.

---

## Future Improvements

* Add authentication and role-based access control
* Add taxes, discounts, refunds, and payment status handling
* Add automated HTTPS/TLS and production reverse proxy
* Add richer integration tests using PostgreSQL test containers
* Add audit logging and operational monitoring

---

## Screenshots

Screenshot assets are not currently included in the repository.
If required for submission packaging, screenshots can be added under `docs/` or `assets/` and linked here.

---

## Notes for Evaluators

* Seed data allows the system to be explored immediately.
* The easiest local setup is `./dev.sh`.
* The frontend uses `/api` and relies on Vite proxy locally and Nginx proxying in production.
* To quickly verify functionality: create an outlet, assign menu items, submit a sale, and check the reporting screens.
