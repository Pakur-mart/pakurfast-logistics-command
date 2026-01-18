
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PAKUR_CENTER } from '../constants';
import { Merchant, ServiceableZone } from '../types';

interface MapViewProps {
  zones: ServiceableZone[];
  merchants: Merchant[];
  selectedZoneId: string | null;
  onSelectMerchant: (merchant: Merchant) => void;
}

const MapView: React.FC<MapViewProps> = ({ zones, merchants, selectedZoneId, onSelectMerchant }) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{ [key: string]: L.Layer }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView(PAKUR_CENTER, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing dynamic layers
    Object.values(layersRef.current).forEach(layer => mapRef.current?.removeLayer(layer));
    layersRef.current = {};

    // Add Zones
    zones.forEach(zone => {
      const isSelected = zone.id === selectedZoneId;
      const polygon = L.polygon(zone.coordinates, {
        color: isSelected ? '#10b981' : '#3b82f6',
        fillColor: isSelected ? '#10b981' : '#3b82f6',
        fillOpacity: isSelected ? 0.3 : 0.1,
        weight: isSelected ? 3 : 1
      }).addTo(mapRef.current!);
      
      polygon.bindTooltip(zone.name, { permanent: false, direction: 'center' });
      layersRef.current[`zone-${zone.id}`] = polygon;
    });

    // Add Merchants
    merchants.forEach(merchant => {
      const marker = L.circleMarker([merchant.lat, merchant.lng], {
        radius: 8,
        fillColor: merchant.isCollaborated ? '#10b981' : '#f59e0b',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-gray-900">${merchant.name}</h3>
          <p class="text-xs text-gray-500">${merchant.category}</p>
          <p class="text-xs mt-1">Status: <span class="${merchant.isCollaborated ? 'text-green-600' : 'text-amber-600'} font-semibold">${merchant.isCollaborated ? 'Collaborated' : 'Target Partner'}</span></p>
        </div>
      `);

      marker.on('click', () => onSelectMerchant(merchant));
      layersRef.current[`merchant-${merchant.id}`] = marker;
    });
  }, [zones, merchants, selectedZoneId, onSelectMerchant]);

  return <div ref={containerRef} className="h-full w-full rounded-xl shadow-inner border border-gray-200 overflow-hidden" />;
};

export default MapView;
