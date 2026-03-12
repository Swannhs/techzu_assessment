CREATE UNIQUE INDEX "OutletMenuItem_outletId_menuItemId_key"
ON "OutletMenuItem" ("outletId", "menuItemId");

CREATE INDEX "OutletMenuItem_outletId_idx"
ON "OutletMenuItem" ("outletId");

CREATE UNIQUE INDEX "Inventory_outletId_menuItemId_key"
ON "Inventory" ("outletId", "menuItemId");

CREATE INDEX "Inventory_outletId_menuItemId_idx"
ON "Inventory" ("outletId", "menuItemId");

CREATE UNIQUE INDEX "Sale_outletId_receiptNumber_key"
ON "Sale" ("outletId", "receiptNumber");

CREATE INDEX "Sale_outletId_createdAt_idx"
ON "Sale" ("outletId", "createdAt");

CREATE INDEX "SaleItem_saleId_idx"
ON "SaleItem" ("saleId");

CREATE INDEX "SaleItem_menuItemId_idx"
ON "SaleItem" ("menuItemId");

ALTER TABLE "Inventory"
ADD CONSTRAINT "Inventory_stockQuantity_check" CHECK ("stockQuantity" >= 0);

ALTER TABLE "MenuItem"
ADD CONSTRAINT "MenuItem_basePrice_check" CHECK ("basePrice" >= 0);

ALTER TABLE "MenuItem"
ADD CONSTRAINT "MenuItem_stockDeductionUnits_check" CHECK ("stockDeductionUnits" > 0);

ALTER TABLE "OutletMenuItem"
ADD CONSTRAINT "OutletMenuItem_priceOverride_check" CHECK ("priceOverride" IS NULL OR "priceOverride" >= 0);

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_subtotalAmount_check" CHECK ("subtotalAmount" >= 0);

ALTER TABLE "Sale"
ADD CONSTRAINT "Sale_totalAmount_check" CHECK ("totalAmount" >= 0);

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_quantity_check" CHECK ("quantity" > 0);

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_unitPriceSnapshot_check" CHECK ("unitPriceSnapshot" >= 0);

ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_lineTotal_check" CHECK ("lineTotal" >= 0);
