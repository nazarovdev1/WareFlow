import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateReport, ReportConfig } from '@/lib/reports/engine';

// POST: Generate dynamic report based on ReportConfig
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'tmagan' }, { status: 401 });
    }

    const body: ReportConfig = await req.json();

    if (!body.dataSource) {
      return NextResponse.json({ error: 'dataSource majburiy' }, { status: 400 });
    }

    const result = await generateReport(body);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('POST /api/reports/generate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Hisobot yaratishda xatolik' },
      { status: 500 }
    );
  }
}
