import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { requireAuth, isAuthError } from '@/lib/apiAuth';

function generateApiKey(): { key: string; prefix: string; hashed: string } {
  const key = `sk_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = key.substring(0, 12);
  const hashed = crypto.createHash('sha256').update(key).digest('hex');
  return { key, prefix, hashed };
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (isAuthError(authResult)) return authResult;
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(apiKeys.map(k => ({
      ...k,
      key: `${k.prefix}...${k.id.substring(0, 4)}`,
    })));
  } catch (err) {
    console.error('API keys fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (isAuthError(authResult)) return authResult;
    const body = await request.json();
    const { name, permissions, expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { key, prefix, hashed } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key: hashed,
        prefix,
        permissions: permissions || ['read_all'],
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      ...apiKey,
      key, // Return full key only once!
    });
  } catch (err) {
    console.error('API key create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}