import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserRecord,
  CustomerRecord,
  ShipmentRecord,
  ShipmentEventRecord,
  DocumentRecord,
  NotificationRecord,
  SecurityEventRecord,
  UserSessionRecord,
  ShipmentStatus,
} from './types';

interface DatabaseSchema {
  users: UserRecord[];
  customers: CustomerRecord[];
  shipments: ShipmentRecord[];
  shipmentEvents: ShipmentEventRecord[];
  documents: DocumentRecord[];
  notifications: NotificationRecord[];
  securityEvents: SecurityEventRecord[];
  sessions: UserSessionRecord[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

// SHA-256 password hasher with salt for deterministic test verification & security
export function hashPassword(password: string): string {
  const salt = 'enterprise_logistics_salt_2026';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

function getInitialData(): DatabaseSchema {
  const now = new Date();
  const d = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();
  const futureD = (daysAhead: number) => new Date(now.getTime() + daysAhead * 86400 * 1000).toISOString().split('T')[0];

  const users: UserRecord[] = [
    {
      id: 'USR-1001',
      email: 'admin@logistics.corp',
      passwordHash: hashPassword('AdminPass123!'),
      name: 'Alexander Vance',
      role: 'ADMIN',
      phone: '+1 (555) 234-5678',
      company: 'Logistics Enterprise Systems HQ',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: d(720),
      lastLoginAt: d(1),
      status: 'ACTIVE',
      preferences: {
        theme: 'light',
        emailAlerts: true,
        smsAlerts: true,
        language: 'en-US',
      },
    },
    {
      id: 'USR-1002',
      email: 'manager@logistics.corp',
      passwordHash: hashPassword('ManagerPass123!'),
      name: 'Elena Rostova',
      role: 'OPERATIONS_MANAGER',
      phone: '+1 (555) 876-5432',
      company: 'Logistics Enterprise Systems HQ',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: d(600),
      lastLoginAt: d(2),
      status: 'ACTIVE',
      preferences: {
        theme: 'light',
        emailAlerts: true,
        smsAlerts: false,
        language: 'en-US',
      },
    },
    {
      id: 'USR-1003',
      email: 'customer@acmeind.com',
      passwordHash: hashPassword('CustomerPass123!'),
      name: 'Marcus Chen',
      role: 'CUSTOMER',
      customerId: 'CUST-1001',
      phone: '+1 (555) 432-1098',
      company: 'Acme Industrial Corp',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: d(400),
      lastLoginAt: d(5),
      status: 'ACTIVE',
      preferences: {
        theme: 'light',
        emailAlerts: true,
        smsAlerts: true,
        language: 'en-US',
      },
    },
    {
      id: 'USR-1004',
      email: 'customer@apextech.com',
      passwordHash: hashPassword('CustomerPass123!'),
      name: 'Sarah Jenkins',
      role: 'CUSTOMER',
      customerId: 'CUST-1002',
      phone: '+1 (555) 345-6789',
      company: 'Apex Robotics Inc',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      createdAt: d(350),
      lastLoginAt: d(12),
      status: 'ACTIVE',
      preferences: {
        theme: 'light',
        emailAlerts: false,
        smsAlerts: false,
        language: 'en-US',
      },
    },
  ];

  const customers: CustomerRecord[] = [
    {
      id: 'CUST-1001',
      name: 'Marcus Chen',
      company: 'Acme Industrial Corp',
      email: 'marcus.chen@acmeind.com',
      phone: '+1 (555) 432-1098',
      address: '742 Industrial Parkway, Suite 400',
      city: 'Chicago, IL',
      country: 'United States',
      accountStatus: 'ACTIVE',
      createdAt: d(500),
      notes: 'Tier-1 High Volume Manufacturer. Requires expedited customs handling.',
    },
    {
      id: 'CUST-1002',
      name: 'Sarah Jenkins',
      company: 'Apex Robotics Inc',
      email: 'sarah.jenkins@apextech.com',
      phone: '+1 (555) 345-6789',
      address: '1080 Innovation Way, Bldg B',
      city: 'San Jose, CA',
      country: 'United States',
      accountStatus: 'ACTIVE',
      createdAt: d(420),
      notes: 'Robotics automation hardware and subassemblies.',
    },
    {
      id: 'CUST-1003',
      name: 'Dr. Lucas Lindqvist',
      company: 'BioHealth Pharma Global',
      email: 'l.lindqvist@biohealth-pharma.eu',
      phone: '+41 61 298 4400',
      address: 'Grenzacherstrasse 124',
      city: 'Basel',
      country: 'Switzerland',
      accountStatus: 'ACTIVE',
      createdAt: d(380),
      notes: 'Temperature-controlled pharmaceutical shipments (Cold chain standard 2-8°C).',
    },
    {
      id: 'CUST-1004',
      name: 'Amelie Mercier',
      company: 'Vanguard Aerospace',
      email: 'a.mercier@vanguard-aero.fr',
      phone: '+33 5 62 12 34 56',
      address: 'Rond-Point Maurice Bellonte',
      city: 'Toulouse',
      country: 'France',
      accountStatus: 'ACTIVE',
      createdAt: d(310),
      notes: 'Aerospace structural parts and avionics modules.',
    },
    {
      id: 'CUST-1005',
      name: 'Frederik Larsson',
      company: 'Nordic Retail Logistics',
      email: 'f.larsson@nordicretail.se',
      phone: '+46 8 555 123 45',
      address: 'Hammarby Fabriksväg 25',
      city: 'Stockholm',
      country: 'Sweden',
      accountStatus: 'ACTIVE',
      createdAt: d(240),
      notes: 'Cross-border omnichannel apparel and consumer electronics.',
    },
  ];

  const shipments: ShipmentRecord[] = [
    {
      id: 'SHP-10021',
      customerId: 'CUST-1001',
      customerName: 'Acme Industrial Corp',
      origin: 'Frankfurt Cargo Hub (FRA), Germany',
      destination: 'Chicago O\'Hare Logistics Terminal (ORD), USA',
      packageDescription: 'Precision CNC Machining Spindles & Servo Drives',
      weightKg: 1420.5,
      dimensions: '120 x 80 x 140 cm',
      priority: 'HIGH',
      currentStatus: 'IN_TRANSIT',
      expectedDeliveryDate: futureD(2),
      contactName: 'David Miller',
      contactPhone: '+1 (312) 555-0199',
      contactEmail: 'dmiller@acmeind.com',
      additionalNotes: 'Commercial invoice pre-cleared with CBP customs.',
      createdAt: d(48),
      updatedAt: d(6),
      createdByUserId: 'USR-1002',
    },
    {
      id: 'SHP-10022',
      customerId: 'CUST-1002',
      customerName: 'Apex Robotics Inc',
      origin: 'Tokyo Narita Air Freight (NRT), Japan',
      destination: 'Rotterdam Sea-Air Gateway, Netherlands',
      packageDescription: 'Cobot Multi-Axis Articulated Arms',
      weightKg: 380.0,
      dimensions: '90 x 90 x 110 cm',
      priority: 'HIGH',
      currentStatus: 'DELAYED',
      expectedDeliveryDate: futureD(4),
      contactName: 'Kenji Sato',
      contactPhone: '+81 3 5555 0142',
      contactEmail: 'k.sato@apextech.com',
      additionalNotes: 'Port congestion hold at intermediate customs terminal.',
      createdAt: d(72),
      updatedAt: d(4),
      createdByUserId: 'USR-1002',
    },
    {
      id: 'SHP-10023',
      customerId: 'CUST-1003',
      customerName: 'BioHealth Pharma Global',
      origin: 'Basel EuroAirport LifeSciences Depot, Switzerland',
      destination: 'Boston Life Sciences Corridor, USA',
      packageDescription: 'Clinical Trial Immunotherapy Vials (Active Cold-Chain Container)',
      weightKg: 95.4,
      dimensions: '60 x 50 x 50 cm',
      priority: 'CRITICAL',
      currentStatus: 'DELIVERED',
      expectedDeliveryDate: d(12).split('T')[0],
      contactName: 'Dr. Clara Hughes',
      contactPhone: '+1 (617) 555-0182',
      contactEmail: 'c.hughes@bostonhealth.org',
      additionalNotes: 'Received and verified by Dr. Hughes. Temperature log verified within 2-8°C.',
      createdAt: d(96),
      updatedAt: d(12),
      createdByUserId: 'USR-1001',
    },
    {
      id: 'SHP-10024',
      customerId: 'CUST-1004',
      customerName: 'Vanguard Aerospace',
      origin: 'Toulouse-Blagnac Freight Bay, France',
      destination: 'Seattle Boeing Field Freight Ramp, USA',
      packageDescription: 'Titanium Wing Spar Components & Fasteners',
      weightKg: 2180.0,
      dimensions: '240 x 110 x 95 cm',
      priority: 'HIGH',
      currentStatus: 'OUT_FOR_DELIVERY',
      expectedDeliveryDate: futureD(0),
      contactName: 'Robert Sterling',
      contactPhone: '+1 (206) 555-0177',
      contactEmail: 'r.sterling@vanguard-aero.com',
      additionalNotes: 'Specialized flatbed transport with pneumatic suspension.',
      createdAt: d(60),
      updatedAt: d(2),
      createdByUserId: 'USR-1002',
    },
    {
      id: 'SHP-10025',
      customerId: 'CUST-1005',
      customerName: 'Nordic Retail Logistics',
      origin: 'Hamburg Logistics Center 4, Germany',
      destination: 'Stockholm Arlanda Distribution Facility, Sweden',
      packageDescription: 'E-commerce High-Density Apparel Pallets (40 Cartons)',
      weightKg: 780.0,
      dimensions: '120 x 100 x 180 cm',
      priority: 'MEDIUM',
      currentStatus: 'ARRIVED_AT_FACILITY',
      expectedDeliveryDate: futureD(1),
      contactName: 'Astrid Lind',
      contactPhone: '+46 8 555 9012',
      contactEmail: 'a.lind@nordicretail.se',
      additionalNotes: 'Scheduled for local regional distribution center sorting.',
      createdAt: d(36),
      updatedAt: d(5),
      createdByUserId: 'USR-1002',
    },
    {
      id: 'SHP-10026',
      customerId: 'CUST-1001',
      customerName: 'Acme Industrial Corp',
      origin: 'Shenzhen Bao\'an Cargo Terminal, China',
      destination: 'Dallas/Fort Worth Gateway (DFW), USA',
      packageDescription: 'PLC Automation Controllers & Industrial Sensors',
      weightKg: 520.0,
      dimensions: '100 x 80 x 90 cm',
      priority: 'MEDIUM',
      currentStatus: 'PICKED_UP',
      expectedDeliveryDate: futureD(5),
      contactName: 'Marcus Chen',
      contactPhone: '+1 (555) 432-1098',
      contactEmail: 'marcus.chen@acmeind.com',
      additionalNotes: 'Consolidation manifest attached.',
      createdAt: d(20),
      updatedAt: d(18),
      createdByUserId: 'USR-1002',
    },
    {
      id: 'SHP-10027',
      customerId: 'CUST-1003',
      customerName: 'BioHealth Pharma Global',
      origin: 'Munich Airport Freight Center, Germany',
      destination: 'London Heathrow Cargo Terminal, UK',
      packageDescription: 'Diagnostic Reagents & Pipette Consumables',
      weightKg: 64.0,
      dimensions: '50 x 40 x 40 cm',
      priority: 'LOW',
      currentStatus: 'CREATED',
      expectedDeliveryDate: futureD(3),
      contactName: 'Claire Bennett',
      contactPhone: '+44 20 7946 0912',
      contactEmail: 'c.bennett@biohealth.co.uk',
      additionalNotes: 'Standard air freight booking awaiting carrier pickup.',
      createdAt: d(8),
      updatedAt: d(8),
      createdByUserId: 'USR-1001',
    },
    {
      id: 'SHP-10028',
      customerId: 'CUST-1004',
      customerName: 'Vanguard Aerospace',
      origin: 'Nagoya Port Cargo Depot, Japan',
      destination: 'Los Angeles International Gateway, USA',
      packageDescription: 'Carbon Composite Tail-Fin Assemblies',
      weightKg: 1650.0,
      dimensions: '220 x 140 x 120 cm',
      priority: 'HIGH',
      currentStatus: 'IN_TRANSIT',
      expectedDeliveryDate: futureD(3),
      contactName: 'Amelie Mercier',
      contactPhone: '+33 5 62 12 34 56',
      contactEmail: 'a.mercier@vanguard-aero.fr',
      additionalNotes: 'Vessel Trans-Pacific Express Container #CX-8891.',
      createdAt: d(54),
      updatedAt: d(10),
      createdByUserId: 'USR-1002',
    },
  ];

  const shipmentEvents: ShipmentEventRecord[] = [
    // Events for SHP-10021 (IN_TRANSIT)
    {
      id: 'EVT-101',
      shipmentId: 'SHP-10021',
      status: 'CREATED',
      location: 'Frankfurt Cargo Hub (FRA), Germany',
      description: 'Shipment order booked and manifest documentation generated.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(48),
    },
    {
      id: 'EVT-102',
      shipmentId: 'SHP-10021',
      status: 'PICKED_UP',
      location: 'Frankfurt Cargo Hub (FRA), Germany',
      description: 'Carrier loaded pallets onto export feeder transport.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(36),
    },
    {
      id: 'EVT-103',
      shipmentId: 'SHP-10021',
      status: 'IN_TRANSIT',
      location: 'Mid-Atlantic Airspace / Flight LX-402',
      description: 'Air freight in international flight corridor en route to ORD.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(6),
    },

    // Events for SHP-10022 (DELAYED)
    {
      id: 'EVT-201',
      shipmentId: 'SHP-10022',
      status: 'CREATED',
      location: 'Tokyo Narita Air Freight (NRT), Japan',
      description: 'Booking confirmed and export compliance checks passed.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(72),
    },
    {
      id: 'EVT-202',
      shipmentId: 'SHP-10022',
      status: 'PICKED_UP',
      location: 'Tokyo Narita Air Freight (NRT), Japan',
      description: 'Consignment received at air cargo freight handling.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(60),
    },
    {
      id: 'EVT-203',
      shipmentId: 'SHP-10022',
      status: 'IN_TRANSIT',
      location: 'Dubai International Transit Hub (DXB)',
      description: 'Cargo transfer between connecting flights.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(30),
    },
    {
      id: 'EVT-204',
      shipmentId: 'SHP-10022',
      status: 'DELAYED',
      location: 'Rotterdam Sea-Air Gateway, Netherlands',
      description: 'Customs clearance delayed due to secondary import inspection schedule.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(4),
    },

    // Events for SHP-10023 (DELIVERED)
    {
      id: 'EVT-301',
      shipmentId: 'SHP-10023',
      status: 'CREATED',
      location: 'Basel EuroAirport LifeSciences Depot, Switzerland',
      description: 'Active cold-chain logistics protocol initiated and pre-cooled.',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(96),
    },
    {
      id: 'EVT-302',
      shipmentId: 'SHP-10023',
      status: 'PICKED_UP',
      location: 'Basel EuroAirport LifeSciences Depot, Switzerland',
      description: 'Transferred to temperature-monitored refrigerated cargo flight.',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(80),
    },
    {
      id: 'EVT-303',
      shipmentId: 'SHP-10023',
      status: 'IN_TRANSIT',
      location: 'International Air Transit Corridor',
      description: 'Continuous digital data-logger reporting 3.4°C (Optimal).',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(50),
    },
    {
      id: 'EVT-304',
      shipmentId: 'SHP-10023',
      status: 'ARRIVED_AT_FACILITY',
      location: 'Boston Logan International LifeSciences Ramp, USA',
      description: 'Cargo unloaded to climate-controlled clean room storage.',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(24),
    },
    {
      id: 'EVT-305',
      shipmentId: 'SHP-10023',
      status: 'OUT_FOR_DELIVERY',
      location: 'Boston Life Sciences Express Van #09',
      description: 'Dispatched for direct delivery with cold-chain escort.',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(16),
    },
    {
      id: 'EVT-306',
      shipmentId: 'SHP-10023',
      status: 'DELIVERED',
      location: 'Boston Life Sciences Corridor, USA',
      description: 'Package delivered and signed by Dr. Clara Hughes. Proof of delivery registered.',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(12),
    },

    // Events for SHP-10024 (OUT_FOR_DELIVERY)
    {
      id: 'EVT-401',
      shipmentId: 'SHP-10024',
      status: 'CREATED',
      location: 'Toulouse-Blagnac Freight Bay, France',
      description: 'Order created with specialized aerospace handling instructions.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(60),
    },
    {
      id: 'EVT-402',
      shipmentId: 'SHP-10024',
      status: 'PICKED_UP',
      location: 'Toulouse-Blagnac Freight Bay, France',
      description: 'Loaded on heavy cargo aircraft.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(45),
    },
    {
      id: 'EVT-403',
      shipmentId: 'SHP-10024',
      status: 'IN_TRANSIT',
      location: 'Polar Air Route Paris-Seattle',
      description: 'Flight completed safely.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(20),
    },
    {
      id: 'EVT-404',
      shipmentId: 'SHP-10024',
      status: 'ARRIVED_AT_FACILITY',
      location: 'Seattle Boeing Field Freight Ramp, USA',
      description: 'Cleared US Customs and transferred to specialized flatbed.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(8),
    },
    {
      id: 'EVT-405',
      shipmentId: 'SHP-10024',
      status: 'OUT_FOR_DELIVERY',
      location: 'Seattle Boeing Field Freight Ramp, USA',
      description: 'Driver dispatched on final delivery mile.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(2),
    },

    // Events for SHP-10025 (ARRIVED_AT_FACILITY)
    {
      id: 'EVT-501',
      shipmentId: 'SHP-10025',
      status: 'CREATED',
      location: 'Hamburg Logistics Center 4, Germany',
      description: 'Retail batch manifest finalized.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(36),
    },
    {
      id: 'EVT-502',
      shipmentId: 'SHP-10025',
      status: 'PICKED_UP',
      location: 'Hamburg Logistics Center 4, Germany',
      description: 'Intermodal freight train departure.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(24),
    },
    {
      id: 'EVT-503',
      shipmentId: 'SHP-10025',
      status: 'IN_TRANSIT',
      location: 'Øresund Freight Corridor, Denmark-Sweden',
      description: 'Crossing into Swedish freight jurisdiction.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(14),
    },
    {
      id: 'EVT-504',
      shipmentId: 'SHP-10025',
      status: 'ARRIVED_AT_FACILITY',
      location: 'Stockholm Arlanda Distribution Facility, Sweden',
      description: 'Arrived at regional sort depot for breakdown and sorting.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(5),
    },

    // Events for SHP-10026 (PICKED_UP)
    {
      id: 'EVT-601',
      shipmentId: 'SHP-10026',
      status: 'CREATED',
      location: 'Shenzhen Bao\'an Cargo Terminal, China',
      description: 'Shipment created and warehouse barcode printed.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(20),
    },
    {
      id: 'EVT-602',
      shipmentId: 'SHP-10026',
      status: 'PICKED_UP',
      location: 'Shenzhen Bao\'an Cargo Terminal, China',
      description: 'Received by carrier at cargo screening facility.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(18),
    },

    // Events for SHP-10027 (CREATED)
    {
      id: 'EVT-701',
      shipmentId: 'SHP-10027',
      status: 'CREATED',
      location: 'Munich Airport Freight Center, Germany',
      description: 'Shipment order booked and airway bill generated.',
      performedByUserId: 'USR-1001',
      performedByName: 'Alexander Vance',
      timestamp: d(8),
    },

    // Events for SHP-10028 (IN_TRANSIT)
    {
      id: 'EVT-801',
      shipmentId: 'SHP-10028',
      status: 'CREATED',
      location: 'Nagoya Port Cargo Depot, Japan',
      description: 'Heavy cargo documentation completed.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(54),
    },
    {
      id: 'EVT-802',
      shipmentId: 'SHP-10028',
      status: 'PICKED_UP',
      location: 'Nagoya Port Cargo Depot, Japan',
      description: 'Secured inside 40ft high-cube sea-freight container.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(40),
    },
    {
      id: 'EVT-803',
      shipmentId: 'SHP-10028',
      status: 'IN_TRANSIT',
      location: 'Pacific Ocean Transit (Vessel CX-8891)',
      description: 'Maritime crossing in progress, vessel on schedule.',
      performedByUserId: 'USR-1002',
      performedByName: 'Elena Rostova',
      timestamp: d(10),
    },
  ];

  const documents: DocumentRecord[] = [
    {
      id: 'DOC-2026-001',
      shipmentId: 'SHP-10021',
      customerId: 'CUST-1001',
      title: 'Commercial Invoice & Export Declaration',
      fileName: 'Commercial_Invoice_SHP10021.pdf',
      fileSize: 428000,
      fileType: 'application/pdf',
      documentType: 'INVOICE',
      storagePath: 'documents/2026/09/Commercial_Invoice_SHP10021.pdf',
      storageProvider: 'local',
      uploadedByUserId: 'USR-1002',
      uploadedByName: 'Elena Rostova',
      uploadedAt: d(47),
    },
    {
      id: 'DOC-2026-002',
      shipmentId: 'SHP-10021',
      customerId: 'CUST-1001',
      title: 'Master Air Waybill (MAWB 020-89104421)',
      fileName: 'Air_Waybill_SHP10021.pdf',
      fileSize: 312000,
      fileType: 'application/pdf',
      documentType: 'BILL_OF_LADING',
      storagePath: 'documents/2026/09/Air_Waybill_SHP10021.pdf',
      storageProvider: 'local',
      uploadedByUserId: 'USR-1002',
      uploadedByName: 'Elena Rostova',
      uploadedAt: d(46),
    },
    {
      id: 'DOC-2026-003',
      shipmentId: 'SHP-10022',
      customerId: 'CUST-1002',
      title: 'EU Import Customs Declaration (SAD Form)',
      fileName: 'Customs_Declaration_SHP10022.pdf',
      fileSize: 580000,
      fileType: 'application/pdf',
      documentType: 'CUSTOMS_DECLARATION',
      storagePath: 'documents/2026/09/Customs_Declaration_SHP10022.pdf',
      storageProvider: 'local',
      uploadedByUserId: 'USR-1002',
      uploadedByName: 'Elena Rostova',
      uploadedAt: d(71),
    },
    {
      id: 'DOC-2026-004',
      shipmentId: 'SHP-10023',
      customerId: 'CUST-1003',
      title: 'Active Cold Chain Compliance Certificate & Sensor Log',
      fileName: 'Cold_Chain_Certificate_SHP10023.pdf',
      fileSize: 1240000,
      fileType: 'application/pdf',
      documentType: 'CERTIFICATE',
      storagePath: 'documents/2026/09/Cold_Chain_Certificate_SHP10023.pdf',
      storageProvider: 'local',
      uploadedByUserId: 'USR-1001',
      uploadedByName: 'Alexander Vance',
      uploadedAt: d(95),
    },
    {
      id: 'DOC-2026-005',
      shipmentId: 'SHP-10023',
      customerId: 'CUST-1003',
      title: 'Signed Proof of Delivery (POD Receipt)',
      fileName: 'POD_Receipt_SHP10023.pdf',
      fileSize: 265000,
      fileType: 'application/pdf',
      documentType: 'DELIVERY_RECEIPT',
      storagePath: 'documents/2026/09/POD_Receipt_SHP10023.pdf',
      storageProvider: 'local',
      uploadedByUserId: 'USR-1001',
      uploadedByName: 'Alexander Vance',
      uploadedAt: d(12),
    },
    {
      id: 'DOC-2026-006',
      shipmentId: 'SHP-10024',
      customerId: 'CUST-1004',
      title: 'FAA Aerospace Material Conformity Certificate',
      fileName: 'Material_Conformity_SHP10024.pdf',
      fileSize: 690000,
      fileType: 'application/pdf',
      documentType: 'CERTIFICATE',
      storagePath: 'documents/2026/09/Material_Conformity_SHP10024.pdf',
      storageProvider: 'local',
      uploadedByUserId: 'USR-1002',
      uploadedByName: 'Elena Rostova',
      uploadedAt: d(59),
    },
  ];

  const notifications: NotificationRecord[] = [
    {
      id: 'NOTIF-101',
      title: 'Shipment Delayed - Customs Clearance',
      message: 'Shipment SHP-10022 for Apex Robotics is held at Rotterdam Sea-Air Gateway for secondary inspection.',
      type: 'SHIPMENT_DELAYED',
      read: false,
      linkTo: '/shipments/SHP-10022',
      createdAt: d(4),
    },
    {
      id: 'NOTIF-102',
      title: 'Delivery Completed',
      message: 'Critical shipment SHP-10023 was successfully delivered to Dr. Clara Hughes in Boston.',
      type: 'DELIVERY_COMPLETED',
      read: false,
      linkTo: '/shipments/SHP-10023',
      createdAt: d(12),
    },
    {
      id: 'NOTIF-103',
      title: 'Shipment Out For Delivery',
      message: 'Shipment SHP-10024 is currently out for delivery to Seattle Boeing Field Ramp.',
      type: 'SHIPMENT_STATUS',
      read: true,
      linkTo: '/shipments/SHP-10024',
      createdAt: d(2),
    },
    {
      id: 'NOTIF-104',
      title: 'New Document Uploaded',
      message: 'Proof of Delivery (POD Receipt) uploaded for shipment SHP-10023 by Alexander Vance.',
      type: 'DOCUMENT_UPLOADED',
      read: true,
      linkTo: '/documents',
      createdAt: d(12),
    },
    {
      id: 'NOTIF-105',
      title: 'Security Alert: New Session Authorized',
      message: 'User Elena Rostova signed in from IP 192.168.1.42 (macOS Safari).',
      type: 'SECURITY_ALERT',
      read: false,
      linkTo: '/security',
      createdAt: d(2),
    },
  ];

  const securityEvents: SecurityEventRecord[] = [
    {
      id: 'SEC-101',
      userId: 'USR-1001',
      userEmail: 'admin@logistics.corp',
      eventType: 'LOGIN_SUCCESS',
      ipAddress: '10.0.4.12',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Successful JWT credential verification with MFA bypass token.',
      timestamp: d(1),
    },
    {
      id: 'SEC-102',
      userId: 'USR-1002',
      userEmail: 'manager@logistics.corp',
      eventType: 'LOGIN_SUCCESS',
      ipAddress: '192.168.1.42',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: 'Operations Manager authenticated successfully.',
      timestamp: d(2),
    },
    {
      id: 'SEC-103',
      userId: 'USR-1003',
      userEmail: 'customer@acmeind.com',
      eventType: 'LOGIN_SUCCESS',
      ipAddress: '172.16.20.5',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      details: 'Customer portal access granted.',
      timestamp: d(5),
    },
    {
      id: 'SEC-104',
      userEmail: 'unknown.intruder@external.net',
      eventType: 'LOGIN_FAILURE',
      ipAddress: '198.51.100.23',
      userAgent: 'curl/7.68.0',
      details: 'Failed authentication attempt: User not found in database.',
      timestamp: d(28),
    },
    {
      id: 'SEC-105',
      userId: 'USR-1001',
      userEmail: 'admin@logistics.corp',
      eventType: 'PASSWORD_CHANGED',
      ipAddress: '10.0.4.12',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      details: 'Admin user password rotated according to quarterly security policy.',
      timestamp: d(120),
    },
  ];

  const sessions: UserSessionRecord[] = [
    {
      id: 'SESS-101',
      userId: 'USR-1001',
      userEmail: 'admin@logistics.corp',
      ipAddress: '10.0.4.12',
      device: 'MacBook Pro 16" (Chrome 124, macOS)',
      lastActive: d(0.1),
      isCurrent: true,
    },
    {
      id: 'SESS-102',
      userId: 'USR-1002',
      userEmail: 'manager@logistics.corp',
      ipAddress: '192.168.1.42',
      device: 'MacBook Air (Safari 17, macOS)',
      lastActive: d(1.5),
      isCurrent: false,
    },
    {
      id: 'SESS-103',
      userId: 'USR-1003',
      userEmail: 'customer@acmeind.com',
      ipAddress: '172.16.20.5',
      device: 'Dell Precision (Edge, Windows 11)',
      lastActive: d(4),
      isCurrent: false,
    },
  ];

  return {
    users,
    customers,
    shipments,
    shipmentEvents,
    documents,
    notifications,
    securityEvents,
    sessions,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.shipments && parsed.customers) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, seeding new database...', e);
    }

    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file', e);
    }
  }

  // Users & Auth
  getUsers() {
    return this.data.users;
  }

  findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  updateUser(id: string, updates: Partial<UserRecord>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  // Customers
  getCustomers() {
    return this.data.customers;
  }

  findCustomerById(id: string) {
    return this.data.customers.find(c => c.id === id);
  }

  createCustomer(customerData: Omit<CustomerRecord, 'id' | 'createdAt'>) {
    const nextNum = 1000 + this.data.customers.length + 1;
    const id = `CUST-${nextNum}`;
    const newCustomer: CustomerRecord = {
      ...customerData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.customers.push(newCustomer);
    this.saveData();
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<CustomerRecord>) {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
    this.saveData();
    return this.data.customers[idx];
  }

  deleteCustomer(id: string) {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.customers.splice(idx, 1);
    this.saveData();
    return true;
  }

  // Shipments
  getShipments() {
    return this.data.shipments;
  }

  findShipmentById(id: string) {
    return this.data.shipments.find(s => s.id === id);
  }

  createShipment(shipmentData: Omit<ShipmentRecord, 'id' | 'createdAt' | 'updatedAt'>, createdByName: string) {
    // Generate unique tracking number SHP-XXXXX
    let nextNum = 10020 + this.data.shipments.length + 1;
    let candidateId = `SHP-${nextNum}`;
    while (this.data.shipments.some(s => s.id === candidateId)) {
      nextNum += 1;
      candidateId = `SHP-${nextNum}`;
    }

    const now = new Date().toISOString();
    const newShipment: ShipmentRecord = {
      ...shipmentData,
      id: candidateId,
      createdAt: now,
      updatedAt: now,
    };

    this.data.shipments.unshift(newShipment);

    // Automatically create the initial CREATED event
    this.createShipmentEvent({
      shipmentId: candidateId,
      status: 'CREATED',
      location: shipmentData.origin,
      description: `Shipment booked by ${createdByName} for ${shipmentData.customerName}.`,
      performedByUserId: shipmentData.createdByUserId,
      performedByName: createdByName,
    });

    // Create notification
    this.createNotification({
      title: 'New Shipment Created',
      message: `Shipment ${candidateId} booked for ${shipmentData.customerName} (${shipmentData.origin} → ${shipmentData.destination}).`,
      type: 'SHIPMENT_STATUS',
      linkTo: `/shipments/${candidateId}`,
    });

    this.saveData();
    return newShipment;
  }

  updateShipment(id: string, updates: Partial<ShipmentRecord>) {
    const idx = this.data.shipments.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.data.shipments[idx] = {
      ...this.data.shipments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.data.shipments[idx];
  }

  updateShipmentStatus(
    id: string,
    newStatus: ShipmentStatus,
    location: string,
    description: string,
    userId: string,
    userName: string
  ) {
    const shipment = this.findShipmentById(id);
    if (!shipment) return null;

    shipment.currentStatus = newStatus;
    shipment.updatedAt = new Date().toISOString();

    // Create audit event in timeline
    this.createShipmentEvent({
      shipmentId: id,
      status: newStatus,
      location: location || shipment.destination,
      description: description || `Status updated to ${newStatus}`,
      performedByUserId: userId,
      performedByName: userName,
    });

    // Generate appropriate notification
    let notifType: any = 'SHIPMENT_STATUS';
    if (newStatus === 'DELIVERED') notifType = 'DELIVERY_COMPLETED';
    if (newStatus === 'DELAYED') notifType = 'SHIPMENT_DELAYED';

    this.createNotification({
      title: `Shipment ${id}: ${newStatus.replace(/_/g, ' ')}`,
      message: `${description || `Status changed to ${newStatus}`}. Location: ${location || 'In transit'}.`,
      type: notifType,
      linkTo: `/shipments/${id}`,
    });

    this.saveData();
    return shipment;
  }

  deleteShipment(id: string) {
    const idx = this.data.shipments.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.shipments.splice(idx, 1);
    // clean events & documents associations
    this.data.shipmentEvents = this.data.shipmentEvents.filter(e => e.shipmentId !== id);
    this.saveData();
    return true;
  }

  // Shipment Events (Timeline)
  getShipmentEvents(shipmentId: string) {
    return this.data.shipmentEvents
      .filter(e => e.shipmentId === shipmentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  createShipmentEvent(eventData: Omit<ShipmentEventRecord, 'id' | 'timestamp'>) {
    const newEvent: ShipmentEventRecord = {
      ...eventData,
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.shipmentEvents.push(newEvent);
    this.saveData();
    return newEvent;
  }

  // Documents
  getDocuments(filter?: { shipmentId?: string; customerId?: string }) {
    let docs = this.data.documents;
    if (filter?.shipmentId) {
      docs = docs.filter(d => d.shipmentId === filter.shipmentId);
    }
    if (filter?.customerId) {
      docs = docs.filter(d => d.customerId === filter.customerId);
    }
    return docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  findDocumentById(id: string) {
    return this.data.documents.find(d => d.id === id);
  }

  createDocument(docData: Omit<DocumentRecord, 'id' | 'uploadedAt'>) {
    const newDoc: DocumentRecord = {
      ...docData,
      id: `DOC-2026-${String(this.data.documents.length + 1).padStart(3, '0')}`,
      uploadedAt: new Date().toISOString(),
    };
    this.data.documents.unshift(newDoc);

    // Notification
    this.createNotification({
      title: 'New Document Uploaded',
      message: `${newDoc.title} (${newDoc.fileName}) was uploaded.`,
      type: 'DOCUMENT_UPLOADED',
      linkTo: '/documents',
    });

    this.saveData();
    return newDoc;
  }

  deleteDocument(id: string) {
    const idx = this.data.documents.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.data.documents.splice(idx, 1);
    this.saveData();
    return true;
  }

  // Notifications
  getNotifications() {
    return this.data.notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notifData: Omit<NotificationRecord, 'id' | 'createdAt' | 'read'>) {
    const newNotif: NotificationRecord = {
      ...notifData,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.saveData();
    return newNotif;
  }

  markNotificationRead(id: string) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  markAllNotificationsRead() {
    this.data.notifications.forEach(n => {
      n.read = true;
    });
    this.saveData();
    return true;
  }

  // Security Events & Audit Logs
  getSecurityEvents() {
    return this.data.securityEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  recordSecurityEvent(eventData: Omit<SecurityEventRecord, 'id' | 'timestamp'>) {
    const newEvent: SecurityEventRecord = {
      ...eventData,
      id: `SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.securityEvents.unshift(newEvent);
    // Keep max 200 security events
    if (this.data.securityEvents.length > 200) {
      this.data.securityEvents = this.data.securityEvents.slice(0, 200);
    }
    this.saveData();
    return newEvent;
  }

  // Sessions
  getSessions(userId?: string) {
    if (userId) {
      return this.data.sessions.filter(s => s.userId === userId);
    }
    return this.data.sessions;
  }

  createOrUpdateSession(sessionData: UserSessionRecord) {
    const idx = this.data.sessions.findIndex(s => s.id === sessionData.id);
    if (idx >= 0) {
      this.data.sessions[idx] = sessionData;
    } else {
      this.data.sessions.unshift(sessionData);
    }
    this.saveData();
  }

  revokeSession(sessionId: string) {
    const idx = this.data.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return false;
    const revoked = this.data.sessions.splice(idx, 1)[0];
    this.recordSecurityEvent({
      userId: revoked.userId,
      userEmail: revoked.userEmail,
      eventType: 'SESSION_REVOKED',
      ipAddress: revoked.ipAddress,
      userAgent: revoked.device,
      details: `Session ${sessionId} terminated by user.`,
    });
    this.saveData();
    return true;
  }

  revokeAllSessions(userId: string) {
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId);
    this.saveData();
    return true;
  }
}

export const db = new Database();
