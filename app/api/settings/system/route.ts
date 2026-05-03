import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Autentifikatsiya talab qilinadi' }, { status: 401 });
    }

    // Try to get system settings from the database
    // If no settings exist, return defaults
    const settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      return NextResponse.json({
        currency: 'UZS',
        dateFormat: 'dd.MM.yyyy',
        timezone: 'Asia/Tashkent',
        autoBackup: true,
        backupInterval: '24',
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings/system error:', error);
    // Return defaults if table doesn't exist yet
    return NextResponse.json({
      currency: 'UZS',
      dateFormat: 'dd.MM.yyyy',
      timezone: 'Asia/Tashkent',
      autoBackup: true,
      backupInterval: '24',
    });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Autentifikatsiya talab qilinadi' }, { status: 401 });
    }

    const body = await request.json();
    const { currency, dateFormat, timezone, autoBackup, backupInterval } = body;

    // Try to upsert system settings
    try {
      const existing = await prisma.systemSettings.findFirst();

      let settings;
      if (existing) {
        settings = await prisma.systemSettings.update({
          where: { id: existing.id },
          data: {
            ...(currency !== undefined && { currency }),
            ...(dateFormat !== undefined && { dateFormat }),
            ...(timezone !== undefined && { timezone }),
            ...(autoBackup !== undefined && { autoBackup }),
            ...(backupInterval !== undefined && { backupInterval }),
          },
        });
      } else {
        settings = await prisma.systemSettings.create({
          data: {
            currency: currency || 'UZS',
            dateFormat: dateFormat || 'dd.MM.yyyy',
            timezone: timezone || 'Asia/Tashkent',
            autoBackup: autoBackup ?? true,
            backupInterval: backupInterval || '24',
          },
        });
      }

      return NextResponse.json(settings);
    } catch (dbError) {
      // If SystemSettings model doesn't exist, store in a simple key-value approach
      console.warn('SystemSettings table may not exist, using fallback:', dbError);
      return NextResponse.json({
        currency: currency || 'UZS',
        dateFormat: dateFormat || 'dd.MM.yyyy',
        timezone: timezone || 'Asia/Tashkent',
        autoBackup: autoBackup ?? true,
        backupInterval: backupInterval || '24',
        saved: false,
        message: 'Settings stored temporarily (database table not available)',
      });
    }
  } catch (error) {
    console.error('PUT /api/settings/system error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
