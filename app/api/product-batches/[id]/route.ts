import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkPermission } from '@/lib/checkPermission';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('view_products');
    if (error) return error;

    const { id } = await params;
    const batch = await prisma.productBatch.findUnique({
      where: { id },
      include: { product: true, warehouse: true, supplier: true },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch topilmadi' }, { status: 404 });
    }

    const now = new Date();
    let expiryStatus: string | null = null;
    if (batch.expiryDate) {
      const diffMs = new Date(batch.expiryDate).getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) expiryStatus = 'expired';
      else if (diffDays <= 30) expiryStatus = 'critical';
      else if (diffDays <= 60) expiryStatus = 'warning';
      else if (diffDays <= 90) expiryStatus = 'expiring_soon';
      else expiryStatus = 'safe';
    }

    return NextResponse.json({ ...batch, expiryStatus });
  } catch (error) {
    console.error('GET /api/product-batches/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('edit_products');
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.productBatch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Batch topilmadi' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.quantity !== undefined) updateData.quantity = parseFloat(body.quantity);
    if (body.costPrice !== undefined) updateData.costPrice = parseFloat(body.costPrice);
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.manufactureDate !== undefined) {
      updateData.manufactureDate = body.manufactureDate ? new Date(body.manufactureDate) : null;
    }
    if (body.expiryDate !== undefined) {
      updateData.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    }
    if (body.supplierId !== undefined) updateData.supplierId = body.supplierId || null;
    if (body.warehouseId !== undefined) updateData.warehouseId = body.warehouseId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.batchNumber !== undefined) updateData.batchNumber = body.batchNumber;

    const batch = await prisma.productBatch.update({
      where: { id },
      data: updateData,
      include: { product: true, warehouse: true, supplier: true },
    });

    return NextResponse.json(batch);
  } catch (error: any) {
    console.error('PATCH /api/product-batches/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Batch topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error } = await checkPermission('delete_products');
    if (error) return error;

    const { id } = await params;

    const existing = await prisma.productBatch.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Batch topilmadi' }, { status: 404 });
    }

    const batch = await prisma.productBatch.update({
      where: { id },
      data: { isActive: false },
      include: { product: true, warehouse: true, supplier: true },
    });

    return NextResponse.json(batch);
  } catch (error: any) {
    console.error('DELETE /api/product-batches/[id] error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Batch topilmadi' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
