import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (token as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });

    if (!user?.customer) {
      return NextResponse.json({ account: null }, { status: 200 });
    }

    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId: user.customer.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!loyaltyAccount) {
      return NextResponse.json({ account: null }, { status: 200 });
    }

    // Get loyalty program for tier info
    const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    });

    let tierInfo = null;
    if (loyaltyProgram) {
      tierInfo = {
        tier: loyaltyAccount.tier,
        pointsToNextTier: null,
        nextTier: null,
        discountRate: 0,
      };

      switch (loyaltyAccount.tier) {
        case 'BRONZE':
          tierInfo.nextTier = 'SILVER';
          tierInfo.pointsToNextTier = loyaltyProgram.silverThreshold - loyaltyAccount.totalEarned;
          tierInfo.discountRate = loyaltyProgram.bronzeDiscount || 0;
          break;
        case 'SILVER':
          tierInfo.nextTier = 'GOLD';
          tierInfo.pointsToNextTier = loyaltyProgram.goldThreshold - loyaltyAccount.totalEarned;
          tierInfo.discountRate = loyaltyProgram.silverDiscount || 0;
          break;
        case 'GOLD':
          tierInfo.nextTier = 'PLATINUM';
          tierInfo.pointsToNextTier = loyaltyProgram.platinumThreshold - loyaltyAccount.totalEarned;
          tierInfo.discountRate = loyaltyProgram.goldDiscount || 0;
          break;
        case 'PLATINUM':
          tierInfo.discountRate = loyaltyProgram.platinumDiscount || 0;
          break;
      }
    }

    return NextResponse.json({
      account: {
        id: loyaltyAccount.id,
        points: loyaltyAccount.points,
        totalEarned: loyaltyAccount.totalEarned,
        totalRedeemed: loyaltyAccount.totalRedeemed,
        tier: loyaltyAccount.tier,
        isActive: loyaltyAccount.isActive,
      },
      tierInfo,
      recentTransactions: loyaltyAccount.transactions,
    });
  } catch (error) {
    console.error('GET /api/loyalty/balance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
