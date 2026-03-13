# F&B HQ System

Production-style full-stack assessment implementation for HQ management of multiple F&B outlets.

## Project Overview

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
      dtos/
      middlewares/
      validators/
      types/
      utils/
      app.ts
      server.ts
  frontend/
    src/
      app/
      features/
      lib/
      redux/
      shared/
      main.tsx
  docs/
    architecture.md
    erd.md
  docker/
    compose.yml
    compose.dev.yml
    compose.prod.yml
    backend/
      Dockerfile.dev
      Dockerfile.prod
    frontend/
      Dockerfile.dev
      Dockerfile.prod
      nginx.conf
  README.md
```

## Setup Instructions

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

## Running with Docker

### Local development containers

```bash
docker compose -f docker/compose.yml -f docker/compose.dev.yml up --build
```

After services are up (first run):

```bash
docker compose -f docker/compose.yml -f docker/compose.dev.yml exec backend npm run prisma:seed
```

URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

This mode uses:

- backend `dev` target (`tsx watch`)
- frontend `dev` target (`vite dev`)
- bind mounts for live code reload

### Production-like containers

```bash
docker compose -f docker/compose.yml -f docker/compose.prod.yml up --build
```

URLs:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`

This mode uses:

- backend compiled `prod` image
- frontend static assets served by Nginx
- backend healthcheck before frontend startup

## Running Locally (without Docker)

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

## Prisma Migration Instructions

```bash
cd backend
npx prisma migrate deploy
```

For local schema changes during development:

```bash
cd backend
npx prisma migrate dev
```

## Prisma Seed Instructions

```bash
cd backend
npm run prisma:seed
```

The seed script creates:

- 3 outlets
- 6 menu items
- outlet-specific assignments and price overrides
- inventory per outlet
- initial receipt sequence rows
- sample sales and sale items so reporting screens are populated immediately

## Database Schema Explanation

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

## Architecture Overview

The backend follows a layered modular monolith:

- `routes` define HTTP endpoints and attach validation middleware
- `controllers` translate HTTP requests/responses and map DTOs
- `services` contain business rules and transaction orchestration
- `repositories` isolate Prisma and raw SQL access
- `dtos` define API request/response contracts

This keeps validation, transport mapping, business logic, and data access separated enough to evolve without turning the project into unnecessary microservices too early.

## Assumptions and Limitations

- Single company scope is assumed; multi-company tenancy is out of scope.
- Authentication and authorization are intentionally not implemented for the assessment.
- Taxes, discounts, refunds, and payment settlement flows are not modeled.
- Deployment and hosting are intentionally not covered here.
- Offline POS behavior is documented only and not implemented in code.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/hq/outlets` | Create a new outlet |
| `GET` | `/api/hq/outlets` | List all outlets |
| `POST` | `/api/hq/menu-items` | Create a master menu item |
| `GET` | `/api/hq/menu-items` | List master menu items |
| `GET` | `/api/hq/menu-items/:id` | Get one master menu item |
| `PUT` | `/api/hq/menu-items/:id` | Update a master menu item |
| `POST` | `/api/hq/outlets/:outletId/menu-items` | Assign a menu item to an outlet |
| `PUT` | `/api/hq/outlets/:outletId/menu-items/:menuItemId` | Update assignment status or price override |
| `GET` | `/api/hq/reports/revenue-by-outlet` | Return total revenue by outlet |
| `GET` | `/api/hq/reports/top-items-by-outlet` | Return top five selling items per outlet |
| `GET` | `/api/outlets/:outletId/menu` | Return menu items assigned to the outlet |
| `GET` | `/api/outlets/:outletId/inventory` | Return outlet inventory |
| `POST` | `/api/outlets/:outletId/inventory/adjust` | Adjust outlet stock manually |
| `POST` | `/api/outlets/:outletId/sales` | Create a multi-item sale for an outlet |

### Example Request: Create Menu Item

```json
{
  "sku": "BRG-005",
  "name": "Smoky Beef Burger",
  "description": "Burger with smoked mayo and cheddar",
  "basePrice": 15.5,
  "stockDeductionUnits": 1,
  "isActive": true
}
```

### Example Request: Create Sale

```json
{
  "items": [
    { "menuItemId": 1, "quantity": 2 },
    { "menuItemId": 3, "quantity": 1 }
  ]
}
```

### Example Response: Create Sale

```json
{
  "id": "1",
  "outletId": 1,
  "receiptNumber": "OUTLET01-000001",
  "subtotalAmount": "30.75",
  "totalAmount": "30.75",
  "createdAt": "2026-03-13T00:00:00.000Z",
  "saleItems": [
    {
      "id": "1",
      "saleId": "1",
      "menuItemId": 1,
      "itemNameSnapshot": "Classic Burger",
      "unitPriceSnapshot": "13.00",
      "quantity": 2,
      "lineTotal": "26.00"
    },
    {
      "id": "2",
      "saleId": "1",
      "menuItemId": 3,
      "itemNameSnapshot": "Iced Lemon Tea",
      "unitPriceSnapshot": "4.75",
      "quantity": 1,
      "lineTotal": "4.75"
    }
  ]
}
```

## Receipt Concurrency Strategy

Receipt numbering is sequential per outlet and remains correct under concurrent requests because sale creation is handled inside one database transaction.

1. Each outlet owns exactly one row in `ReceiptSequence`.
2. During sale creation, the service locks that row with `SELECT ... FOR UPDATE`.
3. The transaction increments `lastNumber` safely while the row is locked.
4. The receipt number is generated from the locked sequence value, for example `OUTLET01-000001`.
5. The sale is inserted using that receipt value before the transaction commits.
6. A database unique constraint on `(outletId, receiptNumber)` provides an additional safety net.

This combination prevents duplicate or skipped receipt numbers caused by concurrent sale requests hitting the same outlet at the same time.

## Negative Stock Protection Strategy

Negative stock is prevented through three layers working together:

1. Service-level checks confirm outlet, menu assignment, and requested quantities are valid before a sale is finalized.
2. Inventory deduction uses a guarded SQL update that only succeeds when `stockQuantity >= deductionUnits`.
3. The database schema also enforces non-negative stock using a `CHECK` constraint.

If any line item cannot deduct stock safely, the guarded update fails, the service throws an `INSUFFICIENT_STOCK` error, and the whole database transaction rolls back so no partial sale is stored.

## Testing

Backend tests focus on sales flow and stock protection:

```bash
cd backend
npm test
```

To run the same tests against the Dockerized database:

```bash
docker compose -f docker/compose.yml -f docker/compose.dev.yml exec backend sh -c 'DATABASE_URL="postgresql://postgres:postgres@postgres:5432/fnb_hq_test?schema=public" npx prisma migrate deploy && DATABASE_URL="postgresql://postgres:postgres@postgres:5432/fnb_hq_test?schema=public" npm test'
```

## Scaling Plan Overview

For 10 outlets and about 100,000 transactions per month:

- indexed PostgreSQL with connection pooling remains sufficient
- scale backend containers horizontally
- add read replicas for reporting
- add materialized views/summary tables for heavier dashboard traffic
- partition sales tables over time if data grows

More detail is available in [architecture.md](/workspaces/techzu_assessment/docs/architecture.md).

## Microservice Evolution Plan

If the system outgrows a modular monolith, the most natural extraction path is:

- `Menu Service` for master menu management and outlet assignment
- `Inventory Service` for stock ownership and adjustments
- `Sales Service` for receipts, transactions, and idempotency
- `Reporting Service` for heavy aggregations and read models
- `Outlet Service` for outlet configuration and operational metadata

The current modular monolith is still the right starting point because sales and inventory require strong transaction boundaries today. The codebase already separates routes, controllers, services, repositories, and DTOs so those seams can later become service boundaries if needed.

## Offline POS Strategy

Offline behavior is documentation-only in this submission, but the intended operating model is:

1. The outlet POS writes transactions to a local database while internet access is unavailable.
2. Each offline sale receives a `clientSaleUuid` so HQ sync can be idempotent.
3. POS and KDS continue communicating on the local network through the outlet-local service or database.
4. When connectivity returns, unsynced sales are pushed to HQ in order.
5. HQ ignores duplicate `clientSaleUuid` values and only applies new transactions once.
6. Inventory differences are reconciled and surfaced for operator review if local/offline state diverges from HQ.

## Documentation References

- ERD: [erd.md](/workspaces/techzu_assessment/docs/erd.md)
- Architecture notes, scaling, microservices, and offline strategy: [architecture.md](/workspaces/techzu_assessment/docs/architecture.md)

Detailed strategy is documented in [docs/architecture.md](/workspaces/techzu_assessment/docs/architecture.md).

## Deployment Notes

- Backend container applies migrations on startup.
- Frontend is Vite-based for local use; for production, serve static build through CDN or Nginx.
- Use managed PostgreSQL, secret management, observability, and backup policies in production.
