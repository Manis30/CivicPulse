import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  DepartmentModel,
  TeamModel,
  ReportModel,
  IncidentModel,
  EvidenceModel,
  WorkOrderModel,
  IncidentEventModel,
  NotificationModel,
  AuditLogModel,
} from '../models/index.js';
import { logger } from '../utils/logger.js';
import { connectDatabase } from '../config/database.js';

export async function seedCivicDemo() {
  logger.info('Starting CivicPulse Civic Demo Seeding (Idempotent)...');

  // 1. Ensure Standard Departments Exist
  const deptDefs = [
    {
      code: 'ROADS',
      name: 'Department of Transport & Roads',
      description: 'Responsible for road pavement, potholes, sidewalk repairs, and traffic signals.',
      categories: ['POTHOLE', 'ROAD_DAMAGE', 'OTHER'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 11 - Kamraj Nagar', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 },
      isActive: true,
    },
    {
      code: 'WATER',
      name: 'Water Supply & Sewerage Board',
      description: 'Potable water pipelines, distribution mains, and hydrant operations.',
      categories: ['WATER_LEAK'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 11 - Kamraj Nagar', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 2 },
      isActive: true,
    },
    {
      code: 'SANITATION',
      name: 'Municipal Sanitation & Waste',
      description: 'Solid waste management, garbage container collection, and anti-dumping enforcement.',
      categories: ['GARBAGE', 'ILLEGAL_DUMPING'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 11 - Kamraj Nagar', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 6 },
      isActive: true,
    },
    {
      code: 'ELECTRICAL',
      name: 'Bureau of Street Lighting & Power',
      description: 'Public illumination, dark spot elimination, and wiring safety.',
      categories: ['STREETLIGHT'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 11 - Kamraj Nagar', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 8 },
      isActive: true,
    },
    {
      code: 'DRAINAGE',
      name: 'Stormwater & Drainage Authority',
      description: 'Stormwater culverts, flood runoff channels, and catch basins.',
      categories: ['DRAINAGE', 'FALLEN_TREE'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 11 - Kamraj Nagar', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 8, CRITICAL: 2 },
      isActive: true,
    },
  ];

  const departments: any = {};
  for (const def of deptDefs) {
    let dept = await DepartmentModel.findOne({ code: def.code });
    if (!dept) {
      dept = await DepartmentModel.create(def);
    }
    departments[def.code] = dept;
  }

  // 2. Ensure Standard Response Teams Exist
  const teamDefs = [
    {
      name: 'Team Alpha-01 (Road Repairs)',
      departmentId: departments['ROADS']._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 8 - Bagalur Road', 'Ward 2 - Railway Colony'],
      specializations: ['Cold/hot asphalt patching', 'Pavement grinding', 'Curb repairs'],
      capacity: 6,
      activeWorkload: 2,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8285, 12.7375],
        address: 'Bagalur Road Rapid Transit Depot, Hosur',
      },
      shift: 'MORNING',
      isActive: true,
    },
    {
      name: 'Team Water-Fast (Main Rupture)',
      departmentId: departments['WATER']._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 4 - Sipcot Phase 1', 'Ward 2 - Railway Colony'],
      specializations: ['High-pressure water main isolation', 'Trench shoring'],
      capacity: 4,
      activeWorkload: 1,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8320, 12.7410],
        address: 'Central Hosur Water Utility Substation',
      },
      shift: 'MORNING',
      isActive: true,
    },
    {
      name: 'Team Clean-02 (Sanitation)',
      departmentId: departments['SANITATION']._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 1 - Mathigiri', 'Ward 5 - Industrial Complex'],
      specializations: ['Heavy dumpster hauling', 'Bulk debris compaction'],
      capacity: 4,
      activeWorkload: 1,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8190, 12.7290],
        address: 'Sipcot Industrial Logistics Depot, Hosur',
      },
      shift: 'EVENING',
      isActive: true,
    },
    {
      name: 'Team Electrical-01 (Lighting)',
      departmentId: departments['ELECTRICAL']._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 11 - Kamraj Nagar', 'Ward 3 - Mookandapalli'],
      specializations: ['LED retrofit', 'Wiring replacement', 'Aerial bucket dispatch'],
      capacity: 3,
      activeWorkload: 1,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8310, 12.7480],
        address: 'Kamraj Nagar Substation, Hosur',
      },
      shift: 'MORNING',
      isActive: true,
    },
    {
      name: 'Team Drain-01 (Stormwater)',
      departmentId: departments['DRAINAGE']._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 1 - Mathigiri', 'Ward 6 - Avalapalli'],
      specializations: ['Culvert jetting', 'Silt suction excavator'],
      capacity: 4,
      activeWorkload: 2,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8390, 12.7160],
        address: 'Mathigiri Lake Inflow Station, Hosur',
      },
      shift: 'MORNING',
      isActive: true,
    },
  ];

  const teams: Record<string, any> = {};
  for (const tDef of teamDefs) {
    let team = await TeamModel.findOne({ name: tDef.name });
    if (!team) {
      team = await TeamModel.create(tDef);
    }
    teams[tDef.name] = team;
  }

  // 3. Upsert 10 Realistic Citizens with authentic bcrypt hashing
  logger.info('Upserting 10 authentic demo citizens...');
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const citizenDefs = [
    {
      name: 'Chief Architect Miller',
      email: 'admin.miller@civicpulse.org',
      phone: '+1 (555) 010-0001',
      role: 'PLATFORM_ADMIN',
      ward: 'Ward 12 - Central Hosur',
      address: '14, 2nd Cross, MG Road, Ward 12, Hosur',
      location: [77.8285, 12.7375],
    },
    {
      name: 'Elena Rostova',
      email: 'citizen.elena@civicpulse.org',
      phone: '+1 (555) 019-2831',
      role: 'CITIZEN',
      ward: 'Ward 08 - Bagalur Road Corridor',
      address: '42 Bagalur Road, Near Ring Road, Ward 8, Hosur',
      location: [77.8350, 12.7420],
    },
    {
      name: 'David Kim',
      email: 'citizen.david@civicpulse.org',
      phone: '+1 (555) 019-8877',
      role: 'CITIZEN',
      ward: 'Ward 05 - SIPCOT Industrial Complex',
      address: 'Sector 3, Phase 1 Road, SIPCOT, Ward 5, Hosur',
      location: [77.8150, 12.7210],
    },
    {
      name: 'Priya Ramanathan',
      email: 'citizen.priya@civicpulse.org',
      phone: '+1 (555) 019-3344',
      role: 'CITIZEN',
      ward: 'Ward 03 - Mookandapalli',
      address: '88 Mookandapalli Bypass Road, Ward 3, Hosur',
      location: [77.8080, 12.7510],
    },
    {
      name: 'Arun Karthik',
      email: 'citizen.arun@civicpulse.org',
      phone: '+1 (555) 019-5566',
      role: 'CITIZEN',
      ward: 'Ward 01 - Mathigiri',
      address: '12 Lake Inflow Lane, Mathigiri, Ward 1, Hosur',
      location: [77.8420, 12.7150],
    },
    {
      name: 'Dr. Ananya Sen',
      email: 'citizen.ananya@civicpulse.org',
      phone: '+1 (555) 019-7788',
      role: 'CITIZEN',
      ward: 'Ward 12 - Central Hosur',
      address: '55 Taluk Office Road, Ward 12, Hosur',
      location: [77.8260, 12.7390],
    },
    {
      name: 'Vikramaditya Rao',
      email: 'citizen.vikram@civicpulse.org',
      phone: '+1 (555) 019-9911',
      role: 'CITIZEN',
      ward: 'Ward 02 - Railway Colony',
      address: 'Station Approach Road, Railway Colony, Ward 2, Hosur',
      location: [77.8335, 12.7310],
    },
    {
      name: 'Meera Nambiar',
      email: 'citizen.meera@civicpulse.org',
      phone: '+1 (555) 019-4422',
      role: 'CITIZEN',
      ward: 'Ward 04 - Sipcot Phase 1',
      address: 'Logistics Hub Access, Phase 1, Ward 4, Hosur',
      location: [77.8120, 12.7562],
    },
    {
      name: 'Siddharth Varma',
      email: 'citizen.sid@civicpulse.org',
      phone: '+1 (555) 019-6633',
      role: 'CITIZEN',
      ward: 'Ward 06 - Avalapalli',
      address: '23 Avalapalli Main Road, Ward 6, Hosur',
      location: [77.8500, 12.7450],
    },
    {
      name: 'Fatima Zahra',
      email: 'citizen.fatima@civicpulse.org',
      phone: '+1 (555) 019-1155',
      role: 'CITIZEN',
      ward: 'Ward 11 - Kamraj Nagar',
      address: '67 Kamraj Nagar Cross, Ward 11, Hosur',
      location: [77.8310, 12.7480],
    },
  ];

  const citizens: Record<string, any> = {};
  for (const cDef of citizenDefs) {
    let u = await UserModel.findOne({ email: cDef.email });
    if (!u) {
      u = await UserModel.create({
        name: cDef.name,
        email: cDef.email,
        phone: cDef.phone,
        passwordHash,
        role: cDef.role,
        isActive: true,
        notificationPreferences: {
          channels: ['IN_APP', 'EMAIL', 'SMS'],
          alertOnCritical: true,
          weeklyDigest: false,
        },
      });
    }
    citizens[cDef.email] = u;
  }

  const miller = citizens['admin.miller@civicpulse.org'];
  const elena = citizens['citizen.elena@civicpulse.org'];
  const david = citizens['citizen.david@civicpulse.org'];
  const priya = citizens['citizen.priya@civicpulse.org'];
  const arun = citizens['citizen.arun@civicpulse.org'];
  const ananya = citizens['citizen.ananya@civicpulse.org'];
  const vikram = citizens['citizen.vikram@civicpulse.org'];
  const meera = citizens['citizen.meera@civicpulse.org'];
  const sid = citizens['citizen.sid@civicpulse.org'];
  const fatima = citizens['citizen.fatima@civicpulse.org'];

  // 4. Upsert Field Officer & Manager for Assignment Relationships
  let officerMarcus = await UserModel.findOne({ email: 'officer.vance@civicpulse.org' });
  if (!officerMarcus) {
    officerMarcus = await UserModel.create({
      name: 'Officer Marcus Vance',
      email: 'officer.vance@civicpulse.org',
      phone: '+1 (555) 014-9922',
      passwordHash,
      role: 'FIELD_OFFICER',
      departmentId: departments['ROADS']._id,
      isActive: true,
      notificationPreferences: { channels: ['IN_APP', 'SMS'], alertOnCritical: true, weeklyDigest: false },
    });
  }

  // 5. Seed Varied Municipal Incidents across Hosur Coordinates
  logger.info('Seeding realistic civic incidents across Hosur geography...');

  const incidentSeedSpecs = [
    // -------------------------------------------------------------
    // INCIDENTS FOR CHIEF ARCHITECT MILLER (12 Reports: 3 Active, 7 Resolved, 2 Closed)
    // -------------------------------------------------------------
    {
      incidentNumber: 'INC-2026-1005',
      category: 'POTHOLE',
      title: 'Pothole & Road Damage',
      description: 'Severe road surface asphalt failure creating deep vehicular hazards near municipal crossing.',
      location: {
        type: 'Point',
        coordinates: [77.8285, 12.7375], // Hosur Bus Terminal / Municipal Sector
        address: 'Municipal Sector at [77.8285, 12.7375]',
        nearbyLandmarks: ['Central Bus Terminal', 'Municipal Market'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha (Urban Core)',
      severity: 'MEDIUM',
      status: 'ASSIGNED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      teamId: teams['Team Alpha-01 (Road Repairs)']._id,
      assignedOfficerId: officerMarcus._id,
      slaHours: 48,
      createdAt: new Date('2026-09-29T15:55:07Z'),
      deadline: new Date('2026-10-01T15:55:12Z'),
      score: 45,
    },
    {
      incidentNumber: 'INC-2026-1007',
      category: 'POTHOLE',
      title: 'Pothole & Road Damage',
      description: 'Multiple crater potholes causing severe vehicle slowdown and pedestrian splash hazard.',
      location: {
        type: 'Point',
        coordinates: [77.8272, 12.7368], // 200m away
        address: '14 2nd Cross, MG Road, Ward 12, Hosur',
        nearbyLandmarks: ['MG Road Commercial Junction'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha (Urban Core)',
      severity: 'MEDIUM',
      status: 'ASSIGNED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      teamId: teams['Team Alpha-01 (Road Repairs)']._id,
      slaHours: 48,
      createdAt: new Date('2026-09-29T21:12:25Z'),
      deadline: new Date('2026-10-01T21:12:25Z'),
      score: 48,
    },
    {
      incidentNumber: 'INC-2026-1012',
      category: 'DRAINAGE',
      title: 'Drainage & Sewage Overflow',
      description: 'Blocked stormwater culvert overflowing onto pedestrian walkways after heavy afternoon shower.',
      location: {
        type: 'Point',
        coordinates: [77.8298, 12.7385], // 300m away
        address: 'Taluk Office Road, Municipal Approach, Ward 12, Hosur',
        nearbyLandmarks: ['Taluk Office'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha (Urban Core)',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      reporterId: miller._id,
      departmentId: departments['DRAINAGE']._id,
      teamId: teams['Team Drain-01 (Stormwater)']._id,
      slaHours: 8,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
      deadline: new Date(Date.now() + 5 * 3600 * 1000),
      score: 74,
    },
    {
      incidentNumber: 'INC-2026-1015',
      category: 'STREETLIGHT',
      title: 'Streetlight Failure & Electrical',
      description: 'Continuous blackout of 4 consecutive LED streetlight poles on primary transit corridor.',
      location: {
        type: 'Point',
        coordinates: [77.8310, 12.7480], // 1.2km away
        address: 'Kamraj Nagar 3rd Main, Ward 11, Hosur',
        nearbyLandmarks: ['Kamraj Nagar High School'],
      },
      ward: 'Ward 11 - Kamraj Nagar',
      zone: 'Zone Beta (Transit Corridor)',
      severity: 'MEDIUM',
      status: 'VERIFYING',
      reporterId: miller._id,
      departmentId: departments['ELECTRICAL']._id,
      teamId: teams['Team Electrical-01 (Lighting)']._id,
      slaHours: 24,
      createdAt: new Date(Date.now() - 20 * 3600 * 1000),
      deadline: new Date(Date.now() + 4 * 3600 * 1000),
      score: 55,
    },
    {
      incidentNumber: 'INC-2026-1018',
      category: 'GARBAGE',
      title: 'Garbage Accumulation & Waste',
      description: 'Overflowing commercial waste bin spilling onto public road sidewalk.',
      location: {
        type: 'Point',
        coordinates: [77.8350, 12.7420], // 1.1km away
        address: 'Bagalur Road Commercial Market, Ward 8, Hosur',
        nearbyLandmarks: ['Bagalur Vegetable Market'],
      },
      ward: 'Ward 08 - Bagalur Road Corridor',
      zone: 'Zone Gamma',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      reporterId: miller._id,
      departmentId: departments['SANITATION']._id,
      teamId: teams['Team Clean-02 (Sanitation)']._id,
      slaHours: 12,
      createdAt: new Date(Date.now() - 36 * 3600 * 1000),
      deadline: new Date(Date.now() - 24 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 26 * 3600 * 1000),
      score: 50,
    },
    {
      incidentNumber: 'INC-2026-1025',
      category: 'OTHER',
      title: 'Traffic Signal Malfunction',
      description: 'Stuck amber signal lamp causing confusion at four-way arterial intersection.',
      location: {
        type: 'Point',
        coordinates: [77.8255, 12.7350], // 400m away
        address: 'Gandhi Statue Four-Way Intersection, Ward 12, Hosur',
        nearbyLandmarks: ['Gandhi Statue'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'HIGH',
      status: 'RESOLVED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      slaHours: 12,
      createdAt: new Date(Date.now() - 48 * 3600 * 1000),
      deadline: new Date(Date.now() - 36 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 38 * 3600 * 1000),
      score: 72,
    },
    {
      incidentNumber: 'INC-2026-1031',
      category: 'ROAD_DAMAGE',
      title: 'Broken Footpath & Paver Blocks',
      description: 'Dislodged concrete paver blocks creating severe trip hazards for elderly pedestrians.',
      location: {
        type: 'Point',
        coordinates: [77.8290, 12.7360], // 200m away
        address: 'Bus Stand East Perimeter Sidewalk, Ward 12, Hosur',
        nearbyLandmarks: ['Bus Terminal East Gate'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'LOW',
      status: 'RESOLVED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      slaHours: 72,
      createdAt: new Date(Date.now() - 72 * 3600 * 1000),
      deadline: new Date(Date.now() - 10 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 20 * 3600 * 1000),
      score: 30,
    },
    {
      incidentNumber: 'INC-2026-1037',
      category: 'OTHER',
      title: 'Public Park Maintenance Issue',
      description: 'Damaged community park bench and perimeter fencing in Central Municipal Garden.',
      location: {
        type: 'Point',
        coordinates: [77.8265, 12.7380], // 350m away
        address: 'Central Municipal Park, Ward 12, Hosur',
        nearbyLandmarks: ['Central Municipal Garden'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'LOW',
      status: 'RESOLVED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      slaHours: 48,
      createdAt: new Date(Date.now() - 90 * 3600 * 1000),
      deadline: new Date(Date.now() - 42 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 50 * 3600 * 1000),
      score: 25,
    },
    {
      incidentNumber: 'INC-2026-1043',
      category: 'POTHOLE',
      title: 'Pothole & Road Damage',
      description: 'Deep road fissure on railway approach overpass.',
      location: {
        type: 'Point',
        coordinates: [77.8335, 12.7310], // 900m away
        address: 'Railway Overbridge Approach, Ward 2, Hosur',
        nearbyLandmarks: ['Hosur Railway Station'],
      },
      ward: 'Ward 02 - Railway Colony',
      zone: 'Zone Delta',
      severity: 'HIGH',
      status: 'RESOLVED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      slaHours: 24,
      createdAt: new Date(Date.now() - 120 * 3600 * 1000),
      deadline: new Date(Date.now() - 96 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 98 * 3600 * 1000),
      score: 75,
    },
    {
      incidentNumber: 'INC-2026-1067',
      category: 'ILLEGAL_DUMPING',
      title: 'Illegal Dumping on Roadside',
      description: 'Demolition concrete rubble dumped overnight on public right-of-way.',
      location: {
        type: 'Point',
        coordinates: [77.8240, 12.7390], // 500m away
        address: 'Behind Old Municipal Office, Ward 12, Hosur',
        nearbyLandmarks: ['Old Municipality Building'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      reporterId: miller._id,
      departmentId: departments['SANITATION']._id,
      slaHours: 24,
      createdAt: new Date(Date.now() - 140 * 3600 * 1000),
      deadline: new Date(Date.now() - 116 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 120 * 3600 * 1000),
      score: 52,
    },
    {
      incidentNumber: 'INC-2026-1073',
      category: 'ROAD_DAMAGE',
      title: 'Pedestrian Walkway Crack',
      description: 'Minor walkway surface subsidence near library entrance.',
      location: {
        type: 'Point',
        coordinates: [77.8270, 12.7370], // 200m away
        address: 'Public Library Lane, Ward 12, Hosur',
        nearbyLandmarks: ['Public Library'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'LOW',
      status: 'CLOSED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      slaHours: 72,
      createdAt: new Date(Date.now() - 180 * 3600 * 1000),
      deadline: new Date(Date.now() - 108 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 130 * 3600 * 1000),
      score: 20,
    },
    {
      incidentNumber: 'INC-2026-1082',
      category: 'OTHER',
      title: 'Park Playground Fixture Repair',
      description: 'Broken swing link chain in children municipal playground.',
      location: {
        type: 'Point',
        coordinates: [77.8260, 12.7380], // 300m away
        address: 'Community Park Playground, Ward 12, Hosur',
        nearbyLandmarks: ['Municipal Park'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'LOW',
      status: 'CLOSED',
      reporterId: miller._id,
      departmentId: departments['ROADS']._id,
      slaHours: 48,
      createdAt: new Date(Date.now() - 200 * 3600 * 1000),
      deadline: new Date(Date.now() - 152 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 160 * 3600 * 1000),
      score: 18,
    },

    // -------------------------------------------------------------
    // NEARBY GEOGRAPHIC INCIDENTS ACROSS HOSUR (REPORTED BY OTHER CITIZENS)
    // -------------------------------------------------------------
    {
      incidentNumber: 'INC-2026-1022',
      category: 'WATER_LEAK',
      title: 'Water Leak & Pipe Rupture',
      description: 'Underground potable distribution main ruptured, gushing water onto arterial carriageway.',
      location: {
        type: 'Point',
        coordinates: [77.8305, 12.7395], // 450m from Ward 12 center
        address: 'Opposite Municipal Hospital, Ward 12, Hosur',
        nearbyLandmarks: ['Government Hospital'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      reporterId: ananya._id,
      departmentId: departments['WATER']._id,
      teamId: teams['Team Water-Fast (Main Rupture)']._id,
      slaHours: 4,
      createdAt: new Date(Date.now() - 1.5 * 3600 * 1000),
      deadline: new Date(Date.now() + 2.5 * 3600 * 1000),
      score: 95,
    },
    {
      incidentNumber: 'INC-2026-1028',
      category: 'ILLEGAL_DUMPING',
      title: 'Illegal Chemical Drum Dumping',
      description: 'Unidentified commercial drums abandoned near industrial canal perimeter.',
      location: {
        type: 'Point',
        coordinates: [77.8150, 12.7210], // 2.1km away
        address: 'SIPCOT Industrial Road 3, Ward 5, Hosur',
        nearbyLandmarks: ['SIPCOT Sector 3 Substation'],
      },
      ward: 'Ward 05 - SIPCOT Industrial Complex',
      zone: 'Zone Gamma',
      severity: 'CRITICAL',
      status: 'ANALYZING',
      reporterId: david._id,
      departmentId: departments['SANITATION']._id,
      slaHours: 6,
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
      deadline: new Date(Date.now() + 5.3 * 3600 * 1000),
      score: 88,
    },
    {
      incidentNumber: 'INC-2026-1034',
      category: 'FALLEN_TREE',
      title: 'Roadside Tree Hazard & Obstruction',
      description: 'Large banyan branch snapped during rain, blocking outbound traffic lane.',
      location: {
        type: 'Point',
        coordinates: [77.8500, 12.7450], // 2.5km away
        address: 'Avalapalli Main Road, Near Primary Health Center, Ward 6, Hosur',
        nearbyLandmarks: ['Avalapalli Health Center'],
      },
      ward: 'Ward 06 - Avalapalli',
      zone: 'Zone Beta',
      severity: 'HIGH',
      status: 'RESOLVED',
      reporterId: sid._id,
      departmentId: departments['DRAINAGE']._id,
      slaHours: 12,
      createdAt: new Date(Date.now() - 18 * 3600 * 1000),
      deadline: new Date(Date.now() - 6 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 7 * 3600 * 1000),
      score: 80,
    },
    {
      incidentNumber: 'INC-2026-1040',
      category: 'DRAINAGE',
      title: 'Drainage Overflow near School',
      description: 'Blocked stormwater channel causing wastewater pooling near school gate.',
      location: {
        type: 'Point',
        coordinates: [77.8420, 12.7150], // 2.8km away
        address: 'Mathigiri Lake Inflow Channel, Ward 1, Hosur',
        nearbyLandmarks: ['Government High School Mathigiri'],
      },
      ward: 'Ward 01 - Mathigiri',
      zone: 'Zone Epsilon',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      reporterId: arun._id,
      departmentId: departments['DRAINAGE']._id,
      teamId: teams['Team Drain-01 (Stormwater)']._id,
      slaHours: 24,
      createdAt: new Date(Date.now() - 40 * 3600 * 1000),
      deadline: new Date(Date.now() - 16 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 18 * 3600 * 1000),
      score: 55,
    },
    {
      incidentNumber: 'INC-2026-1046',
      category: 'STREETLIGHT',
      title: 'Street Light Failure',
      description: 'Streetlight pole dark on residential pedestrian corner.',
      location: {
        type: 'Point',
        coordinates: [77.8080, 12.7510], // 3.2km away
        address: 'Mookandapalli 2nd Cross, Ward 3, Hosur',
        nearbyLandmarks: ['Mookandapalli Market'],
      },
      ward: 'Ward 03 - Mookandapalli',
      zone: 'Zone Delta',
      severity: 'LOW',
      status: 'CLOSED',
      reporterId: priya._id,
      departmentId: departments['ELECTRICAL']._id,
      slaHours: 48,
      createdAt: new Date(Date.now() - 60 * 3600 * 1000),
      deadline: new Date(Date.now() - 12 * 3600 * 1000),
      resolvedAt: new Date(Date.now() - 20 * 3600 * 1000),
      score: 28,
    },
    {
      incidentNumber: 'INC-2026-1052',
      category: 'DRAINAGE',
      title: 'Open Drain Hazard near Bus Stand',
      description: 'Heavy metal culvert grate missing, exposing a 6-foot deep drain trench.',
      location: {
        type: 'Point',
        coordinates: [77.8280, 12.7380], // 150m from Ward 12 center
        address: 'Terminal Outer Ring Road, Ward 12, Hosur',
        nearbyLandmarks: ['Central Bus Terminal North Gate'],
      },
      ward: 'Ward 12 - Central Hosur',
      zone: 'Zone Alpha',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      reporterId: miller._id,
      departmentId: departments['DRAINAGE']._id,
      teamId: teams['Team Drain-01 (Stormwater)']._id,
      slaHours: 4,
      createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      deadline: new Date(Date.now() + 3 * 3600 * 1000),
      score: 92,
    },
    {
      incidentNumber: 'INC-2026-1055',
      category: 'GARBAGE',
      title: 'Garbage Accumulation & Waste',
      description: 'Industrial waste bin overflowing with heavy plastic packing materials.',
      location: {
        type: 'Point',
        coordinates: [77.8120, 12.7562], // 3.1km away
        address: 'SIPCOT Phase 1 Main Access Road, Ward 4, Hosur',
        nearbyLandmarks: ['SIPCOT Truck Parking'],
      },
      ward: 'Ward 04 - Sipcot Phase 1',
      zone: 'Zone Gamma',
      severity: 'MEDIUM',
      status: 'ASSIGNED',
      reporterId: meera._id,
      departmentId: departments['SANITATION']._id,
      teamId: teams['Team Clean-02 (Sanitation)']._id,
      slaHours: 12,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      deadline: new Date(Date.now() + 8 * 3600 * 1000),
      score: 54,
    },
    {
      incidentNumber: 'INC-2026-1058',
      category: 'POTHOLE',
      title: 'Road Surface Subsidence',
      description: 'Tar sinkhole forming around stormwater manhole on Bagalur Road.',
      location: {
        type: 'Point',
        coordinates: [77.8360, 12.7435], // 1.3km away
        address: 'Bagalur Road Corridor, Sector 4, Ward 8, Hosur',
        nearbyLandmarks: ['Bagalur Junction Fuel Station'],
      },
      ward: 'Ward 08 - Bagalur Road Corridor',
      zone: 'Zone Beta',
      severity: 'HIGH',
      status: 'VERIFYING',
      reporterId: elena._id,
      departmentId: departments['ROADS']._id,
      teamId: teams['Team Alpha-01 (Road Repairs)']._id,
      slaHours: 24,
      createdAt: new Date(Date.now() - 18 * 3600 * 1000),
      deadline: new Date(Date.now() + 6 * 3600 * 1000),
      score: 76,
    },
    {
      incidentNumber: 'INC-2026-1061',
      category: 'STREETLIGHT',
      title: 'High Voltage Street Cable Sagging',
      description: 'Overhead electrical illumination cable snapped and hanging at 7 feet height.',
      location: {
        type: 'Point',
        coordinates: [77.8318, 12.7472], // 1.2km away
        address: 'Kamraj Nagar 1st Cross, Ward 11, Hosur',
        nearbyLandmarks: ['Kamraj Nagar Community Hall'],
      },
      ward: 'Ward 11 - Kamraj Nagar',
      zone: 'Zone Beta',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      reporterId: fatima._id,
      departmentId: departments['ELECTRICAL']._id,
      teamId: teams['Team Electrical-01 (Lighting)']._id,
      slaHours: 4,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      deadline: new Date(Date.now() + 3.25 * 3600 * 1000),
      score: 96,
    },
    {
      incidentNumber: 'INC-2026-1064',
      category: 'WATER_LEAK',
      title: 'Water Main Pipe Rupture',
      description: 'Major pipeline joint burst flooding industrial access driveway.',
      location: {
        type: 'Point',
        coordinates: [77.8165, 12.7225], // 2.0km away
        address: 'SIPCOT Industrial Road 2, Ward 5, Hosur',
        nearbyLandmarks: ['Sipcot Phase 2 Gate'],
      },
      ward: 'Ward 05 - SIPCOT Industrial Complex',
      zone: 'Zone Gamma',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      reporterId: david._id,
      departmentId: departments['WATER']._id,
      teamId: teams['Team Water-Fast (Main Rupture)']._id,
      slaHours: 4,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      deadline: new Date(Date.now() + 2 * 3600 * 1000),
      score: 94,
    },
    {
      incidentNumber: 'INC-2026-1076',
      category: 'DRAINAGE',
      title: 'Clogged Catch Basin at Railway Approach',
      description: 'Plastic waste and silt completely sealing rainwater drainage intake.',
      location: {
        type: 'Point',
        coordinates: [77.8340, 12.7315], // 950m away
        address: 'Railway Colony Station Road, Ward 2, Hosur',
        nearbyLandmarks: ['Hosur Goods Yard'],
      },
      ward: 'Ward 02 - Railway Colony',
      zone: 'Zone Delta',
      severity: 'MEDIUM',
      status: 'IN_PROGRESS',
      reporterId: vikram._id,
      departmentId: departments['DRAINAGE']._id,
      teamId: teams['Team Drain-01 (Stormwater)']._id,
      slaHours: 12,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000),
      deadline: new Date(Date.now() + 7 * 3600 * 1000),
      score: 60,
    },
    {
      incidentNumber: 'INC-2026-1079',
      category: 'ILLEGAL_DUMPING',
      title: 'Construction Debris Dumping',
      description: 'Concrete slabs and brick rubble dumped on roadside green verge.',
      location: {
        type: 'Point',
        coordinates: [77.8115, 12.7540], // 3.0km away
        address: 'Near Sipcot Substation, Ward 4, Hosur',
        nearbyLandmarks: ['SIPCOT Substation'],
      },
      ward: 'Ward 04 - Sipcot Phase 1',
      zone: 'Zone Gamma',
      severity: 'HIGH',
      status: 'ANALYZING',
      reporterId: meera._id,
      departmentId: departments['SANITATION']._id,
      slaHours: 8,
      createdAt: new Date(Date.now() - 2.5 * 3600 * 1000),
      deadline: new Date(Date.now() + 5.5 * 3600 * 1000),
      score: 68,
    },
  ];

  for (const spec of incidentSeedSpecs) {
    // 1. Create or Find Linked Report
    let report = await ReportModel.findOne({ description: spec.description });
    if (!report) {
      report = await ReportModel.create({
        reporterId: spec.reporterId,
        description: spec.description,
        categoryHint: spec.category,
        location: spec.location,
        source: 'WEB_PORTAL',
        status: 'LINKED',
        submittedAt: spec.createdAt,
      });
    }

    // 2. Upsert Incident
    let incident = await IncidentModel.findOne({ incidentNumber: spec.incidentNumber });
    const incidentData: any = {
      incidentNumber: spec.incidentNumber,
      category: spec.category,
      description: spec.description,
      location: spec.location,
      ward: spec.ward,
      zone: spec.zone,
      severity: spec.severity,
      severityReasoning: {
        level: spec.severity,
        score: spec.score,
        factors: ['Automated Multimodal Vision assessment', 'Municipal road density weighting'],
        explanation: spec.description,
        calculatedAt: spec.createdAt,
        calculatedBy: 'AGENT_SEVERITY',
      },
      status: spec.status,
      reportIds: [report._id],
      reporterId: spec.reporterId,
      departmentId: spec.departmentId,
      teamId: spec.teamId,
      assignedOfficerId: spec.assignedOfficerId,
      sla: {
        targetHours: spec.slaHours,
        deadline: spec.deadline,
        isOverdue: spec.deadline.getTime() < Date.now() && spec.status !== 'RESOLVED' && spec.status !== 'CLOSED',
        escalated: spec.severity === 'CRITICAL',
      },
      operationalFlags: spec.severity === 'CRITICAL' ? ['ATTENTION_REQUIRED'] : [],
      firstReportedAt: spec.createdAt,
      lastReportedAt: spec.createdAt,
      resolvedAt: (spec as any).resolvedAt,
      closedAt: spec.status === 'CLOSED' ? new Date(spec.createdAt.getTime() + 86400000) : undefined,
      reopenCount: 0,
      createdAt: spec.createdAt,
      updatedAt: (spec as any).resolvedAt || spec.createdAt,
    };

    if (!incident) {
      incident = await IncidentModel.create(incidentData);
    } else {
      await IncidentModel.updateOne({ _id: incident._id }, { $set: incidentData });
    }

    // Link report to incident
    await ReportModel.updateOne({ _id: report._id }, { $set: { incidentId: incident._id } });

    // 3. Upsert Timeline Events
    const existingEventsCount = await IncidentEventModel.countDocuments({ incidentId: incident._id });
    if (existingEventsCount === 0) {
      await IncidentEventModel.create([
        {
          incidentId: incident._id,
          type: 'INCIDENT_CREATED',
          actorType: 'CITIZEN',
          actorId: spec.reporterId.toString(),
          toStatus: 'SUBMITTED',
          description: `Civic report submitted: ${spec.title}`,
          timestamp: spec.createdAt,
        },
        {
          incidentId: incident._id,
          type: 'SEVERITY_UPDATED',
          actorType: 'AI_AGENT',
          actorId: 'AGENT_SEVERITY',
          description: `AI Vision Agent evaluated severity as ${spec.severity} (Score ${spec.score}/100)`,
          timestamp: new Date(spec.createdAt.getTime() + 5000),
        },
        {
          incidentId: incident._id,
          type: 'DEPARTMENT_ASSIGNED',
          actorType: 'AI_AGENT',
          actorId: 'AGENT_ROUTING',
          toStatus: spec.status,
          description: `Dispatched to municipal department with ${spec.slaHours}h SLA target`,
          timestamp: new Date(spec.createdAt.getTime() + 15000),
        },
      ]);
    }

    // 4. Upsert Notifications for citizen
    const existingNotifCount = await NotificationModel.countDocuments({ incidentId: incident._id });
    if (existingNotifCount === 0) {
      await NotificationModel.create([
        {
          recipientId: spec.reporterId,
          incidentId: incident._id,
          type: 'INFO',
          channel: 'IN_APP',
          title: `Update on ${spec.incidentNumber}`,
          body: `Your report for ${spec.title} in ${spec.ward} is currently ${spec.status}.`,
          readAt: spec.status === 'RESOLVED' || spec.status === 'CLOSED' ? new Date() : undefined,
          createdAt: spec.createdAt,
        },
      ]);
    }
  }

  logger.info('CivicPulse Civic Demo Seeding completed successfully!');
}

// Standalone execution support
if (process.argv[1]?.endsWith('seedCivicDemo.ts') || process.argv[1]?.endsWith('seedCivicDemo.js')) {
  connectDatabase()
    .then(() => seedCivicDemo())
    .then(() => {
      logger.info('Civic demo seed complete. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Failed to seed civic demo:', err);
      process.exit(1);
    });
}
