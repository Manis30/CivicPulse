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
  AgentExecutionModel,
  NotificationModel,
  AuditLogModel,
  AIPolicyModel,
} from '../models/index.js';
import { logger } from '../utils/logger.js';
import { connectDatabase } from '../config/database.js';

export async function seedDatabase(dropExisting = false) {
  logger.info('Starting Phase 2 Database Seeding...');

  if (dropExisting) {
    logger.warn('Clearing existing collections for fresh seed...');
    await Promise.all([
      UserModel.deleteMany({}),
      DepartmentModel.deleteMany({}),
      TeamModel.deleteMany({}),
      ReportModel.deleteMany({}),
      IncidentModel.deleteMany({}),
      EvidenceModel.deleteMany({}),
      WorkOrderModel.deleteMany({}),
      IncidentEventModel.deleteMany({}),
      AgentExecutionModel.deleteMany({}),
      NotificationModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      AIPolicyModel.deleteMany({}),
    ]);
  }

  // 1. Seed Departments
  logger.info('Seeding Departments...');
  const departments = await DepartmentModel.create([
    {
      name: 'Department of Transport & Roads',
      code: 'ROADS',
      description: 'Responsible for road pavement, potholes, sidewalk repairs, and traffic signals.',
      categories: ['POTHOLE', 'ROAD_DAMAGE'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 },
      isActive: true,
    },
    {
      name: 'Water Supply & Sewerage Board',
      code: 'WATER',
      description: 'Potable water pipelines, distribution mains, and hydrant operations.',
      categories: ['WATER_LEAK'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 2 },
      isActive: true,
    },
    {
      name: 'Municipal Sanitation & Waste',
      code: 'SANITATION',
      description: 'Solid waste management, garbage container collection, and anti-dumping enforcement.',
      categories: ['GARBAGE', 'ILLEGAL_DUMPING'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 12, CRITICAL: 6 },
      isActive: true,
    },
    {
      name: 'Bureau of Street Lighting & Power',
      code: 'ELECTRICAL',
      description: 'Public illumination, dark spot elimination, and wiring safety.',
      categories: ['STREETLIGHT'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 8 },
      isActive: true,
    },
    {
      name: 'Stormwater & Drainage Authority',
      code: 'DRAINAGE',
      description: 'Stormwater culverts, flood runoff channels, and catch basins.',
      categories: ['DRAINAGE'],
      wardIds: ['Ward 1 - Mathigiri', 'Ward 2 - Railway Colony', 'Ward 3 - Mookandapalli', 'Ward 4 - Sipcot Phase 1', 'Ward 5 - Industrial Complex', 'Ward 6 - Avalapalli', 'Ward 7 - Zuzuvadi', 'Ward 8 - Bagalur Road', 'Ward 12 - Central Hosur'],
      slaPolicies: { LOW: 48, MEDIUM: 24, HIGH: 8, CRITICAL: 2 },
      isActive: true,
    },
  ]);

  const deptRoads = departments.find((d: any) => d.code === 'ROADS')!;
  const deptWater = departments.find((d: any) => d.code === 'WATER')!;
  const deptSanitation = departments.find((d: any) => d.code === 'SANITATION')!;

  // 2. Seed Users
  logger.info('Seeding Users with authentic bcrypt password hashes...');
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);
  const users = await UserModel.create([
    {
      name: 'Elena Rostova',
      email: 'citizen.elena@civicpulse.org',
      phone: '+1 (555) 019-2831',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'EMAIL'],
        alertOnCritical: true,
        weeklyDigest: false,
      },
    },
    {
      name: 'David Kim',
      email: 'citizen.david@civicpulse.org',
      phone: '+1 (555) 019-8877',
      passwordHash: defaultPasswordHash,
      role: 'CITIZEN',
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP'],
        alertOnCritical: true,
        weeklyDigest: false,
      },
    },
    {
      name: 'Officer Marcus Vance',
      email: 'officer.vance@civicpulse.org',
      phone: '+1 (555) 014-9922',
      passwordHash: defaultPasswordHash,
      role: 'FIELD_OFFICER',
      departmentId: deptRoads._id,
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'SMS'],
        alertOnCritical: true,
        weeklyDigest: false,
      },
    },
    {
      name: 'Officer Sarah Jenkins',
      email: 'officer.jenkins@civicpulse.org',
      phone: '+1 (555) 014-7733',
      passwordHash: defaultPasswordHash,
      role: 'FIELD_OFFICER',
      departmentId: deptWater._id,
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'SMS'],
        alertOnCritical: true,
        weeklyDigest: false,
      },
    },
    {
      name: 'Dr. Sarah Chen',
      email: 'manager.chen@civicpulse.org',
      phone: '+1 (555) 018-4411',
      passwordHash: defaultPasswordHash,
      role: 'DEPARTMENT_MANAGER',
      departmentId: deptRoads._id,
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'EMAIL'],
        alertOnCritical: true,
        weeklyDigest: true,
      },
    },
    {
      name: 'Chief Architect Miller',
      email: 'admin.miller@civicpulse.org',
      phone: '+1 (555) 010-0001',
      passwordHash: defaultPasswordHash,
      role: 'PLATFORM_ADMIN',
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'EMAIL', 'SMS'],
        alertOnCritical: true,
        weeklyDigest: true,
      },
    },
    {
      name: 'Field Officer Default',
      email: 'officer@civicpulse.org',
      phone: '+1 (555) 014-9900',
      passwordHash: defaultPasswordHash,
      role: 'FIELD_OFFICER',
      departmentId: deptRoads._id,
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'SMS'],
        alertOnCritical: true,
        weeklyDigest: false,
      },
    },
    {
      name: 'Department Manager Default',
      email: 'manager@civicpulse.org',
      phone: '+1 (555) 018-4400',
      passwordHash: defaultPasswordHash,
      role: 'DEPARTMENT_MANAGER',
      departmentId: deptRoads._id,
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'EMAIL'],
        alertOnCritical: true,
        weeklyDigest: true,
      },
    },
    {
      name: 'Platform Administrator Default',
      email: 'admin@civicpulse.org',
      phone: '+1 (555) 010-0000',
      passwordHash: defaultPasswordHash,
      role: 'PLATFORM_ADMIN',
      isActive: true,
      notificationPreferences: {
        channels: ['IN_APP', 'EMAIL', 'SMS'],
        alertOnCritical: true,
        weeklyDigest: true,
      },
    },
  ]);

  const citizenElena = users.find((u: any) => u.email === 'citizen.elena@civicpulse.org')!;
  const citizenDavid = users.find((u: any) => u.email === 'citizen.david@civicpulse.org')!;
  const officerVance = users.find((u: any) => u.email === 'officer.vance@civicpulse.org')!;
  const officerJenkins = users.find((u: any) => u.email === 'officer.jenkins@civicpulse.org')!;
  const officerDefault = users.find((u: any) => u.email === 'officer@civicpulse.org')!;

  // 3. Seed Teams (with GeoJSON 2dsphere coordinates)
  logger.info('Seeding Teams...');
  const teams = await TeamModel.create([
    {
      name: 'Team Alpha-01 (Roads Rapid)',
      departmentId: deptRoads._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 8 - Bagalur Road', 'Ward 5 - Industrial Complex'],
      specializations: ['Asphalt patching', 'Emergency pothole containment'],
      officerIds: [officerVance._id, officerDefault._id],
      capacity: 6,
      activeWorkload: 2,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8285, 12.7375], // [lng, lat] Bagalur Road, Central Hosur
        address: 'Bagalur Road Rapid Transit Depot, Hosur',
      },
      shift: 'MORNING',
      isActive: true,
    },
    {
      name: 'Team Water-Fast (Main Rupture)',
      departmentId: deptWater._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 4 - Sipcot Phase 1', 'Ward 2 - Railway Colony'],
      specializations: ['High-pressure water main isolation', 'Trench shoring'],
      officerIds: [officerJenkins._id],
      capacity: 4,
      activeWorkload: 1,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8320, 12.7410], // [lng, lat] Central Hosur Water Station
        address: 'Central Hosur Water Utility Substation',
      },
      shift: 'MORNING',
      isActive: true,
    },
    {
      name: 'Team Clean-02 (Sanitation)',
      departmentId: deptSanitation._id,
      wardIds: ['Ward 12 - Central Hosur', 'Ward 1 - Mathigiri', 'Ward 5 - Industrial Complex'],
      specializations: ['Heavy dumpster hauling', 'Bulk debris compaction'],
      officerIds: [],
      capacity: 4,
      activeWorkload: 0,
      availabilityStatus: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.8190, 12.7290], // [lng, lat]
        address: 'Sipcot Industrial Logistics Depot, Hosur',
      },
      shift: 'EVENING',
      isActive: true,
    },
  ]);

  const teamRoads = teams.find((t: any) => t.name.includes('Roads'))!;
  const teamWater = teams.find((t: any) => t.name.includes('Water'))!;

  // 4. Seed Reports (with GeoJSON)
  logger.info('Seeding Reports...');
  const reports = await ReportModel.create([
    {
      reporterId: citizenElena._id,
      description: 'Severe water leak flooding the pedestrian sidewalk outside 350 5th Ave.',
      categoryHint: 'WATER_LEAK',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7484], // [lng, lat]
        address: '350 5th Ave, Midtown Corridor',
      },
      source: 'WEB_PORTAL',
      status: 'LINKED',
      submittedAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      reporterId: citizenDavid._id,
      description: 'Gushing water main bursting near medical entrance at 350 5th Ave.',
      categoryHint: 'WATER_LEAK',
      location: {
        type: 'Point',
        coordinates: [-73.9852, 40.7485], // [lng, lat] within 20 meters (duplicate)
        address: '352 5th Ave, Midtown Corridor',
      },
      source: 'MOBILE_APP',
      status: 'LINKED',
      submittedAt: new Date(Date.now() - 3600000 * 3.5),
    },
    {
      reporterId: citizenElena._id,
      description: 'Large crater pothole on Lexington Ave damaging vehicle suspension.',
      categoryHint: 'POTHOLE',
      location: {
        type: 'Point',
        coordinates: [-73.9721, 40.7612], // [lng, lat]
        address: '742 Lexington Ave, North Commercial',
      },
      source: 'WEB_PORTAL',
      status: 'LINKED',
      submittedAt: new Date(Date.now() - 3600000 * 18),
    },
    {
      reporterId: citizenDavid._id,
      description: 'Overflowing commercial dumpster blocking alley pedestrian access.',
      categoryHint: 'GARBAGE',
      location: {
        type: 'Point',
        coordinates: [-73.9912, 40.7308], // [lng, lat]
        address: '124 Mercer St, Historic District',
      },
      source: 'MOBILE_APP',
      status: 'LINKED',
      submittedAt: new Date(Date.now() - 3600000 * 26),
    },
  ]);

  const reportWater1 = reports[0];
  const reportWater2 = reports[1];
  const reportPothole = reports[2];
  const reportGarbage = reports[3];

  // 5. Seed Incidents (with valid state transitions & GeoJSON)
  logger.info('Seeding Incidents...');
  const incidents = await IncidentModel.create([
    {
      incidentNumber: 'INC-2026-1048',
      category: 'WATER_LEAK',
      description: 'Critical water main rupture threatening medical facility supply and arterial roadway integrity.',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7484], // [lng, lat]
        address: '350 5th Ave, Midtown Corridor',
        nearbyLandmarks: ['Central Hospital', 'Transit Hub'],
      },
      ward: 'Ward 4 - Midtown',
      zone: 'Zone Alpha',
      severity: 'CRITICAL',
      severityReasoning: {
        level: 'CRITICAL',
        score: 94,
        factors: [
          'High water flow rate adjacent to medical center',
          'Sub-surface structural erosion hazard detected',
          'Duplicate citizen reports confirmed within 50m radius',
        ],
        explanation: 'Critical water main rupture threatening medical facility supply and arterial roadway integrity.',
        calculatedAt: new Date(Date.now() - 3600000 * 3.8),
        calculatedBy: 'AGENT_SEVERITY',
      },
      status: 'IN_PROGRESS',
      reportIds: [reportWater1._id, reportWater2._id],
      departmentId: deptWater._id,
      teamId: teamWater._id,
      assignedOfficerId: officerJenkins._id,
      sla: {
        targetHours: 4,
        deadline: new Date(Date.now() + 3600000 * 0.5),
        isOverdue: false,
        escalated: true,
      },
      operationalFlags: ['ATTENTION_REQUIRED'],
      firstReportedAt: new Date(Date.now() - 3600000 * 4),
      lastReportedAt: new Date(Date.now() - 3600000 * 3.5),
      reopenCount: 0,
    },
    {
      incidentNumber: 'INC-2026-1049',
      category: 'POTHOLE',
      description: 'Deep pavement cavity in central driving lane on Lexington Ave.',
      location: {
        type: 'Point',
        coordinates: [-73.9721, 40.7612], // [lng, lat]
        address: '742 Lexington Ave, North Commercial',
        nearbyLandmarks: ['Elementary School #14'],
      },
      ward: 'Ward 7 - Uptown',
      zone: 'Zone Gamma',
      severity: 'HIGH',
      severityReasoning: {
        level: 'HIGH',
        score: 78,
        factors: ['Located in school zone with heavy bus traffic', 'Tire puncture hazard'],
        explanation: 'Deep cavity in high-volume traffic artery requiring standard hot-mix asphalt patching.',
        calculatedAt: new Date(Date.now() - 3600000 * 17.5),
        calculatedBy: 'AGENT_SEVERITY',
      },
      status: 'ASSIGNED',
      reportIds: [reportPothole._id],
      departmentId: deptRoads._id,
      teamId: teamRoads._id,
      assignedOfficerId: officerVance._id,
      sla: {
        targetHours: 24,
        deadline: new Date(Date.now() + 3600000 * 6),
        isOverdue: false,
        escalated: false,
      },
      operationalFlags: [],
      firstReportedAt: new Date(Date.now() - 3600000 * 18),
      lastReportedAt: new Date(Date.now() - 3600000 * 18),
      reopenCount: 0,
    },
    {
      incidentNumber: 'INC-2026-1050',
      category: 'GARBAGE',
      description: 'Overflowing commercial waste containers in alleyway.',
      location: {
        type: 'Point',
        coordinates: [-73.9912, 40.7308], // [lng, lat]
        address: '124 Mercer St, Historic District',
      },
      ward: 'Ward 2 - Downtown',
      zone: 'Zone Beta',
      severity: 'MEDIUM',
      status: 'REOPENED',
      reportIds: [reportGarbage._id],
      departmentId: deptSanitation._id,
      sla: {
        targetHours: 12,
        deadline: new Date(Date.now() - 3600000 * 2), // Overdue
        isOverdue: true,
        escalated: false,
        breachedAt: new Date(Date.now() - 3600000 * 2),
      },
      operationalFlags: ['SLA_BREACH', 'ATTENTION_REQUIRED'],
      firstReportedAt: new Date(Date.now() - 3600000 * 26),
      lastReportedAt: new Date(Date.now() - 3600000 * 2),
      reopenedAt: new Date(Date.now() - 3600000 * 1),
      reopenCount: 1,
    },
  ]);

  const incWater = incidents[0];
  const incPothole = incidents[1];
  const incGarbage = incidents[2];

  // 6. Seed Evidence
  logger.info('Seeding Evidence...');
  const evidences = await EvidenceModel.create([
    {
      incidentId: incWater._id,
      reportId: reportWater1._id,
      uploadedBy: citizenElena._id,
      type: 'BEFORE',
      fileUrl: '/mock/evidence_water_before.jpg',
      mimeType: 'image/jpeg',
      metadata: { width: 1920, height: 1080, sizeBytes: 2450000 },
      source: 'CITIZEN',
      aiAnalysis: {
        labels: ['water leak', 'ruptured asphalt', 'sidewalk flooding'],
        confidence: 0.96,
        quality: 'HIGH',
        observations: ['Active liquid flow visible', 'Hazardous pedestrian walking path'],
      },
      capturedAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      incidentId: incPothole._id,
      reportId: reportPothole._id,
      uploadedBy: citizenElena._id,
      type: 'BEFORE',
      fileUrl: '/mock/evidence_pothole_before.jpg',
      mimeType: 'image/jpeg',
      source: 'CITIZEN',
      aiAnalysis: {
        labels: ['pothole', 'road defect', 'asphalt damage'],
        confidence: 0.92,
        quality: 'GOOD',
        observations: ['Roughly 60cm diameter', 'Depth approximately 10cm'],
      },
      capturedAt: new Date(Date.now() - 3600000 * 18),
    },
    {
      incidentId: incGarbage._id,
      reportId: reportGarbage._id,
      uploadedBy: citizenDavid._id,
      type: 'BEFORE',
      fileUrl: '/mock/evidence_garbage_before.jpg',
      mimeType: 'image/jpeg',
      source: 'CITIZEN',
      capturedAt: new Date(Date.now() - 3600000 * 26),
    },
  ]);

  // Update incidents with evidence references
  await IncidentModel.updateOne({ _id: incWater._id }, { evidenceIds: [evidences[0]._id] });
  await IncidentModel.updateOne({ _id: incPothole._id }, { evidenceIds: [evidences[1]._id] });
  await IncidentModel.updateOne({ _id: incGarbage._id }, { evidenceIds: [evidences[2]._id] });

  // 7. Seed WorkOrders
  logger.info('Seeding Work Orders...');
  const workOrders = await WorkOrderModel.create([
    {
      workOrderNumber: 'WO-2026-4091',
      incidentId: incWater._id,
      departmentId: deptWater._id,
      teamId: teamWater._id,
      assignedOfficerId: officerJenkins._id,
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      sla: {
        startedAt: new Date(Date.now() - 3600000 * 2),
        deadlineAt: new Date(Date.now() + 3600000 * 1),
        targetHours: 4,
      },
      checklist: [
        { item: 'Isolate municipal water main gate valve', completed: true },
        { item: 'Excavate damaged pipe section and pump water', completed: true },
        { item: 'Install CIPP or mechanical joint clamp', completed: false },
        { item: 'Upload mandatory AFTER verification photograph', completed: false },
      ],
      beforeEvidenceIds: [evidences[0]._id],
      startedAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      workOrderNumber: 'WO-2026-4092',
      incidentId: incPothole._id,
      departmentId: deptRoads._id,
      teamId: teamRoads._id,
      assignedOfficerId: officerVance._id,
      priority: 'HIGH',
      status: 'ASSIGNED',
      sla: {
        startedAt: new Date(Date.now() - 3600000 * 1),
        deadlineAt: new Date(Date.now() + 3600000 * 6),
        targetHours: 24,
      },
      checklist: [
        { item: 'Deploy warning cones and traffic flagger', completed: false },
        { item: 'Clean and square edge of road defect', completed: false },
        { item: 'Tack coat and compact asphalt hot mix', completed: false },
        { item: 'Upload AFTER verification photo', completed: false },
      ],
      beforeEvidenceIds: [evidences[1]._id],
    },
  ]);

  await IncidentModel.updateOne({ _id: incWater._id }, { workOrderId: workOrders[0]._id });
  await IncidentModel.updateOne({ _id: incPothole._id }, { workOrderId: workOrders[1]._id });

  // 8. Seed IncidentEvents (Timeline History)
  logger.info('Seeding Incident Events Timeline...');
  await IncidentEventModel.create([
    {
      incidentId: incWater._id,
      type: 'INCIDENT_CREATED',
      actorType: 'CITIZEN',
      actorId: citizenElena.id,
      toStatus: 'SUBMITTED',
      description: 'Incident submitted by citizen with photo evidence.',
      timestamp: new Date(Date.now() - 3600000 * 4),
    },
    {
      incidentId: incWater._id,
      type: 'STATE_CHANGED',
      actorType: 'AI_AGENT',
      actorId: 'AGENT_VISION',
      fromStatus: 'SUBMITTED',
      toStatus: 'ANALYZING',
      description: 'Vision Agent began multimodal image inspection.',
      timestamp: new Date(Date.now() - 3600000 * 3.9),
    },
    {
      incidentId: incWater._id,
      type: 'SEVERITY_UPDATED',
      actorType: 'AI_AGENT',
      actorId: 'AGENT_SEVERITY',
      fromStatus: 'ANALYZING',
      toStatus: 'VALIDATED',
      description: 'Severity evaluated as CRITICAL (Score: 94) due to hospital proximity.',
      timestamp: new Date(Date.now() - 3600000 * 3.8),
    },
    {
      incidentId: incWater._id,
      type: 'DEPARTMENT_ASSIGNED',
      actorType: 'AI_AGENT',
      actorId: 'AGENT_ROUTING',
      fromStatus: 'VALIDATED',
      toStatus: 'ASSIGNED',
      description: 'Routed to Water Supply & Sewerage Board (Team Water-Fast).',
      timestamp: new Date(Date.now() - 3600000 * 3.5),
    },
    {
      incidentId: incWater._id,
      type: 'WORK_STARTED',
      actorType: 'FIELD_OFFICER',
      actorId: officerJenkins.id,
      fromStatus: 'ASSIGNED',
      toStatus: 'IN_PROGRESS',
      description: 'Field officer arrived on scene. Work order WO-2026-4091 marked in progress.',
      timestamp: new Date(Date.now() - 3600000 * 2),
    },
  ]);

  // 9. Seed AgentExecutions (AI Trace Ledger)
  logger.info('Seeding Agent Execution Traces...');
  await AgentExecutionModel.create([
    {
      executionId: 'EXEC-2026-9812',
      agentId: 'AGENT_VISION',
      agentName: 'Vision Agent',
      executionMode: 'DETERMINISTIC_ENGINE',
      incidentId: incWater._id,
      toolsCalled: [
        {
          toolName: 'analyzeImage',
          input: { fileUrl: '/mock/evidence_water_before.jpg' },
          output: { category: 'WATER_LEAK', confidence: 0.96 },
          durationMs: 42,
          success: true,
        },
      ],
      reasoning: 'Extracted edge gradients and water pooling reflections.',
      durationMs: 42,
      status: 'SUCCESS',
      retryCount: 0,
      timestamp: new Date(Date.now() - 3600000 * 3.9),
    },
    {
      executionId: 'EXEC-2026-9813',
      agentId: 'AGENT_DUPLICATE',
      agentName: 'Duplicate Detection Agent',
      executionMode: 'DETERMINISTIC_ENGINE',
      incidentId: incWater._id,
      toolsCalled: [
        {
          toolName: 'searchNearbyIncidents',
          input: { coordinates: [-73.9851, 40.7484], radiusMeters: 150 },
          output: { matchCount: 1, primaryIncidentId: incWater.id },
          durationMs: 18,
          success: true,
        },
      ],
      reasoning: 'Matched report REP-2026-8922 within 20m radius and similar description.',
      durationMs: 18,
      status: 'SUCCESS',
      retryCount: 0,
      timestamp: new Date(Date.now() - 3600000 * 3.7),
    },
    {
      executionId: 'EXEC-2026-9814',
      agentId: 'AGENT_SEVERITY',
      agentName: 'Severity Agent',
      executionMode: 'DETERMINISTIC_ENGINE',
      incidentId: incWater._id,
      toolsCalled: [
        {
          toolName: 'calculateSeverityRisk',
          input: { category: 'WATER_LEAK', sensitiveLandmarks: ['Central Hospital'] },
          output: { score: 94, level: 'CRITICAL' },
          durationMs: 25,
          success: true,
        },
      ],
      reasoning: 'Traffic arterial + medical critical water supply threat.',
      durationMs: 25,
      status: 'SUCCESS',
      retryCount: 0,
      timestamp: new Date(Date.now() - 3600000 * 3.6),
    },
  ]);

  // 10. Seed Notifications
  logger.info('Seeding Notifications...');
  await NotificationModel.create([
    {
      recipientId: citizenElena._id,
      incidentId: incWater._id,
      type: 'INFO',
      channel: 'IN_APP',
      title: 'Water Leak Report Ingested',
      body: 'Your civic report for 350 5th Ave has been assigned to Water Supply & Sewerage Board with target SLA of 4 hours.',
      createdAt: new Date(Date.now() - 3600000 * 3.5),
    },
    {
      recipientId: officerJenkins._id,
      incidentId: incWater._id,
      type: 'ACTION_REQUIRED',
      channel: 'SMS',
      title: 'CRITICAL DISPATCH: Water Main Rupture',
      body: 'Immediate response required at 350 5th Ave. Work Order WO-2026-4091.',
      createdAt: new Date(Date.now() - 3600000 * 3.4),
    },
  ]);

  // 11. Seed AuditLogs (Append-Only)
  logger.info('Seeding Audit Logs...');
  await AuditLogModel.create([
    {
      actorType: 'USER',
      actorId: citizenElena.id,
      action: 'REPORT_SUBMITTED',
      resourceType: 'REPORT',
      resourceId: reportWater1.id,
      after: { category: 'WATER_LEAK', coordinates: [-73.9851, 40.7484] },
      timestamp: new Date(Date.now() - 3600000 * 4),
    },
    {
      actorType: 'AI_AGENT',
      actorId: 'AGENT_ROUTING',
      action: 'TEAM_ASSIGNED',
      resourceType: 'INCIDENT',
      resourceId: incWater.id,
      before: { teamId: null },
      after: { teamId: teamWater.id, departmentId: deptWater.id },
      timestamp: new Date(Date.now() - 3600000 * 3.5),
    },
  ]);

  // 12. Seed AIPolicies (Versioned persistent models)
  logger.info('Seeding AI Policies...');
  await AIPolicyModel.create([
    {
      name: 'Default Duplicate Search Policy',
      version: 1,
      category: 'duplicateDetection',
      agentId: 'AGENT_DUPLICATE',
      description: 'Defines 2dsphere spatial radius and TF-IDF text similarity cutoffs for linking reports.',
      rules: {
        geoRadiusMeters: {
          ruleKey: 'geoRadiusMeters',
          description: 'Maximum spatial distance to consider duplicate reports',
          value: 150,
          type: 'number',
          editable: true,
        },
        textSimilarityThreshold: {
          ruleKey: 'textSimilarityThreshold',
          description: 'TF-IDF cosine similarity required to link report descriptions',
          value: 0.72,
          type: 'number',
          editable: true,
        },
      },
      isActive: true,
      history: [],
    },
    {
      name: 'Resolution Verification & Auto-Reopen Policy',
      version: 1,
      category: 'autoReopenRules',
      agentId: 'AGENT_VERIFICATION',
      description: 'Thresholds governing autonomous incident closure vs automatic reopen trigger.',
      rules: {
        autoReopenConfidenceThreshold: {
          ruleKey: 'autoReopenConfidenceThreshold',
          description: 'Confidence below this threshold in after-photo verification triggers automatic reopening',
          value: 0.7,
          type: 'number',
          editable: true,
        },
        maxRetryAttempts: {
          ruleKey: 'maxRetryAttempts',
          description: 'Backoff retry attempts for agent tool invocations before fallback',
          value: 3,
          type: 'number',
          editable: true,
        },
      },
      isActive: true,
      history: [],
    },
  ]);

  logger.info('Phase 2 Database Seeding completed successfully!');
}

// Standalone execution support
if (process.argv[1]?.endsWith('seedDatabase.ts') || process.argv[1]?.endsWith('seedDatabase.js')) {
  connectDatabase()
    .then(() => seedDatabase(true))
    .then(() => {
      logger.info('Database seed complete. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Failed to seed database:', err);
      process.exit(1);
    });
}
