import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.outletMenuItem.deleteMany();
  await prisma.receiptSequence.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.outlet.deleteMany();

  const outlets = await prisma.$transaction([
    prisma.outlet.create({
      data: {
        code: "OUTLET01",
        name: "Central Plaza",
        location: "Downtown"
      }
    }),
    prisma.outlet.create({
      data: {
        code: "OUTLET02",
        name: "Riverside Mall",
        location: "Riverside"
      }
    }),
    prisma.outlet.create({
      data: {
        code: "OUTLET03",
        name: "Airport Express",
        location: "Airport Terminal"
      }
    })
  ]);

  const menuItems = await prisma.$transaction([
    prisma.menuItem.create({
      data: {
        sku: "BRG-001",
        name: "Classic Burger",
        description: "Beef burger with cheese and lettuce",
        basePrice: "12.50",
        stockDeductionUnits: 1,
        isActive: true
      }
    }),
    prisma.menuItem.create({
      data: {
        sku: "PST-002",
        name: "Creamy Pasta",
        description: "Mushroom cream pasta",
        basePrice: "14.00",
        stockDeductionUnits: 1,
        isActive: true
      }
    }),
    prisma.menuItem.create({
      data: {
        sku: "TEA-003",
        name: "Iced Lemon Tea",
        description: "Fresh brewed lemon tea",
        basePrice: "4.50",
        stockDeductionUnits: 1,
        isActive: true
      }
    }),
    prisma.menuItem.create({
      data: {
        sku: "CKN-004",
        name: "Chicken Rice Bowl",
        description: "Roasted chicken over rice",
        basePrice: "10.90",
        stockDeductionUnits: 1,
        isActive: true
      }
    })
  ]);

  await prisma.outletMenuItem.createMany({
    data: [
      {
        outletId: outlets[0].id,
        menuItemId: menuItems[0].id,
        priceOverride: "12.50",
        isActive: true
      },
      {
        outletId: outlets[0].id,
        menuItemId: menuItems[1].id,
        priceOverride: "14.50",
        isActive: true
      },
      {
        outletId: outlets[0].id,
        menuItemId: menuItems[2].id,
        priceOverride: "4.75",
        isActive: true
      },
      {
        outletId: outlets[1].id,
        menuItemId: menuItems[0].id,
        priceOverride: "13.00",
        isActive: true
      },
      {
        outletId: outlets[1].id,
        menuItemId: menuItems[2].id,
        priceOverride: "4.50",
        isActive: true
      },
      {
        outletId: outlets[1].id,
        menuItemId: menuItems[3].id,
        priceOverride: "11.20",
        isActive: true
      },
      {
        outletId: outlets[2].id,
        menuItemId: menuItems[2].id,
        priceOverride: "4.90",
        isActive: true
      }
    ]
  });

  await prisma.inventory.createMany({
    data: [
      { outletId: outlets[0].id, menuItemId: menuItems[0].id, stockQuantity: 50 },
      { outletId: outlets[0].id, menuItemId: menuItems[1].id, stockQuantity: 40 },
      { outletId: outlets[0].id, menuItemId: menuItems[2].id, stockQuantity: 180 },
      { outletId: outlets[1].id, menuItemId: menuItems[0].id, stockQuantity: 35 },
      { outletId: outlets[1].id, menuItemId: menuItems[2].id, stockQuantity: 150 },
      { outletId: outlets[1].id, menuItemId: menuItems[3].id, stockQuantity: 60 },
      { outletId: outlets[2].id, menuItemId: menuItems[2].id, stockQuantity: 90 }
    ]
  });

  await prisma.receiptSequence.createMany({
    data: outlets.map((outlet) => ({
      outletId: outlet.id,
      lastNumber: 0
    }))
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
