# F&B HQ System

Production-style full-stack assessment implementation for HQ management of multiple F&B outlets.

## Overview

Business flow:

`Single Company -> Multiple Outlets -> HQ assigns menu -> Outlets create sales -> HQ sees reports`

This project provides:

- HQ outlet creation/listing
- HQ master menu create/list/get/update
- HQ outlet menu assignments with price override
- Outlet assigned-menu retrieval
- Outlet inventory listing and manual adjustment
- Transactional multi-item sales
- Negative stock prevention
- Concurrency-safe sequential receipts by outlet
- Revenue and top-items reporting

## Tech Stack

- Backend: Node.js, Express.js, TypeScript
- ORM: Prisma
- Database: PostgreSQL
- Frontend: React + TypeScript + Vite
- Validation: Zod
- Containers: Docker + Docker Compose

## Project Structure

```text
/
  backend/
    prisma/
      schema.prisma
      seed.ts
      migrations/
    src/
      config/
      routes/
      controllers/
      services/
      repositories/
      middlewares/
      validators/
      types/
      utils/
      app.ts
      server.ts
  frontend/
    src/
      api/
      components/
      pages/
        hq/
        outlet/
      App.tsx
      main.tsx
  docs/
    architecture.md
    erd.md
  docker-compose.yml
  README.md
```

## Setup

### Prerequisites

- Node 22+
- Docker + Docker Compose
- PostgreSQL (if not using Docker)

### Environment

Backend env example: [backend/.env.example](/workspaces/techzu_assessment/backend/.env.example)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fnb_hq?schema=public
CLIENT_ORIGIN=http://localhost:5173
```

Frontend env example:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```
See [frontend/.env.example](/workspaces/techzu_assessment/frontend/.env.example).

## Run with Docker

```bash
docker compose up --build
```

After services are up:

```bash
docker compose exec backend npm run prisma:seed
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

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

## Prisma and Schema

Key files:

- [schema.prisma](/workspaces/techzu_assessment/backend/prisma/schema.prisma)
- [initial migration](/workspaces/techzu_assessment/backend/prisma/migrations/20260312000100_init/migration.sql)
- [constraints migration](/workspaces/techzu_assessment/backend/prisma/migrations/20260312000200_constraints_indexes/migration.sql)
- [seed script](/workspaces/techzu_assessment/backend/prisma/seed.ts)

Core models:

- `Outlet`
- `MenuItem`
- `OutletMenuItem`
- `Inventory`
- `Sale`
- `SaleItem`
- `ReceiptSequence`

Schema guarantees:

- unique outlet code
- unique menu SKU
- unique `(outletId, menuItemId)` for assignments and inventory
- unique `(outletId, receiptNumber)` for sales
- foreign keys on all relationships
- DB check constraints for non-negative money/stock and valid quantities
- indexes for reporting and outlet query patterns

## API Endpoint Summary

### HQ

- `POST /api/hq/outlets`
- `GET /api/hq/outlets`
- `POST /api/hq/menu-items`
- `GET /api/hq/menu-items`
- `GET /api/hq/menu-items/:id`
- `PUT /api/hq/menu-items/:id`
- `POST /api/hq/outlets/:outletId/menu-items`
- `PUT /api/hq/outlets/:outletId/menu-items/:menuItemId`
- `GET /api/hq/reports/revenue-by-outlet`
- `GET /api/hq/reports/top-items-by-outlet`

### Outlet

- `GET /api/outlets/:outletId/menu`
- `GET /api/outlets/:outletId/inventory`
- `POST /api/outlets/:outletId/inventory/adjust`
- `POST /api/outlets/:outletId/sales`

### Health

- `GET /api/health`

## Architecture Notes

The backend is layered:

- `routes` -> `controllers` -> `services` -> `repositories`

Service layer handles transaction boundaries and business rules. Repository layer encapsulates Prisma and SQL operations.

## Receipt Concurrency Strategy

Receipt generation is done in the sale transaction:

1. upsert `ReceiptSequence` row if missing
2. lock row using `SELECT ... FOR UPDATE`
3. increment `lastNumber`
4. derive formatted receipt (example: `OUTLET01-000001`)
5. store receipt on `Sale`

This prevents duplicate receipt numbers under concurrent requests.

## Negative Stock Prevention

The implementation uses three guards:

1. Service-level validation on inventory operations
2. Guarded SQL deduction during sales (`UPDATE ... WHERE stockQuantity >= deduction`)
3. Database check constraint enforcing `stockQuantity >= 0`

## Testing

Backend tests focus on sales flow and stock protection:

```bash
cd backend
npm test
```

## Scaling Strategy (Summary)

For 10 outlets and about 100,000 transactions per month:

- indexed PostgreSQL with connection pooling remains sufficient
- scale backend containers horizontally
- add read replicas for reporting
- add materialized views/summary tables for heavier dashboard traffic
- partition sales tables over time if data grows

Detailed strategy is documented in [docs/architecture.md](/workspaces/techzu_assessment/docs/architecture.md).

## Deployment Notes

- Backend container applies migrations on startup.
- Frontend is Vite-based for local use; for production, serve static build through CDN or Nginx.
- Use managed PostgreSQL, secret management, observability, and backup policies in production.
