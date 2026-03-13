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

## Relationship Notes

- `OutletMenuItem` is the HQ-to-outlet assignment table and stores outlet-specific price overrides.
- `Inventory` stores stock at the outlet + menu item level.
- `SaleItem` stores historical name and price snapshots so receipts remain correct after menu updates.
- `ReceiptSequence` keeps one row per outlet to support concurrency-safe sequential receipt generation.
