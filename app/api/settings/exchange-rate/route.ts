import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CBU_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json/';

async function fetchCBURate(): Promise<number | null> {
  try {
    const res = await fetch(CBU_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const usd = data.find((c: any) => c.Ccy === 'USD');
    return usd ? parseFloat(usd.Rate) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const cbuRate = await fetchCBURate();

    const saved = await prisma.exchangeRate.findFirst({
      where: { currency: 'USD' },
      orderBy: { date: 'desc' },
    });

    const effectiveRate = cbuRate || saved?.rate || 12500;

    return NextResponse.json({
      id: saved?.id || null,
      currency: 'USD',
      rate: effectiveRate,
      cbuRate,
      manualRate: saved?.rate || null,
      source: cbuRate ? 'CBU' : saved ? 'MANUAL' : 'DEFAULT',
      date: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch exchange rate' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
    }

    const { rate } = await request.json();
    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'Noto\'g\'ri kurs' }, { status: 400 });
    }

    const updated = await prisma.exchangeRate.upsert({
      where: { currency: 'USD' },
      update: { rate: Number(rate) },
      create: { currency: 'USD', rate: Number(rate) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update exchange rate' }, { status: 500 });
  }
}
