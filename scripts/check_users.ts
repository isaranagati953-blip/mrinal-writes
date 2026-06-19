import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({
  adapter: adapter,
});

async function main() {
  console.log("--- USERS ---");
  const users = await db.user.findMany();
  for (const u of users) {
    console.log({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
    });
  }

  console.log("\n--- RECENT AUDIT LOGS ---");
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  for (const l of logs) {
    console.log({
      id: l.id,
      userId: l.userId,
      action: l.action,
      detail: l.detail,
      ipAddress: l.ipAddress,
      createdAt: l.createdAt,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
