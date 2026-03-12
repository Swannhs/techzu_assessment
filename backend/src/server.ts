import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

async function bootstrap() {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    console.log(`Backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("Failed to start backend", error);
  await prisma.$disconnect();
  process.exit(1);
});
