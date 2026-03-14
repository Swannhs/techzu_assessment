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
    }),
    prisma.menuItem.create({
      data: {
        sku: "SAL-005",
        name: "Garden Salad",
        description: "Mixed greens with citrus dressing",
        basePrice: "8.20",
        stockDeductionUnits: 1,
        isActive: true
      }
    }),
    prisma.menuItem.create({
      data: {
        sku: "COF-006",
        name: "Cold Brew Coffee",
        description: "Slow-steeped cold brew over ice",
        basePrice: "5.40",
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
      },
      {
        outletId: outlets[2].id,
        menuItemId: menuItems[4].id,
        priceOverride: "8.50",
        isActive: true
      },
      {
        outletId: outlets[2].id,
        menuItemId: menuItems[5].id,
        priceOverride: "5.90",
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
      { outletId: outlets[2].id, menuItemId: menuItems[2].id, stockQuantity: 90 },
      { outletId: outlets[2].id, menuItemId: menuItems[4].id, stockQuantity: 45 },
      { outletId: outlets[2].id, menuItemId: menuItems[5].id, stockQuantity: 70 }
    ]
  });

  await prisma.receiptSequence.createMany({
    data: [
      {
        outletId: outlets[0].id,
        lastNumber: 2
      },
      {
        outletId: outlets[1].id,
        lastNumber: 1
      },
      {
        outletId: outlets[2].id,
        lastNumber: 0
      }
    ]
  });

  const saleOne = await prisma.sale.create({
    data: {
      outletId: outlets[0].id,
      receiptNumber: "OUTLET01-000001",
      subtotalAmount: "29.75",
      totalAmount: "29.75"
    }
  });

  const saleTwo = await prisma.sale.create({
    data: {
      outletId: outlets[0].id,
      receiptNumber: "OUTLET01-000002",
      subtotalAmount: "19.25",
      totalAmount: "19.25"
    }
  });

  const saleThree = await prisma.sale.create({
    data: {
      outletId: outlets[1].id,
      receiptNumber: "OUTLET02-000001",
      subtotalAmount: "28.70",
      totalAmount: "28.70"
    }
  });

  await prisma.saleItem.createMany({
    data: [
      {
        saleId: saleOne.id,
        menuItemId: menuItems[0].id,
        itemNameSnapshot: "Classic Burger",
        unitPriceSnapshot: "12.50",
        quantity: 2,
        lineTotal: "25.00"
      },
      {
        saleId: saleOne.id,
        menuItemId: menuItems[2].id,
        itemNameSnapshot: "Iced Lemon Tea",
        unitPriceSnapshot: "4.75",
        quantity: 1,
        lineTotal: "4.75"
      },
      {
        saleId: saleTwo.id,
        menuItemId: menuItems[1].id,
        itemNameSnapshot: "Creamy Pasta",
        unitPriceSnapshot: "14.50",
        quantity: 1,
        lineTotal: "14.50"
      },
      {
        saleId: saleTwo.id,
        menuItemId: menuItems[2].id,
        itemNameSnapshot: "Iced Lemon Tea",
        unitPriceSnapshot: "4.75",
        quantity: 1,
        lineTotal: "4.75"
      },
      {
        saleId: saleThree.id,
        menuItemId: menuItems[0].id,
        itemNameSnapshot: "Classic Burger",
        unitPriceSnapshot: "13.00",
        quantity: 1,
        lineTotal: "13.00"
      },
      {
        saleId: saleThree.id,
        menuItemId: menuItems[3].id,
        itemNameSnapshot: "Chicken Rice Bowl",
        unitPriceSnapshot: "11.20",
        quantity: 1,
        lineTotal: "11.20"
      },
      {
        saleId: saleThree.id,
        menuItemId: menuItems[2].id,
        itemNameSnapshot: "Iced Lemon Tea",
        unitPriceSnapshot: "4.50",
        quantity: 1,
        lineTotal: "4.50"
      }
    ]
  });

  console.log("Seed completed successfully.");
}

main()
  .catch(async (error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
