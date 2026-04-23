import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const CreateTransactionSchema = z.object({
  accountId: z.string().min(1, "Hisob tanlanishi shart"),
  type: z.enum(['earn', 'redeem', 'expire', 'adjust']),
  points: z.number().int().min(1, "Ballar soni 0 dan katta bo'lishi shart"),
  orderId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

const BulkTransactionSchema = z.object({
  transactions: z.array(CreateTransactionSchema).min(1).max(100),
});

function resolveTier(totalEarned: number, program: any): string {
  if (totalEarned >= program.platinumThreshold) return 'PLATINUM';
  if (totalEarned >= program.goldThreshold) return 'GOLD';
  if (totalEarned >= program.silverThreshold) return 'SILVER';
  return 'BRONZE';
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkPermission('view_customers');
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (accountId) where.accountId = accountId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const [transactions, total] = await Promise.all([
      prisma.loyaltyTransaction.findMany({
        where,
        include: {
          account: {
            include: {
              customer: {
                select: {
                  id: true,
                  fullName: true,
                  companyName: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loyaltyTransaction.count({ where }),
    ]);

    return NextResponse.json({
      data: transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/loyalty/transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkPermission('create_customers');
    if (error) return error;

    const body = await req.json();

    const isBulk = Array.isArray(body.transactions);
    const items = isBulk ? body.transactions : [body];

    const result = BulkTransactionSchema.safeParse({ transactions: items });
    if (!result.success) {
      return NextResponse.json({
        error: 'Validatsiya xatosi',
        details: result.error.issues.map(e => e.message),
      }, { status: 400 });
    }

    const transactions = result.data.transactions;

    const created = await prisma.$transaction(async (tx) => {
      const results: any[] = [];

      const program = await tx.loyaltyProgram.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      for (const item of transactions) {
        const account = await tx.loyaltyAccount.findUnique({
          where: { id: item.accountId },
        });
        if (!account) {
          throw new Error(`Hisob topilmadi: ${item.accountId}`);
        }
        if (!account.isActive) {
          throw new Error(`Hisob faol emas: ${item.accountId}`);
        }

        if (item.type === 'redeem') {
          if (account.points < item.points) {
            throw new Error(`Yetarli ball yo'q. Mavjud: ${account.points}, So'ralgan: ${item.points}`);
          }
        }

        const pointsDelta = item.type === 'redeem' || item.type === 'expire'
          ? -item.points
          : item.points;

        const updatedAccount = await tx.loyaltyAccount.update({
          where: { id: item.accountId },
          data: {
            points: { increment: pointsDelta },
            totalEarned: item.type === 'earn' ? { increment: item.points } : undefined,
            totalRedeemed: item.type === 'redeem' ? { increment: item.points } : undefined,
          },
        });

        if (item.type === 'earn' && program) {
          const newTier = resolveTier(updatedAccount.totalEarned, program) as any;
          if (newTier !== updatedAccount.tier) {
            await tx.loyaltyAccount.update({
              where: { id: item.accountId },
              data: { tier: newTier },
            });
          }
        }

        const transaction = await tx.loyaltyTransaction.create({
          data: {
            accountId: item.accountId,
            type: item.type,
            points: item.type === 'redeem' || item.type === 'expire' ? -item.points : item.points,
            orderId: item.orderId || null,
            description: item.description || null,
            expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
          },
          include: {
            account: {
              include: {
                customer: {
                  select: {
                    id: true,
                    fullName: true,
                    companyName: true,
                  },
                },
              },
            },
          },
        });

        results.push(transaction);
      }

      return results;
    });

    return NextResponse.json(
      isBulk ? { data: created } : created[0],
      { status: 201 },
    );
  } catch (error: any) {
    console.error('POST /api/loyalty/transactions error:', error);
    if (error.message?.includes('topilmadi') || error.message?.includes('Yetarli') || error.message?.includes('faol emas')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
