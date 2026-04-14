import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const results = {
      products: 0,
      categories: 0,
      customers: 0,
      suppliers: 0,
      errors: [] as string[],
    };

    // Import categories
    if (data.categories?.length > 0) {
      for (const category of data.categories) {
        try {
          await prisma.category.upsert({
            where: { id: category.id },
            update: {
              name: category.name,
              slug: category.slug,
            },
            create: {
              id: category.id,
              name: category.name,
              slug: category.slug,
            },
          });
          results.categories++;
        } catch (error: any) {
          results.errors.push(`Category ${category.name}: ${error.message}`);
        }
      }
    }

    // Import products
    if (data.products?.length > 0) {
      for (const product of data.products) {
        try {
          await prisma.product.upsert({
            where: { id: product.id },
            update: {
              name: product.name,
              sku: product.sku,
              sellPrice: product.sellPrice,
              wholesalePrice: product.wholesalePrice,
              minPrice: product.minPrice,
              categoryId: product.categoryId,
            },
            create: {
              id: product.id,
              name: product.name,
              sku: product.sku,
              sellPrice: product.sellPrice,
              wholesalePrice: product.wholesalePrice,
              minPrice: product.minPrice,
              categoryId: product.categoryId,
            },
          });
          results.products++;
        } catch (error: any) {
          results.errors.push(`Product ${product.name}: ${error.message}`);
        }
      }
    }

    // Import customers
    if (data.customers?.length > 0) {
      for (const customer of data.customers) {
        try {
          await prisma.customer.upsert({
            where: { id: customer.id },
            update: {
              fullName: customer.fullName,
              phone: customer.phone,
              balanceUSD: customer.balanceUSD,
              balanceUZS: customer.balanceUZS,
            },
            create: {
              id: customer.id,
              fullName: customer.fullName,
              phone: customer.phone,
              balanceUSD: customer.balanceUSD,
              balanceUZS: customer.balanceUZS,
            },
          });
          results.customers++;
        } catch (error: any) {
          results.errors.push(`Customer ${customer.fullName}: ${error.message}`);
        }
      }
    }

    // Import suppliers
    if (data.suppliers?.length > 0) {
      for (const supplier of data.suppliers) {
        try {
          await prisma.supplier.upsert({
            where: { id: supplier.id },
            update: {
              name: supplier.name,
              phone: supplier.phone,
              balanceUSD: supplier.balanceUSD,
              balanceUZS: supplier.balanceUZS,
            },
            create: {
              id: supplier.id,
              name: supplier.name,
              phone: supplier.phone,
              balanceUSD: supplier.balanceUSD,
              balanceUZS: supplier.balanceUZS,
            },
          });
          results.suppliers++;
        } catch (error: any) {
          results.errors.push(`Supplier ${supplier.name}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      results,
    });
  } catch (error) {
    console.error('POST /api/settings/import error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
