import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPhone = '998901234567';
  const adminPassword = 'admin';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      password: hashedPassword,
    },
    create: {
      phone: adminPhone,
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create sample categories if none exist
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    await prisma.category.createMany({
      data: [
        { name: 'Suyuq oboylar', slug: 'suyuq-oboylar' },
        { name: 'Vinil oboylar', slug: 'vinil-oboylar' },
        { name: "Qog'oz oboylar", slug: 'qogoz-oboylar' },
        { name: 'Modern Loft', slug: 'modern-loft' },
      ],
    });
    console.log('Created sample categories');
  }

  // Create sample warehouses if none exist
  const whCount = await prisma.warehouse.count();
  if (whCount === 0) {
    await prisma.warehouse.createMany({
      data: [
        { name: 'Asosiy ombor', address: 'Toshkent' },
        { name: 'Filial ombor', address: 'Samarqand' },
        { name: "Do'kon ombori", address: 'Buxoro' },
      ],
    });
    console.log('Created sample warehouses');
  }

  // Get first warehouse and category
  const warehouse = await prisma.warehouse.findFirst();
  const category = await prisma.category.findFirst();

  // Create sample products if none exist
  const prodCount = await prisma.product.count();
  if (prodCount === 0 && warehouse && category) {
    const products = await prisma.product.createManyAndReturn({
      data: [
        { name: 'Silk Texture Premium', sku: 'ST-001', categoryId: category.id, sellPrice: 45, wholesalePrice: 35, minPrice: 30 },
        { name: 'Vinyl Classic Blue', sku: 'VC-002', categoryId: category.id, sellPrice: 38, wholesalePrice: 28, minPrice: 25 },
        { name: 'Paper Floral', sku: 'PF-003', categoryId: category.id, sellPrice: 25, wholesalePrice: 18, minPrice: 15 },
        { name: 'Loft Modern Grey', sku: 'LM-004', categoryId: category.id, sellPrice: 55, wholesalePrice: 42, minPrice: 38 },
      ],
    });

    // Add stock entries
    for (const product of products) {
      await prisma.stockEntry.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: Math.floor(Math.random() * 100) + 50,
          costPrice: product.wholesalePrice,
        },
      });
    }
    console.log('Created sample products with stock');
  }

  // Create sample customers if none exist
  const custCount = await prisma.customer.count();
  if (custCount === 0) {
    await prisma.customer.createMany({
      data: [
        { fullName: 'Ali Valiyev', phone: '+998901234567', balanceUSD: 500 },
        { fullName: 'Sardor Karimov', phone: '+998901234568', balanceUSD: 1200 },
        { fullName: 'Nodira Ahmedova', phone: '+998901234569', balanceUSD: 800 },
        { fullName: 'Bobur Rahimov', phone: '+998901234570', balanceUSD: 350 },
      ],
    });
    console.log('Created sample customers');
  }

  // Create sample suppliers if none exist
  const suppCount = await prisma.supplier.count();
  if (suppCount === 0) {
    await prisma.supplier.createMany({
      data: [
        { name: 'Turk Oboy Ltd', contactPerson: 'Mehmet Yilmaz', phone: '+905551234567', balanceUSD: -15000 },
        { name: 'China Wall Co', contactPerson: 'Wei Zhang', phone: '+8613812345678', balanceUSD: -8500 },
        { name: 'Uzbekiston Oboy', contactPerson: 'Rustam Aliyev', phone: '+998909876543', balanceUSD: -5200 },
      ],
    });
    console.log('Created sample suppliers');
  }

  // Create sample orders (sales) for the last 30 days
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const customers = await prisma.customer.findMany();
    const products = await prisma.product.findMany();
    
    if (customers.length > 0 && products.length > 0 && warehouse) {
      // Create 15 sample orders over the last 30 days
      for (let i = 0; i < 15; i++) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
        orderDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

        const customer = customers[Math.floor(Math.random() * customers.length)];
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, numItems);

        const items = selectedProducts.map(p => ({
          productId: p.id,
          quantity: Math.floor(Math.random() * 5) + 1,
          price: p.sellPrice,
        }));

        const finalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        await prisma.order.create({
          data: {
            docNumber: `SL-${String(1000 + i).padStart(4, '0')}`,
            customerId: customer.id,
            warehouseId: warehouse.id,
            date: orderDate,
            finalAmount,
            status: 'COMPLETED',
            paymentMethod: ['CASH', 'CARD', 'TRANSFER'][Math.floor(Math.random() * 3)],
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price,
              })),
            },
          },
        });
      }
      console.log('Created 15 sample orders');
    }
  }

  // Create sample purchases for the last 30 days
  const purchaseCount = await prisma.purchase.count();
  if (purchaseCount === 0) {
    const suppliers = await prisma.supplier.findMany();
    const products = await prisma.product.findMany();
    
    if (suppliers.length > 0 && products.length > 0 && warehouse) {
      // Create 10 sample purchases over the last 30 days
      for (let i = 0; i < 10; i++) {
        const purchaseDate = new Date();
        purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 30));
        purchaseDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, numItems);

        const items = selectedProducts.map(p => ({
          productId: p.id,
          quantity: Math.floor(Math.random() * 20) + 10,
          price: p.wholesalePrice,
        }));

        const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        await prisma.purchase.create({
          data: {
            docNumber: `PR-${String(1000 + i).padStart(4, '0')}`,
            supplierId: supplier.id,
            warehouseId: warehouse.id,
            date: purchaseDate,
            totalAmount,
            status: 'COMPLETED',
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price,
              })),
            },
          },
        });
      }
      console.log('Created 10 sample purchases');
    }
  }

  console.log('Seed successful: All sample data created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
