import 'dotenv/config';
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
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.supplierTransaction.deleteMany();
  await prisma.customerTransaction.deleteMany();
  await prisma.priceListItem.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.inventoryAuditItem.deleteMany();
  await prisma.inventoryAudit.deleteMany();
  await prisma.transferItem.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.stockEntry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.customerGroup.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();

  // ─── Units ───
  const unitDona = await prisma.unit.create({ data: { name: 'Dona (rulon)', shortName: 'dona' } });
  const unitM2 = await prisma.unit.create({ data: { name: 'Kvadrat metr', shortName: 'm²' } });
  const unitKarobka = await prisma.unit.create({ data: { name: 'Karobka', shortName: 'karobka' } });

  // ─── Categories ───
  const catSuyuq = await prisma.category.create({ data: { name: 'Suyuq oboylar', slug: 'suyuq-oboylar' } });
  const catVinil = await prisma.category.create({ data: { name: 'Vinil oboylar', slug: 'vinil-oboylar' } });
  const catQogoz = await prisma.category.create({ data: { name: "Qog'oz oboylar", slug: 'qogoz-oboylar' } });
  const catModern = await prisma.category.create({ data: { name: 'Modern Loft', slug: 'modern-loft' } });

  // ─── Folders ───
  const folderPremium = await prisma.folder.create({ data: { name: 'Premium Collection' } });
  const folderStandard = await prisma.folder.create({ data: { name: 'Standard Collection' } });

  // ─── Warehouses ───
  const whDenov = await prisma.warehouse.create({ data: { name: 'DENOV 2025', address: 'Denov tumani, Surxondaryo', isDefault: true } });
  const whTermiz = await prisma.warehouse.create({ data: { name: 'Termiz Asosiy', address: 'Termiz shahri', isDefault: false } });
  const whTashkent = await prisma.warehouse.create({ data: { name: 'Tashkent Branch 1', address: 'Toshkent shahri, Yunusobod', isDefault: false } });

  // ─── Products ───
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Silk Texture Ivory WP-09',
        sku: 'WP-0922-8821',
        barcode: '4780012345678',
        barcodeType: 'EAN13',
        sellPrice: 125000,
        wholesalePrice: 110000,
        minPrice: 95000,
        categoryId: catVinil.id,
        folderId: folderPremium.id,
        unitId: unitM2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Emerald Marble Gloss X-12',
        sku: 'EM-1200-XJ90',
        barcode: '4780012345679',
        barcodeType: 'EAN13',
        sellPrice: 185000,
        wholesalePrice: 160000,
        minPrice: 140000,
        categoryId: catVinil.id,
        folderId: folderPremium.id,
        unitId: unitM2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Industrial Concrete Navy C-01',
        sku: 'IC-0199-B012',
        barcode: '4780012345680',
        barcodeType: 'EAN13',
        sellPrice: 95000,
        wholesalePrice: 82000,
        minPrice: 70000,
        categoryId: catModern.id,
        folderId: folderStandard.id,
        unitId: unitM2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Organic Linen Beige LW-22',
        sku: 'LW-2233-X02',
        barcode: '4780012345681',
        barcodeType: 'EAN13',
        sellPrice: 75000,
        wholesalePrice: 65000,
        minPrice: 55000,
        categoryId: catQogoz.id,
        folderId: folderStandard.id,
        unitId: unitM2.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Brushed Charcoal Metal M-05',
        sku: 'BM-0505-Z11',
        barcode: '4780012345682',
        barcodeType: 'EAN13',
        sellPrice: 210000,
        wholesalePrice: 185000,
        minPrice: 160000,
        categoryId: catModern.id,
        folderId: folderPremium.id,
        unitId: unitDona.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Silk Plaster Premium 01',
        sku: 'SP-PREM-01',
        barcode: '4780012345683',
        barcodeType: 'EAN13',
        sellPrice: 320000,
        wholesalePrice: 280000,
        minPrice: 250000,
        categoryId: catSuyuq.id,
        folderId: folderPremium.id,
        unitId: unitKarobka.id,
      },
    }),
  ]);

  // ─── Stock Entries ───
  await Promise.all([
    prisma.stockEntry.create({ data: { productId: products[0].id, warehouseId: whDenov.id, quantity: 1240, reserved: 120, costPrice: 80000 } }),
    prisma.stockEntry.create({ data: { productId: products[1].id, warehouseId: whTermiz.id, quantity: 42, reserved: 42, costPrice: 130000 } }),
    prisma.stockEntry.create({ data: { productId: products[2].id, warehouseId: whTashkent.id, quantity: 850, reserved: 50, costPrice: 55000 } }),
    prisma.stockEntry.create({ data: { productId: products[3].id, warehouseId: whDenov.id, quantity: 2100, reserved: 0, costPrice: 45000 } }),
    prisma.stockEntry.create({ data: { productId: products[4].id, warehouseId: whDenov.id, quantity: 310, reserved: 0, costPrice: 140000 } }),
    prisma.stockEntry.create({ data: { productId: products[5].id, warehouseId: whTermiz.id, quantity: 0, reserved: 0, costPrice: 200000 } }),
  ]);

  // ─── Customer Groups ───
  const gVip = await prisma.customerGroup.create({ data: { name: 'VIP Mijozlar', description: "Eng ko'p xarid qiladigan mijozlar", defaultDiscount: 15 } });
  const gUlgurji = await prisma.customerGroup.create({ data: { name: 'Ulgurji xaridorlar', description: 'Katta miqdorda mahsulot oladiganlar', defaultDiscount: 10 } });
  const gOddiy = await prisma.customerGroup.create({ data: { name: 'Oddiy mijozlar', description: 'Standart xaridorlar', defaultDiscount: 0 } });
  const gQora = await prisma.customerGroup.create({ data: { name: "Qora ro'yxat", description: "Qarzini to'lamaganlar", defaultDiscount: 0 } });

  // ─── Customers ───
  await Promise.all([
    prisma.customer.create({
      data: { fullName: 'Anvar Zokirov', companyName: '"Zokirov Global Logistics" MCHJ', phone: '+998 90 123 45 67', region: 'Toshkent', status: 'ACTIVE', groupId: gVip.id, balanceUSD: 1250, balanceUZS: 15812500 },
    }),
    prisma.customer.create({
      data: { fullName: "Otabek To'rayev", companyName: '"Tashkent Wallpaper Center" OK', phone: '+998 91 987 65 43', region: 'Toshkent', status: 'ACTIVE', groupId: gUlgurji.id, balanceUSD: -450, balanceUZS: -5692500 },
    }),
    prisma.customer.create({
      data: { fullName: 'Malika Mansurova', companyName: 'Mansurova Malika YaTT', phone: '+998 93 333 44 55', region: 'Samarqand', status: 'INACTIVE', groupId: gOddiy.id, balanceUSD: 0, balanceUZS: 0 },
    }),
    prisma.customer.create({
      data: { fullName: 'Sherzod Baxtiyorov', companyName: '"Elite Wall Decor" XK', phone: '+998 94 444 55 66', region: "Farg'ona", status: 'ACTIVE', groupId: gVip.id, balanceUSD: 8900, balanceUZS: 112585000 },
    }),
  ]);

  // ─── Suppliers ───
  await Promise.all([
    prisma.supplier.create({
      data: { name: 'EuroDecor Global', contactPerson: 'Hans Mueller', phone: '+49 30 123456', category: 'Import', status: 'ACTIVE', balanceUSD: -25000, balanceUZS: 0 },
    }),
    prisma.supplier.create({
      data: { name: 'Artisan Fabrics Co.', contactPerson: 'Li Wei', phone: '+86 21 987654', category: 'Import', status: 'ACTIVE', balanceUSD: -8500, balanceUZS: -120000000 },
    }),
    prisma.supplier.create({
      data: { name: 'Nordic Design Ltd', contactPerson: 'Erik Svensson', phone: '+46 8 555 1234', category: 'Import', status: 'ACTIVE', balanceUSD: -3200, balanceUZS: 0 },
    }),
  ]);

  // ─── Price Lists ───
  const plPremium = await prisma.priceList.create({
    data: {
      name: 'Premium Koleksiya 2024',
      type: 'SALE',
      isActive: true,
      items: {
        create: [
          { productId: products[0].id, price: 125000 },
          { productId: products[1].id, price: 185000 },
          { productId: products[4].id, price: 210000 },
          { productId: products[5].id, price: 320000 },
        ],
      },
    },
  });

  await prisma.priceList.create({
    data: {
      name: 'Xitoy import - Fevral',
      type: 'PURCHASE',
      isActive: true,
      items: {
        create: [
          { productId: products[0].id, price: 80000 },
          { productId: products[1].id, price: 130000 },
          { productId: products[2].id, price: 55000 },
        ],
      },
    },
  });

  // ─── Inventory Audit ───
  await prisma.inventoryAudit.create({
    data: {
      docNumber: 'INV-2024-001',
      date: new Date('2024-04-01'),
      warehouseId: whDenov.id,
      responsiblePerson: 'Admin User',
      status: 'COMPLETED',
      items: {
        create: [
          { productId: products[0].id, systemQty: 1244, actualQty: 1240, difference: -4 },
          { productId: products[3].id, systemQty: 2100, actualQty: 2100, difference: 0 },
        ],
      },
    },
  });

  await prisma.inventoryAudit.create({
    data: {
      docNumber: 'INV-2024-002',
      date: new Date('2024-03-15'),
      warehouseId: whTermiz.id,
      responsiblePerson: 'Omborchi',
      status: 'IN_PROGRESS',
      items: {
        create: [
          { productId: products[1].id, systemQty: 42, actualQty: 42, difference: 0 },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`   📦 ${products.length} products`);
  console.log(`   🏢 3 warehouses`);
  console.log(`   👥 4 customers in 4 groups`);
  console.log(`   🚚 3 suppliers`);
  console.log(`   💰 2 price lists`);
  console.log(`   📋 2 inventory audits`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
