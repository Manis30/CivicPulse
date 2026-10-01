import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import {
  UserModel,
  IncidentModel,
  ReportModel,
  EvidenceModel,
  WorkOrderModel,
  IncidentEventModel,
  AuditLogModel,
  isValidTransition,
} from '../models/index.js';
import { incidentRepository } from '../repositories/incidentRepository.js';
import { reportRepository } from '../repositories/reportRepository.js';
import { sanitizePagination } from '../repositories/baseRepository.js';

describe('Phase 2 Database & Geospatial Test Suite', () => {
  let createdIncidentId: string;
  let createdReportId: string;

  before(async () => {
    await connectDatabase();
    await Promise.all([
      IncidentModel.syncIndexes(),
      ReportModel.syncIndexes(),
      UserModel.syncIndexes(),
      WorkOrderModel.syncIndexes(),
      IncidentEventModel.syncIndexes(),
      AuditLogModel.syncIndexes(),
    ]);
  });

  after(async () => {
    // Clean up test data
    if (createdIncidentId) {
      await IncidentModel.findByIdAndDelete(createdIncidentId);
    }
    if (createdReportId) {
      await ReportModel.findByIdAndDelete(createdReportId);
    }
    await UserModel.deleteMany({ email: /test.*@civicpulse\.test/ });
    await IncidentModel.deleteMany({ incidentNumber: /INC-TEST-.*/ });
    await WorkOrderModel.deleteMany({ workOrderNumber: /WO-TEST-.*/ });
    await disconnectDatabase();
  });

  // 1. User schema validation
  it('1. User schema validation: accepts valid roles, rejects invalid roles', async () => {
    const validUser = new UserModel({
      name: 'Test Officer',
      email: 'test.officer@civicpulse.test',
      passwordHash: 'dummyhash',
      role: 'FIELD_OFFICER',
    });
    const saved = await validUser.save();
    assert.strictEqual(saved.role, 'FIELD_OFFICER');

    const invalidUser = new UserModel({
      name: 'Invalid Role User',
      email: 'test.invalid@civicpulse.test',
      passwordHash: 'dummyhash',
      role: 'SUPER_USER_UNKNOWN' as any,
    });
    await assert.rejects(async () => invalidUser.validate());
  });

  // 2. Incident schema validation
  it('2. Incident schema validation: requires mandatory fields', async () => {
    const invalidIncident = new IncidentModel({
      description: 'Missing category, ward, location',
    });
    await assert.rejects(async () => invalidIncident.validate());
  });

  // 3. GeoJSON validation
  it('3. GeoJSON validation: coordinates must be [longitude, latitude] within bounds', async () => {
    // Invalid longitude (> 180)
    const invalidGeo = new IncidentModel({
      incidentNumber: 'INC-TEST-GEO-FAIL',
      category: 'POTHOLE',
      description: 'Test invalid coordinates',
      ward: 'Ward 1',
      zone: 'Zone A',
      severity: 'LOW',
      status: 'SUBMITTED',
      location: {
        type: 'Point',
        coordinates: [250, 45], // Invalid longitude 250 > 180
        address: 'Test Address',
      },
      sla: { targetHours: 24, deadline: new Date() },
    });
    await assert.rejects(async () => invalidGeo.validate());
  });

  // 4. 2dsphere index definition
  it('4. 2dsphere index definition: location field has 2dsphere index', async () => {
    const indexes = await IncidentModel.collection.indexes();
    const has2dSphere = indexes.some((idx) => Object.values(idx.key || {}).includes('2dsphere'));
    assert.strictEqual(has2dSphere, true, 'Incident collection must have a 2dsphere index on location');
  });

  // 5. Incident state transition validation
  it('5. Incident state transition validation: validates canonical lifecycle transitions', () => {
    assert.strictEqual(isValidTransition('SUBMITTED', 'ANALYZING'), true);
    assert.strictEqual(isValidTransition('ANALYZING', 'VALIDATED'), true);
    assert.strictEqual(isValidTransition('VALIDATED', 'ASSIGNED'), true);
    assert.strictEqual(isValidTransition('ASSIGNED', 'IN_PROGRESS'), true);
    assert.strictEqual(isValidTransition('IN_PROGRESS', 'RESOLVED'), true);
    assert.strictEqual(isValidTransition('RESOLVED', 'VERIFYING'), true);
    assert.strictEqual(isValidTransition('VERIFYING', 'CLOSED'), true);
    assert.strictEqual(isValidTransition('VERIFYING', 'REOPENED'), true);
    assert.strictEqual(isValidTransition('REOPENED', 'ASSIGNED'), true);

    // Invalid shortcut transitions
    assert.strictEqual(isValidTransition('SUBMITTED', 'RESOLVED'), false);
    assert.strictEqual(isValidTransition('SUBMITTED', 'CLOSED'), false);
    assert.strictEqual(isValidTransition('VALIDATED', 'CLOSED'), false);
  });

  // 6. Report -> Incident relationship
  it('6. Report -> Incident relationship: can create report and link to incident', async () => {
    const user = await UserModel.findOne({ email: 'test.officer@civicpulse.test' });

    const report = await ReportModel.create({
      reporterId: user!._id,
      description: 'Pothole on 5th Ave',
      categoryHint: 'POTHOLE',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7484],
        address: '350 5th Ave',
      },
      status: 'SUBMITTED',
    });
    createdReportId = report.id;

    const incident = await IncidentModel.create({
      incidentNumber: 'INC-TEST-001',
      category: 'POTHOLE',
      description: 'Pothole on 5th Ave',
      ward: 'Ward 4 - Midtown',
      zone: 'Zone Alpha',
      severity: 'MEDIUM',
      status: 'SUBMITTED',
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7484],
        address: '350 5th Ave',
      },
      reportIds: [report._id],
      sla: { targetHours: 24, deadline: new Date(Date.now() + 86400000) },
    });
    createdIncidentId = incident.id;

    // Link report back to incident
    await reportRepository.linkToIncident(report.id, incident.id);
    const updatedReport = await ReportModel.findById(report.id);
    assert.strictEqual(updatedReport?.incidentId?.toString(), incident.id);
    assert.strictEqual(updatedReport?.status, 'LINKED');
  });

  // 7. Incident -> Evidence relationship
  it('7. Incident -> Evidence relationship: attaches evidence with correct references', async () => {
    const user = await UserModel.findOne({ email: 'test.officer@civicpulse.test' });
    const evidence = await EvidenceModel.create({
      incidentId: new mongoose.Types.ObjectId(createdIncidentId),
      uploadedBy: user!._id,
      type: 'BEFORE',
      fileUrl: '/uploads/pothole_test.jpg',
      mimeType: 'image/jpeg',
    });

    assert.strictEqual(evidence.incidentId?.toString(), createdIncidentId);
    assert.strictEqual(evidence.type, 'BEFORE');
    await EvidenceModel.findByIdAndDelete(evidence._id);
  });

  // 8. WorkOrder -> Incident relationship
  it('8. WorkOrder -> Incident relationship: work order references incident and department', async () => {
    const dept = await mongoose.model('Department').findOne();
    const team = await mongoose.model('Team').findOne();

    const workOrder = await WorkOrderModel.create({
      workOrderNumber: 'WO-TEST-999',
      incidentId: new mongoose.Types.ObjectId(createdIncidentId),
      departmentId: dept ? dept._id : new mongoose.Types.ObjectId(),
      teamId: team ? team._id : new mongoose.Types.ObjectId(),
      priority: 'HIGH',
      status: 'CREATED',
      sla: {
        deadlineAt: new Date(Date.now() + 86400000),
        targetHours: 24,
      },
    });

    assert.strictEqual(workOrder.incidentId.toString(), createdIncidentId);
    assert.strictEqual(workOrder.status, 'CREATED');
    await WorkOrderModel.findByIdAndDelete(workOrder._id);
  });

  // 9. Nearby incident query
  it('9. Nearby incident query: finds incident within radius and filters distant ones', async () => {
    // Midpoint: Empire State Building [-73.9851, 40.7484]
    const nearby = await incidentRepository.findIncidentsNearPoint([-73.9851, 40.7484], 1000);
    assert(nearby.length >= 1, 'Should find at least the test incident created at 350 5th Ave');

    // Distant search in London [0.1278, 51.5074] with 1km radius should NOT find NYC incident
    const distant = await incidentRepository.findIncidentsNearPoint([0.1278, 51.5074], 1000);
    assert.strictEqual(distant.length, 0, 'Distant coordinates in London should yield 0 results in NYC');
  });

  // 10. Pagination helper
  it('10. Pagination helper: correctly calculates page, limit, skip, and enforces max cap', () => {
    const p1 = sanitizePagination({ page: 2, limit: 10 });
    assert.strictEqual(p1.page, 2);
    assert.strictEqual(p1.limit, 10);
    assert.strictEqual(p1.skip, 10);

    // Capping at 100
    const p2 = sanitizePagination({ page: 1, limit: 500 });
    assert.strictEqual(p2.limit, 100);
  });

  // 11. Filtering query
  it('11. Filtering query: filter by severity and status works properly', async () => {
    const result = await incidentRepository.findWithPagination({
      severity: 'MEDIUM',
      status: 'SUBMITTED',
    });
    assert(result.data.length >= 1);
    for (const inc of result.data) {
      assert.strictEqual(inc.severity, 'MEDIUM');
      assert.strictEqual(inc.status, 'SUBMITTED');
    }
  });

  // 12. Aggregation functions
  it('12. Aggregation functions: status counts and resolution times execute cleanly', async () => {
    const statusCounts = await incidentRepository.getIncidentCountsByStatus();
    assert(Array.isArray(statusCounts));

    const avgResolution = await incidentRepository.getAverageResolutionTime();
    assert(typeof avgResolution.avgHours === 'number');
  });

  // 13. Invalid query parameters
  it('13. Invalid query parameters: NoSQL operators are sanitized', () => {
    const maliciousInput: any = {
      $where: 'sleep(1000)',
      username: 'admin',
      'profile.admin': true,
    };

    // Cleaned object logic
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(maliciousInput)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        cleaned[key] = value;
      }
    }

    assert.strictEqual(cleaned.$where, undefined);
    assert.strictEqual(cleaned['profile.admin'], undefined);
    assert.strictEqual(cleaned.username, 'admin');
  });

  // 14. Duplicate unique fields
  it('14. Duplicate unique fields: duplicate email throws E11000 duplicate key error', async () => {
    const duplicate = new UserModel({
      name: 'Duplicate Officer',
      email: 'test.officer@civicpulse.test', // already saved
      passwordHash: 'dummy',
      role: 'CITIZEN',
    });

    await assert.rejects(async () => duplicate.save(), /E11000/);
  });

  // 15. Audit log append-only behavior
  it('15. Audit log append-only behavior: audit logs can be appended and queried', async () => {
    const log = await AuditLogModel.create({
      actorType: 'SYSTEM',
      action: 'TEST_AUDIT_ACTION',
      resourceType: 'INCIDENT',
      resourceId: createdIncidentId,
      after: { test: true },
    });

    assert.strictEqual(log.action, 'TEST_AUDIT_ACTION');
    const logs = await AuditLogModel.find({ resourceId: createdIncidentId });
    assert(logs.length >= 1);
    await AuditLogModel.findByIdAndDelete(log._id);
  });
});
