# Architecture Documentation

## System Overview

The system is implemented as a modular monolith:

- React + TypeScript frontend
- Express + TypeScript backend
- Prisma data access layer
- PostgreSQL transactional database

The backend uses clear application layers:

- `routes`: HTTP endpoint definitions
- `controllers`: transport-layer orchestration and DTO mapping
- `services`: business rules, transaction boundaries, and use-case coordination
- `repositories`: Prisma access and raw SQL operations
- `validators`: Zod schemas for request shape validation
- `middlewares`: centralized validation and error handling

This structure keeps transport, business logic, and data access concerns separated. It is still simple to run as one application, but each module boundary already acts like a seam for future extraction if scale or team size grows.

## ERD

See [erd.md](/workspaces/techzu_assessment/docs/erd.md).

## Scaling Plan: 10 Outlets / 100,000 Transactions per Month

### Database scaling strategies

- PostgreSQL with current indexing is sufficient for this volume.
- Add PgBouncer for connection pooling and to stabilize many concurrent POS requests.
- Keep write workloads on primary.
- Add read replicas for report-heavy read traffic.
- Partition `Sale` and `SaleItem` by month if retention volume grows beyond what normal indexing handles comfortably.
- Maintain aggressive index and vacuum monitoring.
- Review hot indexes regularly, especially `Sale(outletId, createdAt)` and `Inventory(outletId, menuItemId)`.

### Reporting performance considerations

- Current aggregate SQL is acceptable at this scale.
- For growth, precompute daily summaries in materialized views or summary tables.
- Cache report responses with short TTL.
- Offload expensive analytics to replicas or a warehouse.
- If dashboards become heavily used, move them toward append-only reporting tables updated by background jobs or events.

### Infrastructure considerations

- Run stateless backend containers behind a load balancer.
- Host frontend as static assets/CDN in production.
- Use managed PostgreSQL with backups and failover.
- Add centralized logs, metrics, and traces.
- Monitor lock waits on inventory updates and receipt sequence rows.
- Tune Prisma connection handling to avoid exhausting PostgreSQL connections as backend replicas increase.

### Architectural evolution

- Keep modular monolith while transaction consistency is critical.
- Introduce outbox/event publishing for `sale.created`, `inventory.adjusted`, and `menu.assigned`.
- Grow toward CQRS for heavy reporting workloads.
- Introduce idempotency keys for client-side retries.
- Add background workers for report projection updates rather than pushing more synchronous work into sale requests.

## Microservices Evolution

Future split candidates:

- Menu service
- Inventory service
- Sales service
- Reporting service
- Outlet/config service

Why the modular monolith is the right starting point:

- sales, receipt sequencing, and inventory deduction are strongly transactional today
- the current scale does not justify distributed systems overhead
- a single codebase is faster to understand, test, and deliver in an assessment setting

Why these services become useful later:

- Sales and inventory are write-heavy with strict consistency needs.
- Reporting has very different scaling patterns.
- Menu and outlet config change less frequently and can be independently deployed.
- Teams can own smaller bounded contexts with clearer responsibility boundaries.

Migration approach:

- Preserve current module boundaries as seams.
- Add outbox events and asynchronous consumers.
- Enforce idempotency and deduplication between services.
- Keep data ownership per service and avoid cross-service distributed transactions.
- Replace synchronous in-process assumptions with explicit contracts, retries, and dead-letter handling.

## Offline POS Strategy

### Offline operation

- Each outlet uses local persistence (local DB/outlet service) as temporary source of truth.
- POS creates local sales and local receipt continuity.
- KDS communication stays on outlet LAN via local service or message bus.

### Reconnect and sync

- Queue unsynced events locally while offline.
- Sync to HQ when network returns.
- Include `clientSaleUuid` for idempotent upsert at HQ.
- Reject duplicates by unique key and return existing record.
- Process sync in order and retain retry metadata so a partially synced outlet can resume safely.

### Reconciliation

- Replay queued events in order.
- Reconcile inventory drift if local stock diverges from HQ.
- Preserve audit trails for offline-to-online merges.
- Surface reconciliation exceptions to HQ operators instead of silently overwriting outlet state.
