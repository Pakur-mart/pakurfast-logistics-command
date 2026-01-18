
export type MerchantCategory = 'Grocery' | 'Pharmacy' | 'Electronics' | 'Bakery' | 'General Store' | 'Dairy';

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  contact?: string;
  zoneId: string;
  isCollaborated: boolean;
  mapUrl?: string;
}

export interface ServiceableZone {
  id: string;
  name: string;
  description: string;
  estimatedDemand: 'High' | 'Medium' | 'Low';
  avgDeliveryTime: number; // in minutes
  coordinates: [number, number][]; // Polygon coordinates
}

export interface RouteInfo {
  distanceKm: number;
  estimatedTimeMins: number;
  trafficStatus: string;
  feasibility: 'High' | 'Medium' | 'Low';
  notes: string;
}
