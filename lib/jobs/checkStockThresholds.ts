// Background job to check stock thresholds and create alerts
import prisma from '@/lib/db';
import { broadcastNotification } from '@/lib/notifications/sse';

export interface StockAlertResult {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  minStock: number;
  difference: number;
}

/**
 * Check all stock thresholds and create alerts for low stock
 * This should be called via cron job or webhook after stock changes
 */
export async function checkStockThresholds(): Promise<StockAlertResult[]> {
  const alerts: StockAlertResult[] = [];

  // Get all enabled thresholds with current stock
  const thresholds = await prisma.stockThreshold.findMany({
    where: { enabled: true },
    include: {
      product: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } },
    },
  });

  for (const threshold of thresholds) {
    const stockEntry = await prisma.stockEntry.findUnique({
      where: {
        productId_warehouseId: {
          productId: threshold.productId,
          warehouseId: threshold.warehouseId,
        },
      },
    });

    const currentStock = stockEntry?.quantity || 0;

    if (currentStock <= threshold.minStock) {
      const alert: StockAlertResult = {
        productId: threshold.productId,
        productName: threshold.product.name,
        warehouseId: threshold.warehouseId,
        warehouseName: threshold.warehouse.name,
        currentStock,
        minStock: threshold.minStock,
        difference: threshold.minStock - currentStock,
      };

      alerts.push(alert);

      // Create or update admin notification
      await prisma.adminNotification.upsert({
        where: {
          // Use a composite unique identifier
          id: `stock_${threshold.productId}_${threshold.warehouseId}`,
        },
        update: {
          message: `"${threshold.product.name}" (${threshold.warehouse.name}) omborida qoldiq ${currentStock} dona (min: ${threshold.minStock})`,
          isRead: false,
          updatedAt: new Date(),
        },
        create: {
          id: `stock_${threshold.productId}_${threshold.warehouseId}`,
          type: 'stock_low',
          title: 'Kam qoldiq ogohlantirishi',
          message: `"${threshold.product.name}" (${threshold.warehouse.name}) omborida qoldiq ${currentStock} dona (min: ${threshold.minStock})`,
          link: `/inventory?product=${threshold.productId}&warehouse=${threshold.warehouseId}`,
          isRead: false,
        },
      });

      // Broadcast real-time notification to all connected admins
      broadcastNotification({
        type: 'stock_alert',
        title: 'Kam qoldiq ogohlantirishi',
        message: `"${threshold.product.name}" - ${threshold.warehouse.name}: ${currentStock} dona qoldi`,
        link: `/inventory?product=${threshold.productId}&warehouse=${threshold.warehouseId}`,
        data: {
          productId: threshold.productId,
          warehouseId: threshold.warehouseId,
          currentStock,
          minStock: threshold.minStock,
        },
      });
    }
  }

  return alerts;
}

/**
 * Check thresholds for a specific product/warehouse after mutation
 * Call this after stock changes (orders, purchases, transfers)
 */
export async function checkSpecificThreshold(
  productId: string,
  warehouseId: string
): Promise<StockAlertResult | null> {
  const threshold = await prisma.stockThreshold.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
    include: {
      product: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } },
    },
  });

  if (!threshold || !threshold.enabled) return null;

  const stockEntry = await prisma.stockEntry.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId,
      },
    },
  });

  const currentStock = stockEntry?.quantity || 0;

  if (currentStock <= threshold.minStock) {
    const alert: StockAlertResult = {
      productId,
      productName: threshold.product.name,
      warehouseId,
      warehouseName: threshold.warehouse.name,
      currentStock,
      minStock: threshold.minStock,
      difference: threshold.minStock - currentStock,
    };

    await prisma.adminNotification.upsert({
      where: {
        id: `stock_${productId}_${warehouseId}`,
      },
      update: {
        message: `"${threshold.product.name}" (${threshold.warehouse.name}) omborida qoldiq ${currentStock} dona (min: ${threshold.minStock})`,
        isRead: false,
        updatedAt: new Date(),
      },
      create: {
        id: `stock_${productId}_${warehouseId}`,
        type: 'stock_low',
        title: 'Kam qoldiq ogohlantirishi',
        message: `"${threshold.product.name}" (${threshold.warehouse.name}) omborida qoldiq ${currentStock} dona (min: ${threshold.minStock})`,
        link: `/inventory?product=${productId}&warehouse=${warehouseId}`,
        isRead: false,
      },
    });

    broadcastNotification({
      type: 'stock_alert',
      title: 'Kam qoldiq ogohlantirishi',
      message: `"${threshold.product.name}" - ${threshold.warehouse.name}: ${currentStock} dona qoldi`,
      link: `/inventory?product=${productId}&warehouse=${warehouseId}`,
      data: {
        productId,
        warehouseId,
        currentStock,
        minStock: threshold.minStock,
      },
    });

    return alert;
  }

  return null;
}
