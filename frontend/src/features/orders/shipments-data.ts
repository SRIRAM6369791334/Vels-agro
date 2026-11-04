// Vels Agro Enterprise — Courier & Heavy Shipment Management Data
// Section 16: Heavy Machinery Freight, AWB/LR Tracking, Fleet Partners & Delivery SLAs

export interface TrackingCheckpoint {
  title: string;
  location: string;
  timestamp: number;
  completed: boolean;
  notes?: string;
}

export interface ShipmentRecord {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerType: 'dealer' | 'farmer';
  destination: string;
  state: string;
  courierPartner: string;
  partnerCode: 'VRL' | 'ARC' | 'ABT' | 'KPN' | 'FACTORY_FLEET';
  awbNumber: string; // LR / Bilty / AWB number
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  ewayBillNumber: string;
  status: 'manifested' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'rto_delay';
  itemsSummary: string;
  weightKg: number;
  dispatchedAt: number;
  estimatedDelivery: number;
  deliveredAt?: number;
  currentLocation: string;
  checkpoints: TrackingCheckpoint[];
  apiSyncSupported: boolean;
  lastApiSync?: number;
}

export interface CourierPartner {
  id: string;
  name: string;
  code: 'VRL' | 'ARC' | 'ABT' | 'KPN' | 'FACTORY_FLEET';
  type: 'Heavy Freight Trailer' | 'Regional Express' | 'All-India ODC' | 'In-House Fleet';
  phone: string;
  headquarters: string;
  activeShipments: number;
  slaRate: number; // percentage
  apiConnected: boolean;
}

const NOW = Date.now();
const DAY_MS = 86400000;
const HOUR_MS = 3600000;

export const COURIER_PARTNERS: CourierPartner[] = [
  {
    id: 'cp-vrl',
    name: 'VRL Logistics (Heavy Freight)',
    code: 'VRL',
    type: 'Heavy Freight Trailer',
    phone: '+91 836 2237511',
    headquarters: 'Hubballi / Coimbatore Terminal',
    activeShipments: 2,
    slaRate: 98.4,
    apiConnected: true,
  },
  {
    id: 'cp-arc',
    name: 'ARC Transporters (ODC Cargo)',
    code: 'ARC',
    type: 'All-India ODC',
    phone: '+91 44 2538 4920',
    headquarters: 'Coimbatore Heavy Hub',
    activeShipments: 1,
    slaRate: 95.8,
    apiConnected: true,
  },
  {
    id: 'cp-abt',
    name: 'ABT Parcel Service',
    code: 'ABT',
    type: 'Regional Express',
    phone: '+91 422 4333666',
    headquarters: 'Coimbatore, Tamil Nadu',
    activeShipments: 1,
    slaRate: 99.1,
    apiConnected: true,
  },
  {
    id: 'cp-kpn',
    name: 'KPN Heavy Haulers',
    code: 'KPN',
    type: 'Heavy Freight Trailer',
    phone: '+91 427 2444777',
    headquarters: 'Salem Logistics Hub',
    activeShipments: 0,
    slaRate: 93.5,
    apiConnected: false,
  },
  {
    id: 'cp-fleet',
    name: 'Vels Factory Low-Bed Fleet',
    code: 'FACTORY_FLEET',
    type: 'In-House Fleet',
    phone: '+91 94431 80000',
    headquarters: 'Vels Agro Coimbatore Plant Yard',
    activeShipments: 1,
    slaRate: 100.0,
    apiConnected: true,
  },
];

export const INITIAL_SHIPMENTS: ShipmentRecord[] = [
  {
    id: 'shp-01',
    shipmentNumber: 'SHP-VELS-2026-041',
    orderId: 'so-agro-1081',
    orderNumber: '#AG-1081',
    customerId: 'dlr-01',
    customerName: 'Kovai Agro Machineries & Implements',
    customerType: 'dealer',
    destination: 'Coimbatore Yard, Trichy Road, TN',
    state: 'Tamil Nadu',
    courierPartner: 'VRL Logistics (Heavy Freight)',
    partnerCode: 'VRL',
    awbNumber: 'VRL-CBE-889104',
    vehicleNumber: 'TN 38 BZ 4419',
    driverName: 'Murugan Saminathan',
    driverPhone: '+91 94431 82910',
    ewayBillNumber: 'EWB-261102941044',
    status: 'delivered',
    itemsSummary: '2x 55HP 4WD Tractors + 2x 7ft HD Rotavators',
    weightKg: 6200,
    dispatchedAt: NOW - 5 * DAY_MS,
    estimatedDelivery: NOW - 4 * DAY_MS,
    deliveredAt: NOW - 4 * DAY_MS,
    currentLocation: 'Delivered at Kovai Agro Stockyard (Podanur)',
    apiSyncSupported: true,
    lastApiSync: NOW - 2 * HOUR_MS,
    checkpoints: [
      {
        title: 'Factory Gate Out & Inspection',
        location: 'Vels Agro Plant, Coimbatore',
        timestamp: NOW - 5 * DAY_MS,
        completed: true,
        notes: 'Chassis #VELS-TR-55HP-2026-092 & 093 loaded on Multi-Axle Trailer',
      },
      {
        title: 'E-Way Bill Toll Clearance',
        location: 'Kaniyur Toll Plaza, NH 544',
        timestamp: NOW - 4.5 * DAY_MS,
        completed: true,
        notes: 'RFID Fastag & Commercial Waybill verified',
      },
      {
        title: 'Delivered & PDI Signoff',
        location: 'Kovai Agro Dealership Main Bay',
        timestamp: NOW - 4 * DAY_MS,
        completed: true,
        notes: 'Signed delivery challan acknowledged by Dealer Manager S. Ramanathan',
      },
    ],
  },
  {
    id: 'shp-02',
    shipmentNumber: 'SHP-VELS-2026-042',
    orderId: 'so-agro-1082',
    orderNumber: '#AG-1082',
    customerId: 'c-farmer-01',
    customerName: 'Selvakumar Palanisamy (Farmer)',
    customerType: 'farmer',
    destination: 'Kangeyam Road, Muthur, Tiruppur Dist, TN',
    state: 'Tamil Nadu',
    courierPartner: 'Vels Factory Low-Bed Fleet',
    partnerCode: 'FACTORY_FLEET',
    awbNumber: 'VELS-DIR-0924',
    vehicleNumber: 'TN 43 E 9921',
    driverName: 'Palaniandi Kandasamy',
    driverPhone: '+91 98421 77301',
    ewayBillNumber: 'EWB-261103441901',
    status: 'in_transit',
    itemsSummary: '1x Vels Bull 45HP 2WD Tractor (Farm Green)',
    weightKg: 2450,
    dispatchedAt: NOW - 4 * HOUR_MS,
    estimatedDelivery: NOW + 3 * HOUR_MS,
    currentLocation: 'NH 81 Highway, Near Kangeyam Toll Plaza (Speed: 42 km/h)',
    apiSyncSupported: true,
    lastApiSync: NOW - 10 * 60000,
    checkpoints: [
      {
        title: 'Chassis Verified & Tied with Heavy Straps',
        location: 'Vels Agro Plant Yard, Coimbatore',
        timestamp: NOW - 4 * HOUR_MS,
        completed: true,
        notes: 'Tool kit, Owner manual & Free 1st Service coupons bundled in tractor tool box',
      },
      {
        title: 'Passing Palladam Bypass',
        location: 'Palladam Junction, NH 81',
        timestamp: NOW - 2 * HOUR_MS,
        completed: true,
        notes: 'Trailer moving at regular pace; Driver confirms weather clear',
      },
      {
        title: 'Delivery to Farmer Land & Live PDI Demo',
        location: 'Muthur Farm Land, Tiruppur',
        timestamp: NOW + 3 * HOUR_MS,
        completed: false,
        notes: 'Engineer S. Natarajan scheduled for tractor startup demo on farm',
      },
    ],
  },
  {
    id: 'shp-03',
    shipmentNumber: 'SHP-VELS-2026-043',
    orderId: 'so-agro-1083',
    orderNumber: '#AG-1083',
    customerId: 'dlr-03',
    customerName: 'Punjab Tractors & Harvest Tech',
    customerType: 'dealer',
    destination: 'GT Road, Ludhiana Logistics Park, Punjab',
    state: 'Punjab',
    courierPartner: 'ARC Transporters (ODC Cargo)',
    partnerCode: 'ARC',
    awbNumber: 'ARC-ODC-77401',
    vehicleNumber: 'PB 10 CN 8841',
    driverName: 'Jaswinder Singh Grewal',
    driverPhone: '+91 98140 22910',
    ewayBillNumber: 'EWB-261104101988',
    status: 'in_transit',
    itemsSummary: '1x Vels Harvester 88HP Multi-Crop Combine (Rubber Track)',
    weightKg: 8400,
    dispatchedAt: NOW - 2 * DAY_MS,
    estimatedDelivery: NOW + 2 * DAY_MS,
    currentLocation: 'Nagpur Multi-Modal Logistics Hub, Maharashtra (NH 44 Northbound)',
    apiSyncSupported: true,
    lastApiSync: NOW - 30 * 60000,
    checkpoints: [
      {
        title: 'ODC Over-Dimension Permit Issued & Gate Out',
        location: 'Coimbatore Plant, TN',
        timestamp: NOW - 2 * DAY_MS,
        completed: true,
        notes: 'Police escort cleared for oversized machinery through city limits',
      },
      {
        title: 'Crossed Andhra Pradesh Border',
        location: 'Anantapur Checkpost, NH 44',
        timestamp: NOW - 1.2 * DAY_MS,
        completed: true,
        notes: 'Interstate commercial check completed without demurrage',
      },
      {
        title: 'Central Hub Transit Check',
        location: 'Nagpur Hub, Maharashtra',
        timestamp: NOW - 3 * HOUR_MS,
        completed: true,
        notes: 'Driver rest rotation and tire pressure audit',
      },
      {
        title: 'Final Ludhiana Terminal Arrival',
        location: 'Ludhiana GT Road, Punjab',
        timestamp: NOW + 2 * DAY_MS,
        completed: false,
        notes: 'Customer notified to arrange 20-tonne hydraulic unloader crane',
      },
    ],
  },
  {
    id: 'shp-04',
    shipmentNumber: 'SHP-VELS-2026-044',
    orderId: 'so-agro-1084',
    orderNumber: '#AG-1084',
    customerId: 'c-farmer-02',
    customerName: 'Muthuvelan Ramanathan (Farmer)',
    customerType: 'farmer',
    destination: 'Cauvery River Basin, Kumbakonam, Thanjavur, TN',
    state: 'Tamil Nadu',
    courierPartner: 'ABT Parcel Service',
    partnerCode: 'ABT',
    awbNumber: 'ABT-ERD-44109',
    vehicleNumber: 'TN 33 AB 5120',
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 94861 33490',
    ewayBillNumber: 'EWB-261104291840',
    status: 'out_for_delivery',
    itemsSummary: '1x 5ft Rotary Tiller + 1x 600L Boom Sprayer',
    weightKg: 480,
    dispatchedAt: NOW - 1 * DAY_MS,
    estimatedDelivery: NOW + 1 * HOUR_MS,
    currentLocation: 'ABT Kumbakonam City Delivery Mini-Truck (Near Old Bus Stand)',
    apiSyncSupported: true,
    lastApiSync: NOW - 15 * 60000,
    checkpoints: [
      {
        title: 'Dispatched from Coimbatore Central Hub',
        location: 'ABT Ramanathapuram Yard, CBE',
        timestamp: NOW - 1 * DAY_MS,
        completed: true,
      },
      {
        title: 'Arrived at Thanjavur Zonal Depot',
        location: 'ABT Depot, Trichy Road',
        timestamp: NOW - 6 * HOUR_MS,
        completed: true,
      },
      {
        title: 'Loaded for Doorstep Delivery to Farm',
        location: 'Kumbakonam Feeder Van',
        timestamp: NOW - 1 * HOUR_MS,
        completed: true,
        notes: 'Driver called farmer; farmer ready at farm shed',
      },
    ],
  },
  {
    id: 'shp-05',
    shipmentNumber: 'SHP-VELS-2026-045',
    orderId: 'so-agro-1085',
    orderNumber: '#AG-1085',
    customerId: 'c-farmer-03',
    customerName: 'Suresh Gowda (Farmer)',
    customerType: 'farmer',
    destination: 'Bhadravati Road, Shimoga, Karnataka',
    state: 'Karnataka',
    courierPartner: 'VRL Logistics (Heavy Freight)',
    partnerCode: 'VRL',
    awbNumber: 'VRL-MYS-331049',
    vehicleNumber: 'KA 01 AH 3091',
    driverName: 'Basavaraj H.',
    driverPhone: '+91 94481 00293',
    ewayBillNumber: 'EWB-261105192844',
    status: 'manifested',
    itemsSummary: '1x 7ft Heavy Duty Rotavator with Boron Steel Blades',
    weightKg: 520,
    dispatchedAt: NOW - 6 * HOUR_MS,
    estimatedDelivery: NOW + 1.5 * DAY_MS,
    currentLocation: 'Coimbatore VRL Transhipment Dock (Bay #4 awaiting DD clearance)',
    apiSyncSupported: true,
    lastApiSync: NOW - 1 * HOUR_MS,
    checkpoints: [
      {
        title: 'Consignment Docket Generated',
        location: 'Vels Agro Logistics Desk',
        timestamp: NOW - 6 * HOUR_MS,
        completed: true,
        notes: 'Waiting for Bank Demand Draft clearance confirmation before trailer release',
      },
      {
        title: 'Loading onto Bangalore-Shimoga Overnight Express',
        location: 'VRL Terminal Coimbatore',
        timestamp: NOW + 4 * HOUR_MS,
        completed: false,
      },
    ],
  },
  {
    id: 'shp-06',
    shipmentNumber: 'SHP-VELS-2026-046',
    orderId: 'so-agro-1089',
    orderNumber: '#AG-1089',
    customerId: 'c-farmer-05',
    customerName: 'Arumugam Karuppan (Farmer)',
    customerType: 'farmer',
    destination: 'Madurai Road, Virudhunagar, TN',
    state: 'Tamil Nadu',
    courierPartner: 'VRL Logistics (Heavy Freight)',
    partnerCode: 'VRL',
    awbNumber: 'VRL-VDR-119284',
    vehicleNumber: 'TN 67 AF 9120',
    driverName: 'Subramanian V.',
    driverPhone: '+91 98432 11984',
    ewayBillNumber: 'EWB-261102001928',
    status: 'rto_delay',
    itemsSummary: '1x 35HP Compact Orchard Tractor',
    weightKg: 1850,
    dispatchedAt: NOW - 3 * DAY_MS,
    estimatedDelivery: NOW - 1 * DAY_MS,
    currentLocation: 'VRL Virudhunagar Yard (Consignment Recall Hold)',
    apiSyncSupported: true,
    lastApiSync: NOW - 40 * 60000,
    checkpoints: [
      {
        title: 'Dispatched to Virudhunagar Hub',
        location: 'Coimbatore Plant',
        timestamp: NOW - 3 * DAY_MS,
        completed: true,
      },
      {
        title: 'Customer Cancellation Notice Received',
        location: 'VRL Virudhunagar Warehouse',
        timestamp: NOW - 1.5 * DAY_MS,
        completed: true,
        notes: 'Customer cancelled due to PACB cooperative subsidy delay. Hold placed.',
      },
      {
        title: 'Reverse Logistics Return (RTO) to Coimbatore Plant',
        location: 'En-route Return to Factory Yard',
        timestamp: NOW + 1 * DAY_MS,
        completed: false,
        notes: 'Tractor inspection on return before restocking in Plant Bay 2',
      },
    ],
  },
];
