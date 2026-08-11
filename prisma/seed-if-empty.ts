import { PrismaClient } from "@prisma/client";

/**
 * Safe-for-production seeding: only runs the full (destructive) seed script
 * when the database is genuinely empty — i.e. the first deploy. On every
 * later deploy this is a no-op, so real data is never wiped. Wired into
 * render.yaml's preDeployCommand; for local resets use `npm run db:seed`
 * (prisma/seed.ts) directly, which always reseeds from scratch.
 */
async function main() {
  const prisma = new PrismaClient();
  const userCount = await prisma.user.count();
  await prisma.$disconnect();

  if (userCount > 0) {
    console.log(`Database already has ${userCount} user(s) — skipping seed.`);
    return;
  }

  console.log("Database is empty — running initial seed...");
  await import("./seed");
}

main().catch((err) => {
  console.error("seed-if-empty failed:", err);
  process.exit(1);
});
