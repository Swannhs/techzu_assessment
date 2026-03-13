# ERD

```mermaid
erDiagram
    Outlet ||--o{ OutletMenuItem : "assigns"
    MenuItem ||--o{ OutletMenuItem : "is assigned"
    Outlet ||--o{ Inventory : "holds stock"
    MenuItem ||--o{ Inventory : "tracks stock for"
    Outlet ||--o{ Sale : "creates"
    Sale ||--o{ SaleItem : "contains"
    MenuItem ||--o{ SaleItem : "captured on"
    Outlet ||--|| ReceiptSequence : "owns"

    Outlet {
      int id PK
      string code UK
      string name
      string location
      datetime createdAt
      datetime updatedAt
    }

    MenuItem {
      int id PK
      string sku UK
      string name
      string description
      decimal basePrice
      int stockDeductionUnits
      bool isActive
      datetime createdAt
      datetime updatedAt
    }

    OutletMenuItem {
      int id PK
      int outletId FK
      int menuItemId FK
      decimal priceOverride
      bool isActive
      datetime createdAt
      datetime updatedAt
    }

    Inventory {
      int id PK
      int outletId FK
      int menuItemId FK
      int stockQuantity
      datetime updatedAt
    }

    Sale {
      bigint id PK
      int outletId FK
      string receiptNumber
      decimal subtotalAmount
      decimal totalAmount
      datetime createdAt
    }

    SaleItem {
      bigint id PK
      bigint saleId FK
      int menuItemId FK
      string itemNameSnapshot
      decimal unitPriceSnapshot
      int quantity
      decimal lineTotal
    }

    ReceiptSequence {
      int outletId PK,FK
      int lastNumber
      datetime updatedAt
    }

    %% Composite unique constraints
    %% OutletMenuItem(outletId, menuItemId)
    %% Inventory(outletId, menuItemId)
    %% Sale(outletId, receiptNumber)
```

## Entity Summary

- `Outlet` represents a physical branch managed by HQ.
- `MenuItem` is the HQ-owned master menu definition.
- `OutletMenuItem` is the assignment table that determines which menu items are available at each outlet and whether an outlet-specific price override applies.
- `Inventory` tracks stock by outlet and menu item.
- `Sale` stores the sale header for a completed transaction.
- `SaleItem` stores the individual line items for a sale, including historical snapshots of item name and unit price.
- `ReceiptSequence` stores the current sequential receipt counter for each outlet.

## Relationship Notes

- `OutletMenuItem` is the HQ-to-outlet assignment table and stores outlet-specific price overrides.
- `Inventory` stores stock at the outlet + menu item level.
- `SaleItem` stores historical name and price snapshots so receipts remain correct after menu updates.
- `ReceiptSequence` keeps one row per outlet to support concurrency-safe sequential receipt generation.

## How the Model Supports the Business Flow

### Menu assignment

HQ creates items in `MenuItem`. Availability at an outlet is controlled through `OutletMenuItem`, which links a menu item to an outlet and optionally stores a price override. This is how the same master menu can be selectively published across outlets.

### Inventory tracking

`Inventory` stores stock at the `(outletId, menuItemId)` level. Each outlet therefore has its own stock position for each assigned item, independent from other outlets.

### Sales and line items

`Sale` stores the transaction header and belongs to one outlet. `SaleItem` belongs to a sale and records which menu items were sold, in what quantity, and at what name and price snapshot.

### Receipt sequencing

`ReceiptSequence` stores one row per outlet. During sale creation, that row is incremented inside the database transaction so receipt numbers remain sequential and safe under concurrent requests for the same outlet.
