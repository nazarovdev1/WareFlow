import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';
import { checkPermission } from '@/lib/checkPermission';

const AVERAGE_SPEED_KMH = 30;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface StopPoint {
  id?: string;
  customerId?: string;
  customerName?: string;
  address?: string;
  latitude: number;
  longitude: number;
  stopOrder?: number;
}

function nearestNeighborTSP(
  origin: { latitude: number; longitude: number },
  stops: StopPoint[]
): { orderedStops: StopPoint[]; totalDistance: number; segments: { from: string; to: string; distanceKm: number }[] } {
  if (stops.length === 0) {
    return { orderedStops: [], totalDistance: 0, segments: [] };
  }

  const n = stops.length;
  const visited = new Array(n).fill(false);
  const order: number[] = [];
  let currentLat = origin.latitude;
  let currentLng = origin.longitude;
  let totalDistance = 0;
  const segments: { from: string; to: string; distanceKm: number }[] = [];

  for (let i = 0; i < n; i++) {
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const dist = haversineDistanceKm(
          currentLat, currentLng,
          stops[j].latitude, stops[j].longitude
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = j;
        }
      }
    }

    if (nearestIdx === -1) break;

    visited[nearestIdx] = true;
    order.push(nearestIdx);
    totalDistance += nearestDist;

    const fromLabel = i === 0 ? 'Warehouse' : (stops[order[i - 1]].customerName || stops[order[i - 1]].id || `Stop ${i}`);
    const toLabel = stops[nearestIdx].customerName || stops[nearestIdx].id || `Stop ${i + 1}`;
    segments.push({
      from: fromLabel,
      to: toLabel,
      distanceKm: Math.round(nearestDist * 100) / 100,
    });

    currentLat = stops[nearestIdx].latitude;
    currentLng = stops[nearestIdx].longitude;
  }

  const returnDist = haversineDistanceKm(currentLat, currentLng, origin.latitude, origin.longitude);
  totalDistance += returnDist;
  segments.push({
    from: stops[order[order.length - 1]]?.customerName || stops[order[order.length - 1]]?.id || `Last Stop`,
    to: 'Warehouse (return)',
    distanceKm: Math.round(returnDist * 100) / 100,
  });

  return {
    orderedStops: order.map((idx, i) => ({ ...stops[idx], stopOrder: i + 1 })),
    totalDistance: Math.round(totalDistance * 100) / 100,
    segments,
  };
}

const OptimizeByDeliverySchema = z.object({
  deliveryId: z.string(),
});

const OptimizeByAddressesSchema = z.object({
  stops: z.array(z.object({
    id: z.string().optional(),
    customerId: z.string().optional(),
    customerName: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
  })).min(1),
  origin: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  saveToDeliveryId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { error } = await checkPermission('view_sales');
    if (error) return error;

    const body = await request.json();

    if (body.deliveryId) {
      const result = OptimizeByDeliverySchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: 'Validation error',
          details: result.error.issues.map(e => e.message),
        }, { status: 400 });
      }

      const delivery = await prisma.delivery.findUnique({
        where: { id: result.data.deliveryId },
        include: {
          warehouse: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
          customer: { select: { id: true, fullName: true, address: true, latitude: true, longitude: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!delivery) {
        return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
      }

      const origin = {
        latitude: delivery.warehouse.latitude || 0,
        longitude: delivery.warehouse.longitude || 0,
      };

      if (!origin.latitude && !origin.longitude) {
        return NextResponse.json({
          error: 'Warehouse coordinates not set. Please set latitude and longitude for the warehouse.',
        }, { status: 400 });
      }

      const stops: StopPoint[] = [];

      if (delivery.customer && delivery.customer.latitude && delivery.customer.longitude) {
        stops.push({
          customerId: delivery.customer.id,
          customerName: delivery.customer.fullName,
          address: delivery.customer.address || delivery.address || undefined,
          latitude: delivery.customer.latitude,
          longitude: delivery.customer.longitude,
        });
      } else if (delivery.latitude && delivery.longitude) {
        stops.push({
          customerId: delivery.customerId || undefined,
          customerName: delivery.customer?.fullName || undefined,
          address: delivery.address || undefined,
          latitude: delivery.latitude,
          longitude: delivery.longitude,
        });
      }

      if (stops.length === 0) {
        return NextResponse.json({
          error: 'No delivery coordinates found. Set coordinates on the customer or delivery.',
        }, { status: 400 });
      }

      const optimized = nearestNeighborTSP(origin, stops);
      const estimatedTimeMinutes = Math.round((optimized.totalDistance / AVERAGE_SPEED_KMH) * 60);

      const savedRoute = await prisma.deliveryRoute.upsert({
        where: { deliveryId: delivery.id },
        create: {
          deliveryId: delivery.id,
          totalDistance: optimized.totalDistance,
          estimatedTime: estimatedTimeMinutes,
          optimizedOrder: JSON.stringify(optimized.orderedStops.map(s => s.customerId || s.id).filter(Boolean)),
          stops: {
            create: optimized.orderedStops.map((stop, idx) => ({
              stopOrder: stop.stopOrder || idx + 1,
              customerId: stop.customerId || null,
              address: stop.address || null,
              latitude: stop.latitude,
              longitude: stop.longitude,
            })),
          },
        },
        update: {
          totalDistance: optimized.totalDistance,
          estimatedTime: estimatedTimeMinutes,
          optimizedOrder: JSON.stringify(optimized.orderedStops.map(s => s.customerId || s.id).filter(Boolean)),
          stops: {
            deleteMany: {},
            create: optimized.orderedStops.map((stop, idx) => ({
              stopOrder: stop.stopOrder || idx + 1,
              customerId: stop.customerId || null,
              address: stop.address || null,
              latitude: stop.latitude,
              longitude: stop.longitude,
            })),
          },
        },
        include: {
          stops: {
            include: {
              customer: { select: { id: true, fullName: true, phone: true, address: true } },
            },
            orderBy: { stopOrder: 'asc' },
          },
        },
      });

      return NextResponse.json({
        deliveryId: delivery.id,
        docNumber: delivery.docNumber,
        origin,
        optimizedStops: optimized.orderedStops,
        segments: optimized.segments,
        totalDistanceKm: optimized.totalDistance,
        estimatedTimeMinutes,
        averageSpeedKmh: AVERAGE_SPEED_KMH,
        route: savedRoute,
      });
    }

    if (body.stops) {
      const result = OptimizeByAddressesSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({
          error: 'Validation error',
          details: result.error.issues.map(e => e.message),
        }, { status: 400 });
      }

      const { stops, origin: providedOrigin, saveToDeliveryId } = result.data;

      let origin = providedOrigin || { latitude: 0, longitude: 0 };

      if (saveToDeliveryId && !providedOrigin) {
        const delivery = await prisma.delivery.findUnique({
          where: { id: saveToDeliveryId },
          include: { warehouse: { select: { latitude: true, longitude: true } } },
        });
        if (delivery?.warehouse?.latitude && delivery?.warehouse?.longitude) {
          origin = {
            latitude: delivery.warehouse.latitude,
            longitude: delivery.warehouse.longitude,
          };
        }
      }

      const optimized = nearestNeighborTSP(origin, stops as StopPoint[]);
      const estimatedTimeMinutes = Math.round((optimized.totalDistance / AVERAGE_SPEED_KMH) * 60);

      let savedRoute = null;
      if (saveToDeliveryId) {
        savedRoute = await prisma.deliveryRoute.upsert({
          where: { deliveryId: saveToDeliveryId },
          create: {
            deliveryId: saveToDeliveryId,
            totalDistance: optimized.totalDistance,
            estimatedTime: estimatedTimeMinutes,
            optimizedOrder: JSON.stringify(optimized.orderedStops.map(s => s.customerId || s.id).filter(Boolean)),
            stops: {
              create: optimized.orderedStops.map((stop, idx) => ({
                stopOrder: stop.stopOrder || idx + 1,
                customerId: stop.customerId || null,
                address: stop.address || null,
                latitude: stop.latitude,
                longitude: stop.longitude,
              })),
            },
          },
          update: {
            totalDistance: optimized.totalDistance,
            estimatedTime: estimatedTimeMinutes,
            optimizedOrder: JSON.stringify(optimized.orderedStops.map(s => s.customerId || s.id).filter(Boolean)),
            stops: {
              deleteMany: {},
              create: optimized.orderedStops.map((stop, idx) => ({
                stopOrder: stop.stopOrder || idx + 1,
                customerId: stop.customerId || null,
                address: stop.address || null,
                latitude: stop.latitude,
                longitude: stop.longitude,
              })),
            },
          },
          include: {
            stops: {
              include: {
                customer: { select: { id: true, fullName: true, phone: true, address: true } },
              },
              orderBy: { stopOrder: 'asc' },
            },
          },
        });
      }

      return NextResponse.json({
        origin,
        optimizedStops: optimized.orderedStops,
        segments: optimized.segments,
        totalDistanceKm: optimized.totalDistance,
        estimatedTimeMinutes,
        averageSpeedKmh: AVERAGE_SPEED_KMH,
        route: savedRoute,
      });
    }

    return NextResponse.json({
      error: 'Provide either deliveryId or stops array',
    }, { status: 400 });
  } catch (err) {
    console.error('POST /api/deliveries/route-optimize error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
