
import { ServiceableZone, Merchant } from './types';

export const PAKUR_CENTER: [number, number] = [24.7861, 87.8512];

export const INITIAL_ZONES: ServiceableZone[] = [
  {
    id: 'zone-1',
    name: 'Pakur Central (Main Market)',
    description: 'The primary commercial hub including Harindanga and Main Road.',
    estimatedDemand: 'High',
    avgDeliveryTime: 12,
    coordinates: [
      [24.789, 87.848],
      [24.792, 87.853],
      [24.785, 87.858],
      [24.781, 87.852],
    ]
  },
  {
    id: 'zone-2',
    name: 'Railway Colony & Station',
    description: 'Residential areas around the Pakur Railway Station.',
    estimatedDemand: 'Medium',
    avgDeliveryTime: 18,
    coordinates: [
      [24.778, 87.845],
      [24.782, 87.851],
      [24.775, 87.855],
      [24.770, 87.848],
    ]
  },
  {
    id: 'zone-3',
    name: 'Collectorate Area',
    description: 'Government offices and staff residential quarters.',
    estimatedDemand: 'Low',
    avgDeliveryTime: 22,
    coordinates: [
      [24.795, 87.855],
      [24.800, 87.865],
      [24.790, 87.870],
      [24.785, 87.860],
    ]
  }
];

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Harindanga Grocery Hub',
    category: 'Grocery',
    address: 'Main Market, Harindanga',
    lat: 24.787,
    lng: 87.850,
    rating: 4.5,
    contact: '+91 98765 43210',
    zoneId: 'zone-1',
    isCollaborated: true
  },
  {
    id: 'm2',
    name: 'LifeCare Medicos',
    category: 'Pharmacy',
    address: 'Hospital Road, Sadar Hospital',
    lat: 24.788,
    lng: 87.853,
    rating: 4.8,
    contact: '+91 98765 43211',
    zoneId: 'zone-1',
    isCollaborated: false
  },
  {
    id: 'm3',
    name: 'Station Daily Store',
    category: 'General Store',
    address: 'Opposite Pakur Railway Station',
    lat: 24.776,
    lng: 87.849,
    rating: 4.2,
    contact: '+91 98765 43212',
    zoneId: 'zone-2',
    isCollaborated: true
  },
  {
    id: 'm4',
    name: 'Pakur Dairy & Bakery',
    category: 'Bakery',
    address: 'Collectorate Circle Road',
    lat: 24.792,
    lng: 87.858,
    rating: 4.4,
    zoneId: 'zone-3',
    isCollaborated: true
  }
];
