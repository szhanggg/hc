import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { needs } from '../data/seed';
import path from 'path';

// DATABASE_URL is file:./dev.db — relative to project root
const dbPath = path.resolve(__dirname, '..', 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const need of needs) {
    await prisma.need.upsert({
      where: { id: need.id },
      update: {},
      create: {
        id: need.id,
        name: need.name,
        house: need.house,
        quantityNeeded: need.quantityNeeded,
        quantityFulfilled: need.quantityFulfilled,
        unitCost: need.unitCost,
        daysOpen: need.daysOpen,
        category: need.category,
        linkedPatientId: need.linkedPatientId ?? null,
        description: need.description ?? null,
        volunteerBlurb: need.volunteerBlurb ?? null,
      },
    });
  }
  console.log(`Seeded ${needs.length} needs.`);
}

main().finally(() => prisma.$disconnect());
