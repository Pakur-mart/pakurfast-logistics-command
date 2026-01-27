
import { ServiceableZone, Merchant } from './types';

export const PAKUR_CENTER: [number, number] = [24.6394, 87.8465];

export const INITIAL_ZONES: ServiceableZone[] = [
  {
    id: 'zone-1',
    name: 'Pakur Main Market (Sadar)',
    description: 'Core commercial zone including Harindanga Bazar and Main Road.',
    estimatedDemand: 'High',
    avgDeliveryTime: 12,
    coordinates: [
      [24.6410, 87.8440],
      [24.6430, 87.8480],
      [24.6390, 87.8500],
      [24.6370, 87.8460],
    ]
  },
  {
    id: 'zone-2',
    name: 'Railway Station Zone',
    description: 'Area surrounding Pakur Railway Station and nearby colonies.',
    estimatedDemand: 'Medium',
    avgDeliveryTime: 15,
    coordinates: [
      [24.6480, 87.8420],
      [24.6520, 87.8460],
      [24.6490, 87.8510],
      [24.6450, 87.8470],
    ]
  },
  {
    id: 'zone-3',
    name: 'DC Office & Civil Lines',
    description: 'Administrative area near Collectorate and Officers Colony.',
    estimatedDemand: 'Low',
    avgDeliveryTime: 20,
    coordinates: [
      [24.6320, 87.8380],
      [24.6360, 87.8420],
      [24.6340, 87.8460],
      [24.6300, 87.8420],
    ]
  }
];

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Harindanga Grocery Hub',
    category: 'Grocery',
    address: 'Main Market, Harindanga Bazar',
    lat: 24.6400,
    lng: 87.8470,
    rating: 4.5,
    contact: '+91 98765 43210',
    zoneId: 'zone-1',
    isCollaborated: true
  },
  {
    id: 'm2',
    name: 'LifeCare Medicos',
    category: 'Pharmacy',
    address: 'Sadar Hospital Road',
    lat: 24.6420,
    lng: 87.8460,
    rating: 4.8,
    contact: '+91 98765 43211',
    zoneId: 'zone-1',
    isCollaborated: false
  },
  {
    id: 'm3',
    name: 'Station Daily Store',
    category: 'General Store',
    address: 'Near Pakur Railway Station Exit',
    lat: 24.6490,
    lng: 87.8450,
    rating: 4.2,
    contact: '+91 98765 43212',
    zoneId: 'zone-2',
    isCollaborated: true
  },
  {
    id: 'm4',
    name: 'Pakur Dairy & Bakery',
    category: 'Bakery',
    address: 'Old DC Office Road',
    lat: 24.6330,
    lng: 87.8400,
    rating: 4.4,
    zoneId: 'zone-3',
    isCollaborated: true
  }
];
