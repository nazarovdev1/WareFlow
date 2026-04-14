import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/dashboard/stats — Aggregated dashboard statistics with real-time chart data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // today, week, month, year

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Fetch all data in parallel for performance
    const [
      totalProducts,
      totalWarehouses,
      totalCustomers,
      totalSuppliers,
      stockStats,
      customerDebt,
      supplierDebt,
      todayTransfers,
      activePriceLists,
      outOfStockCount,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.warehouse.count(),
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.stockEntry.aggregate({
        _sum: { quantity: true },
      }),
      prisma.customer.aggregate({
        _sum: { balanceUSD: true, balanceUZS: true },
      }),
      prisma.supplier.aggregate({
        _sum: { balanceUSD: true, balanceUZS: true },
      }),
      prisma.transfer.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.priceList.count({ where: { isActive: true } }),
      prisma.stockEntry.count({ where: { quantity: { lte: 0 } } }),
    ]);

    // Fetch orders (with error handling)
    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          date: { gte: startDate },
        },
        select: {
          date: true,
          finalAmount: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (err) {
      console.warn('Orders table not available:', err);
    }

    // Fetch purchases (with error handling)
    let purchases: any[] = [];
    try {
      purchases = await prisma.purchase.findMany({
        where: {
          status: 'COMPLETED',
          date: { gte: startDate },
        },
        select: {
          date: true,
          totalAmount: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (err) {
      console.warn('Purchases table not available:', err);
    }

    // Fetch categories (with error handling)
    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
          products: {
            select: {
              stockEntries: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
      });
    } catch (err) {
      console.warn('Categories not available:', err);
    }

    // Fetch products with stock (with error handling)
    let productsWithStock: any[] = [];
    try {
      productsWithStock = await prisma.product.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          stockEntries: {
            select: {
              quantity: true,
              costPrice: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy: {
          stockEntries: {
            _count: 'desc',
          },
        },
      });
    } catch (err) {
      console.warn('Products/stock not available:', err);
    }

    // Fetch recent orders (with error handling)
    let recentOrders: any[] = [];
    try {
      recentOrders = await prisma.order.findMany({
        take: 5,
        where: { status: 'COMPLETED' },
        orderBy: { date: 'desc' },
        include: {
          customer: {
            select: {
              fullName: true,
            },
          },
          items: {
            select: {
              quantity: true,
              total: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn('Recent orders not available:', err);
    }

    // Fetch recent transactions (with error handling)
    let recentTransactions: any[] = [];
    try {
      recentTransactions = await prisma.customerTransaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          customer: {
            select: {
              fullName: true,
            },
          },
        },
      });
    } catch (err) {
      console.warn('Recent transactions not available:', err);
    }

    // Process orders data for chart
    const salesByDate = orders.reduce((acc, order) => {
      const dateStr = order.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, amount: 0 };
      }
      acc[dateStr].amount += Number(order.finalAmount) || 0;
      return acc;
    }, {} as Record<string, { date: string; amount: number }>);

    // Process purchases data for chart
    const purchasesByDate = purchases.reduce((acc, purchase) => {
      const dateStr = purchase.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, amount: 0 };
      }
      acc[dateStr].amount += Number(purchase.totalAmount) || 0;
      return acc;
    }, {} as Record<string, { date: string; amount: number }>);

    // Merge all dates and create chart data
    const allDates = new Set([
      ...Object.keys(salesByDate),
      ...Object.keys(purchasesByDate),
    ]);

    const sortedDates = Array.from(allDates).sort();
    
    const chartData = sortedDates.map(date => {
      const sales = salesByDate[date]?.amount || 0;
      const purchase = purchasesByDate[date]?.amount || 0;
      const profit = sales - purchase;
      
      return {
        name: new Date(date).toLocaleDateString('uz-UZ', { 
          month: 'short', 
          day: 'numeric' 
        }),
        savdo: Math.round(sales * 100) / 100,
        kirim: Math.round(purchase * 100) / 100,
        foyda: Math.round(profit * 100) / 100,
      };
    });

    // Process category data
    const categoryChartData = categories.map(cat => {
      const totalStock = cat.products.reduce((sum: number, product: any) => {
        return sum + product.stockEntries.reduce((s: number, entry: any) => s + entry.quantity, 0);
      }, 0);
      
      return {
        name: cat.name,
        value: cat._count.products,
        stock: Math.round(totalStock),
      };
    }).filter(cat => cat.value > 0);

    // Process top products
    const topProducts = productsWithStock.map(product => {
      const totalQuantity = product.stockEntries.reduce((sum: number, entry: any) => sum + entry.quantity, 0);
      const totalValue = product.stockEntries.reduce((sum: number, entry: any) => sum + (entry.quantity * entry.costPrice), 0);
      
      return {
        name: product.name,
        quantity: Math.round(totalQuantity),
        value: Math.round(totalValue * 100) / 100,
        orders: product._count.orderItems,
      };
    }).sort((a, b) => b.value - a.value).slice(0, 8);

    // Calculate total cash in cashboxes
    let totalCashUSD = 0;
    let totalCashUZS = 0;
    try {
      const cashboxes = await prisma.cashbox.findMany({
        select: {
          balance: true,
          currency: true,
        },
      });

      totalCashUSD = cashboxes
        .filter(cb => cb.currency === 'USD')
        .reduce((sum, cb) => sum + cb.balance, 0);
      
      totalCashUZS = cashboxes
        .filter(cb => cb.currency === 'UZS')
        .reduce((sum, cb) => sum + cb.balance, 0);
    } catch (err) {
      console.warn('Cashboxes not available:', err);
    }

    // Format recent orders
    const recentOrdersData = recentOrders.map(order => ({
      id: order.id,
      docNumber: order.docNumber,
      customer: order.customer?.fullName || 'Noma\'lum mijoz',
      amount: order.finalAmount,
      date: order.date,
      itemsCount: order.items.length,
    }));

    // Format recent transactions
    const recentTransactionsData = recentTransactions.map(tx => ({
      id: tx.id,
      customer: tx.customer.fullName,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      date: tx.date,
      description: tx.description,
    }));

    return NextResponse.json({
      // Summary stats
      totalProducts,
      totalWarehouses,
      totalCustomers,
      totalSuppliers,
      totalStockQuantity: stockStats._sum.quantity || 0,
      customerDebtUSD: customerDebt._sum.balanceUSD || 0,
      customerDebtUZS: customerDebt._sum.balanceUZS || 0,
      supplierDebtUSD: supplierDebt._sum.balanceUSD || 0,
      supplierDebtUZS: supplierDebt._sum.balanceUZS || 0,
      todayTransfers,
      activePriceLists,
      outOfStockCount,
      totalCashUSD: Math.round(totalCashUSD * 100) / 100,
      totalCashUZS: Math.round(totalCashUZS * 100) / 100,
      
      // Chart data
      salesPurchasesChart: chartData,
      categoryChart: categoryChartData,
      topProductsChart: topProducts,
      
      // Recent activity
      recentOrders: recentOrdersData,
      recentTransactions: recentTransactionsData,
      
      // Metadata
      period,
      startDate,
      endDate: now,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}

