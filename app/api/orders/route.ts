import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const OrderSchema = z.object({
  customerId: z.string().optional(),
  warehouseId: z.string(),
  discount: z.number().default(0),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
    batchId: z.string().optional(),
  })).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
});

// GET /api/orders — List all orders
export async function GET(request: Request) {
  try {
    const { error } = await checkPermission('view_sales');
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const warehouseId = searchParams.get('warehouseId');

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (search) {
      where.OR = [
        { docNumber: { contains: search } },
        { customer: { fullName: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { fullName: true, phone: true } },
          warehouse: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
              batch: { select: { id: true, batchNumber: true, expiryDate: true } },
              batch: { select: { id: true, batchNumber: true, expiryDate: true } },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders — Create new order
export async function POST(request: Request) {
  try {
    const { error } = await checkPermission('create_sales');
    if (error) return error;

    const body = await request.json();
    const result = OrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const { customerId, warehouseId, discount, paymentMethod, notes, items } = result.data;

    // Generate document number
    const count = await prisma.order.count();
    const docNumber = `SL-${String(count + 1).padStart(6, '0')}`;

    // Calculate totals
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.quantity * item.price;
    }
    const finalAmount = totalAmount - discount;

    // Create order with stock update
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          docNumber,
          customerId: customerId || null,
          warehouseId,
          totalAmount,
          discount,
          finalAmount,
          paymentMethod: paymentMethod || null,
          notes: notes || null,
          status: 'COMPLETED',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
              batchId: item.batchId,
            })),
          },
        },
        include: {
          customer: { select: { fullName: true } },
          warehouse: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true, sku: true } },
              batch: { select: { id: true, batchNumber: true, expiryDate: true } },
              batch: { select: { id: true, batchNumber: true, expiryDate: true } },
            },
          },
        },
      });

      // Update stock and batch quantities (decrease)
      for (const item of items) {
        // If batchId is specified, use that specific batch
        if (item.batchId) {
          // Update batch quantity
          const batch = await tx.productBatch.findUnique({
            where: { id: item.batchId },
          });

          if (!batch) {
            throw new Error(`Batch ${item.batchId} topilmadi`);
          }

          if (batch.quantity < item.quantity) {
            throw new Error(`Batch ${batch.batchNumber} da yetarli miqdor yo'q`);
          }

          await tx.productBatch.update({
            where: { id: item.batchId },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        } else {
          // FIFO: Find earliest batch with expiry date, or earliest created
          let remainingQty = item.quantity;
          let usedBatches: string[] = [];

          while (remainingQty > 0) {
            const batch = await tx.productBatch.findFirst({
              where: {
                productId: item.productId,
                warehouseId,
                isActive: true,
                quantity: { gt: 0 },
                id: { notIn: usedBatches },
                OR: [
                  { expiryDate: { not: null } },
                  { expiryDate: null },
                ],
              },
              orderBy: [
                { expiryDate: 'asc' }, // FEFO: First expiring first
                { createdAt: 'asc' }, // FIFO: First created first
              ],
            });

            if (!batch) {
              throw new Error(`Mahsulot uchun yetarli batch topilmadi: ${item.productId}`);
            }

            const takeFromBatch = Math.min(remainingQty, batch.quantity);
            await tx.productBatch.update({
              where: { id: batch.id },
              data: {
                quantity: { decrement: takeFromBatch },
              },
            });

            remainingQty -= takeFromBatch;
            usedBatches.push(batch.id);
          }
        }

        // Update stock entry (general stock)
        await tx.stockEntry.updateMany({
          where: {
            productId: item.productId,
            warehouseId,
          },
          data: {
            quantity: { decrement: item.quantity },
          },
        });
      }

      // Update customer balance if exists
      if (customerId && finalAmount > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            balanceUSD: { increment: finalAmount },
          },
        });
      }

      // Add loyalty points
      if (customerId) {
        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          include: { loyaltyAccount: true },
        });

        if (customer?.loyaltyAccount?.isActive) {
          // Get loyalty program settings
          const loyaltyProgram = await tx.loyaltyProgram.findFirst({
            where: { isActive: true },
          });

          if (loyaltyProgram) {
            const pointsEarned = Math.floor(finalAmount * loyaltyProgram.pointsPerDollar);

            // Update loyalty account
            await tx.loyaltyAccount.update({
              where: { customerId },
              data: {
                points: { increment: pointsEarned },
                totalEarned: { increment: pointsEarned },
              },
            });

            // Create loyalty transaction
            await tx.loyaltyTransaction.create({
              data: {
                accountId: customer.loyaltyAccount.id,
                type: 'EARN',
                points: pointsEarned,
                orderId: newOrder.id,
                description: `Sotuv #${newOrder.docNumber} uchun ball`,
              },
            });

            // Check and update tier
            const updatedAccount = await tx.loyaltyAccount.findUnique({
              where: { customerId },
            });

            if (updatedAccount) {
              let newTier = updatedAccount.tier;
              if (updatedAccount.totalEarned >= loyaltyProgram.platinumThreshold) {
                newTier = 'PLATINUM';
              } else if (updatedAccount.totalEarned >= loyaltyProgram.goldThreshold) {
                newTier = 'GOLD';
              } else if (updatedAccount.totalEarned >= loyaltyProgram.silverThreshold) {
                newTier = 'SILVER';
              } else if (updatedAccount.totalEarned >= loyaltyProgram.bronzeThreshold) {
                newTier = 'BRONZE';
              }

              if (newTier !== updatedAccount.tier) {
                await tx.loyaltyAccount.update({
                  where: { customerId },
                  data: { tier: newTier },
                });
              }
            }
          }
        }
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
