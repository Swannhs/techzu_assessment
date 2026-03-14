ALTER TABLE "Inventory"
ADD CONSTRAINT "Inventory_outletId_menuItemId_assignment_fkey"
FOREIGN KEY ("outletId", "menuItemId")
REFERENCES "OutletMenuItem" ("outletId", "menuItemId")
ON DELETE CASCADE
ON UPDATE CASCADE;
