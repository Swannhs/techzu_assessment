import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
