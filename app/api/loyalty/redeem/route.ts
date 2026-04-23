import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { points, orderId, description } = body;

    if (!points || points <= 0) {
      return NextResponse.json({ error: 'Points must be greater than 0' }, { status: 400 });
    }

    const userId = (token as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer: true },
    });

    if (!user?.customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { customerId: user.customer.id },
    });

    if (!loyaltyAccount) {
      return NextResponse.json({ error: 'Loyalty account not found' }, { status: 404 });
    }

    if (loyaltyAccount.points < points) {
      return NextResponse.json({ error: 'Insufficient points' }, { status: 400 });
    }

    // Get loyalty program for discount calculation
    const loyaltyProgram = await prisma.loyaltyProgram.findFirst({
      where: { isActive: true },
    });

    let discountRate = 0;
    let discountAmount = 0;

    if (loyaltyProgram) {
      switch (loyaltyAccount.tier) {
        case 'BRONZE':
          discountRate = loyaltyProgram.bronzeDiscount || 0;
          break;
        case 'SILVER':
          discountRate = loyaltyProgram.silverDiscount || 0;
          break;
        case 'GOLD':
          discountRate = loyaltyProgram.goldDiscount || 0;
          break;
        case 'PLATINUM':
          discountRate = loyaltyProgram.platinumDiscount || 0;
          break;
      }

      // Points to USD conversion (100 points = 1 USD, for example)
      const pointsValue = points / 100;
      discountAmount = Math.min(pointsValue, (pointsValue * discountRate / 100));
    }

    // Create transaction
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: loyaltyAccount.id,
        type: 'REDEEM',
        points: -points,
        orderId: orderId || null,
        description: description || 'Ball ishlatish',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      },
    });

    // Update account
    await prisma.loyaltyAccount.update({
      where: { customerId: user.customer.id },
      data: {
        points: { decrement: points },
        totalRedeemed: { increment: points },
      },
    });

    return NextResponse.json({
      success: true,
      pointsRedeemed: points,
      discountAmount,
      remainingPoints: loyaltyAccount.points - points,
    });
  } catch (error) {
    console.error('POST /api/loyalty/redeem error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
