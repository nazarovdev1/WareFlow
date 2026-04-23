import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          date: { gte: twelveMonthsAgo },
          status: 'COMPLETED',
        },
      },
      include: {
        product: { select: { id: true, name: true } },
        order: { select: { date: true, warehouseId: true } },
      },
    });

    const productMonthlyMap: Record<string, Record<string, { qty: number; warehouseId: string }>> = {};

    for (const item of orderItems) {
      const pid = item.productId;
      if (!productMonthlyMap[pid]) productMonthlyMap[pid] = {};

      const d = item.order.date;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      if (!productMonthlyMap[pid][key]) {
        productMonthlyMap[pid][key] = { qty: 0, warehouseId: item.order.warehouseId };
      }
      productMonthlyMap[pid][key].qty += item.quantity;
    }

    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    const stockEntries = await prisma.stockEntry.findMany({
      select: { productId: true, quantity: true },
    });

    const stockMap: Record<string, number> = {};
    for (const se of stockEntries) {
      stockMap[se.productId] = (stockMap[se.productId] || 0) + se.quantity;
    }

    const forecasts: any[] = [];
    const reorderSuggestions: any[] = [];

    for (const product of products) {
      const monthlyData = productMonthlyMap[product.id] || {};
      const months = Object.keys(monthlyData).sort();

      if (months.length === 0) continue;

      const last12 = months.slice(-12);
      const quantities = last12.map(m => monthlyData[m].qty);

      const last3 = quantities.slice(-3);
      const sma = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

      let wma = 0;
      if (last3.length === 3) {
        wma = (last3[2] * 0.5 + last3[1] * 0.3 + last3[0] * 0.2);
      } else if (last3.length > 0) {
        wma = last3.reduce((a, b) => a + b, 0) / last3.length;
      }

      const alpha = 0.3;
      let es = quantities[0];
      for (let i = 1; i < quantities.length; i++) {
        es = alpha * quantities[i] + (1 - alpha) * es;
      }

      const predicted = (sma + wma + es) / 3;
      const currentStock = stockMap[product.id] || 0;

      const variance = quantities.length > 1
        ? quantities.reduce((sum, q) => sum + Math.pow(q - sma, 2), 0) / (quantities.length - 1)
        : 0;
      const stdDev = Math.sqrt(variance);
      const confidence = sma > 0 ? Math.max(0, Math.min(1, 1 - (stdDev / sma))) : 0;

      let recommendation: 'reorder' | 'ok' | 'overstock';
      if (predicted > currentStock * 1.2) {
        recommendation = 'reorder';
      } else if (currentStock > predicted * 2) {
        recommendation = 'overstock';
      } else {
        recommendation = 'ok';
      }

      const forecast = {
        productId: product.id,
        product: product.name,
        currentStock,
        predictions: {
          sma: Math.round(sma * 100) / 100,
          wma: Math.round(wma * 100) / 100,
          es: Math.round(es * 100) / 100,
        },
        predictedNextMonth: Math.round(predicted * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        recommendation,
        monthlyData: last12.map((m, i) => ({ month: m, qty: quantities[i] })),
      };

      forecasts.push(forecast);

      if (predicted > currentStock) {
        reorderSuggestions.push({
          productId: product.id,
          product: product.name,
          currentStock,
          predictedDemand: Math.round(predicted * 100) / 100,
          suggestedOrder: Math.round((predicted - currentStock) * 100) / 100,
          confidence: Math.round(confidence * 100) / 100,
        });
      }
    }

    return NextResponse.json({ forecasts, reorderSuggestions });
  } catch (error) {
    console.error('GET /api/ai-forecast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { forecasts } = body;

    if (!Array.isArray(forecasts)) {
      return NextResponse.json({ error: 'forecasts array required' }, { status: 400 });
    }

    const now = new Date();
    const nextMonth = now.getMonth() + 2;
    const nextYear = nextMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
    const month = nextMonth > 12 ? 1 : nextMonth;

    const operations = forecasts.map((f: any) => {
      const warehouseId = f.warehouseId || 'default';
      const data = {
        productId: f.productId,
        warehouseId,
        period: `${nextYear}-${String(month).padStart(2, '0')}`,
        predictedQty: f.predictedQty,
        confidence: f.confidence || 0,
        algorithm: f.algorithm || 'ensemble',
        inputData: f.inputData ? JSON.stringify(f.inputData) : null,
        month,
        year: nextYear,
      };

      return prisma.demandForecast.upsert({
        where: {
          productId_warehouseId_month_year: {
            productId: f.productId,
            warehouseId,
            month,
            year: nextYear,
          },
        },
        create: data,
        update: {
          predictedQty: f.predictedQty,
          confidence: f.confidence || 0,
          algorithm: f.algorithm || 'ensemble',
          inputData: f.inputData ? JSON.stringify(f.inputData) : null,
        },
      });
    });

    await prisma.$transaction(operations);

    return NextResponse.json({ saved: operations.length }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ai-forecast error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
