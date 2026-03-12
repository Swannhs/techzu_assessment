# Architecture Documentation

## Architecture Summary

The implementation is a modular monolith:

- React + TypeScript frontend
- Express + TypeScript backend
- Prisma data access layer
- PostgreSQL transactional database

Backend layering:

- `routes`: HTTP endpoint definitions
- `controllers`: request/response translation
- `services`: business logic and transaction boundaries
- `repositories`: Prisma + SQL data access
- `validators`: Zod schemas
- `middlewares`: error and request handling

## ERD

See [erd.md](/workspaces/techzu_assessment/docs/erd.md).

## Scaling Plan: 10 Outlets / 100,000 Transactions per Month

### Database scaling strategies

- PostgreSQL with current indexing is sufficient for this volume.
- Add PgBouncer for connection pooling and to stabilize many concurrent POS requests.
- Keep write workloads on primary.
- Add read replicas for report-heavy read traffic.
- Partition `Sale` and `SaleItem` by month if retention volume grows.
- Maintain aggressive index and vacuum monitoring.

### Reporting performance considerations

- Current aggregate SQL is acceptable at this scale.
- For growth, precompute daily summaries in materialized views or summary tables.
- Cache report responses with short TTL.
- Offload expensive analytics to replicas or a warehouse.

### Infrastructure considerations

- Run stateless backend containers behind a load balancer.
- Host frontend as static assets/CDN in production.
- Use managed PostgreSQL with backups and failover.
- Add centralized logs, metrics, and traces.
- Monitor lock waits on inventory updates and receipt sequence rows.

### Architectural evolution

- Keep modular monolith while transaction consistency is critical.
- Introduce outbox/event publishing for `sale.created`, `inventory.adjusted`, and `menu.assigned`.
- Grow toward CQRS for heavy reporting workloads.
- Introduce idempotency keys for client-side retries.

## Microservices Evolution

Future split candidates:

- Menu service
- Inventory service
- Sales service
- Reporting service
- Outlet/config service

Why these boundaries:

- Sales and inventory are write-heavy with strict consistency needs.
- Reporting has very different scaling patterns.
- Menu and outlet config change less frequently and can be independently deployed.

Migration approach:

- Preserve current module boundaries as seams.
- Add outbox events and asynchronous consumers.
- Enforce idempotency and deduplication between services.
- Keep data ownership per service and avoid cross-service distributed transactions.

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

### Reconciliation

- Replay queued events in order.
- Reconcile inventory drift if local stock diverges from HQ.
- Preserve audit trails for offline-to-online merges.
