import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const attachments = await prisma.contractAttachment.findMany({
      where: { contractId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: attachments });
  } catch (error) {
    console.error('GET /api/contracts/[id]/attachments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    if (!body.fileName || !body.fileUrl) {
      return NextResponse.json({ error: 'fileName and fileUrl are required' }, { status: 400 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const attachment = await prisma.contractAttachment.create({
      data: {
        contractId: params.id,
        fileName: body.fileName,
        fileUrl: body.fileUrl,
        fileType: body.fileType || null,
        fileSize: body.fileSize ?? null,
        description: body.description || null,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('POST /api/contracts/[id]/attachments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
