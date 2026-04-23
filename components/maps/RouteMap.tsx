'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
if (typeof window !== 'undefined') {
  (L as any).Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

interface StopPoint {
  latitude: number;
  longitude: number;
  customerName?: string;
  address?: string;
  stopOrder?: number;
}

interface RouteMapProps {
  origin: { latitude: number; longitude: number };
  stops: StopPoint[];
  height?: string;
  className?: string;
}

export function RouteMap({ origin, stops, height = '400px', className = '' }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !isLoaded) {
        // CSS is already imported above
        setIsLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !isLoaded) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([origin.latitude, origin.longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Add warehouse marker
    const warehouseIcon = L.divIcon({
      html: `<div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-xs font-bold">🏭</div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([origin.latitude, origin.longitude], { icon: warehouseIcon })
      .addTo(map)
      .bindPopup('<b>Ombor</b><br>Boshlang\'ich nuqta');

    // Add stop markers and route lines
    if (stops.length > 0) {
      const routePoints: [number, number][] = [
        [origin.latitude, origin.longitude],
        ...stops.map(s => [s.latitude, s.longitude]),
        [origin.latitude, origin.longitude], // Return to warehouse
      ];

      // Draw route line
      L.polyline(routePoints, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
      }).addTo(map);

      // Add stop markers
      stops.forEach((stop, index) => {
        const stopIcon = L.divIcon({
          html: `<div class="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-xs font-bold">${index + 1}</div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`<b>${stop.customerName || `Stop ${index + 1}`}</b>${stop.address ? `<br>${stop.address}` : ''}`);
      });

      // Fit bounds
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [origin, stops, isLoaded]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: '100%' }}
      className={`rounded-xl overflow-hidden ${className}`}
    />
  );
}
