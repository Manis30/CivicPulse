import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import mongoose from 'mongoose';
import { IncidentModel, ReportModel, UserModel } from '../models/index.js';

describe('Phase 2 API Endpoints Integration Test Suite', () => {
  let server: http.Server;
  let baseUrl: string;
  let testIncidentId: string;
  let testIncidentNumber: string;

  before(async () => {
    await connectDatabase();
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://127.0.0.1:${address.port}/api`;
        resolve();
      });
    });

    // Pick an existing incident from the database seed
    const incident = await IncidentModel.findOne();
    if (incident) {
      testIncidentId = incident._id.toString();
      testIncidentNumber = incident.incidentNumber;
    }
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDatabase();
  });

  it('GET /api/health reports system status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.service, 'civicpulse-api');
    assert.strictEqual(body.database.state, 'CONNECTED');
  });

  it('GET /api/db/health reports database connection status', async () => {
    const res = await fetch(`${baseUrl}/db/health`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.connection.state, 'CONNECTED');
    assert.strictEqual(body.connection.databaseName?.toLowerCase(), 'civicpulse');
    assert.strictEqual(body.indexes.allValid, true);
  });

  it('GET /api/incidents returns paginated incidents list', async () => {
    const res = await fetch(`${baseUrl}/incidents?page=1&limit=5`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.data));
    assert(body.data.length > 0);
    assert.strictEqual(body.pagination.page, 1);
  });

  it('GET /api/incidents/:id returns specific incident', async () => {
    const target = testIncidentNumber || testIncidentId;
    const res = await fetch(`${baseUrl}/incidents/${target}`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(body.incidentNumber || body._id);
  });

  it('GET /api/incidents/nearby performs 2dsphere radius query', async () => {
    const res = await fetch(`${baseUrl}/incidents/nearby?lng=-73.9851&lat=40.7484&radius=2000`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.data));
    assert(body.data.length >= 1, 'Should find seeded incidents near 350 5th Ave');
  });

  it('GET /api/incidents/:id/timeline returns chronological events', async () => {
    const res = await fetch(`${baseUrl}/incidents/${testIncidentId}/timeline`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.data));
  });

  it('POST /api/reports creates a new report', async () => {
    const user = await UserModel.findOne();
    const payload = {
      reporterId: user ? user._id.toString() : new mongoose.Types.ObjectId().toString(),
      description: 'Broken water valve spraying into bike lane',
      categoryHint: 'WATER_LEAK',
      location: {
        type: 'Point',
        coordinates: [-73.9855, 40.7480],
        address: '5th Ave & 34th St',
      },
      source: 'WEB_PORTAL',
    };

    const res = await fetch(`${baseUrl}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.strictEqual(body.categoryHint, 'WATER_LEAK');
    assert.strictEqual(body.status, 'SUBMITTED');

    // Clean up created report
    await ReportModel.findByIdAndDelete(body._id);
  });

  it('GET /api/reports returns paginated reports', async () => {
    const res = await fetch(`${baseUrl}/reports?limit=5`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.data));
  });

  it('GET /api/departments returns municipal departments', async () => {
    const res = await fetch(`${baseUrl}/departments`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.data));
    assert(body.data.length >= 3);
  });

  it('GET /api/teams returns field teams with specializations', async () => {
    const res = await fetch(`${baseUrl}/teams`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.data));
    assert(body.data.length >= 2);
  });

  it('GET /api/analytics/overview returns aggregated statistics', async () => {
    const res = await fetch(`${baseUrl}/analytics/overview`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert(Array.isArray(body.countsByStatus));
    assert(Array.isArray(body.countsBySeverity));
    assert(Array.isArray(body.countsByCategory));
    assert(body.slaBreach && typeof body.slaBreach.breachRatePercentage === 'number');
  });
});
