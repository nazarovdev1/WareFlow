import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const p = await prisma.product.findFirst();
  if (!p) return console.log('No products');
  console.log('Attempting to delete', p.id);
  
  try {
    await prisma.$transaction([
      prisma.stockEntry.deleteMany({ where: { productId: p.id } }),
      prisma.transferItem.deleteMany({ where: { productId: p.id } }),
      prisma.inventoryAuditItem.deleteMany({ where: { productId: p.id } }),
      prisma.priceListItem.deleteMany({ where: { productId: p.id } }),
      prisma.product.delete({ where: { id: p.id } }),
    ]);
    console.log('Success');
  } catch(e) {
    console.error('Failed', e);
  }
}
main();
