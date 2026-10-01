import React, { useState, useEffect } from 'react';
import { adminService, SystemConfigData } from '@/services/adminService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminLoadingState,
  AdminErrorState,
} from '@/components/admin/primitives';
import {
  LuSettings,
  LuGlobe,
  LuClock,
  LuSlidersHorizontal,
  LuShield,
  LuCircleCheck,
  LuSave,
  LuRotateCcw,
  LuKey,
  LuToggleLeft,
  LuToggleRight,
  LuActivity,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [clusterName, setClusterName] = useState('Hosur City Municipal Corporation (District Central)');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [autoDispatchThreshold, setAutoDispatchThreshold] = useState(0.75);
  const [slaGraceMinutes, setSlaGraceMinutes] = useState(30);

  // Feature Flags
  const [autonomousDispatch, setAutonomousDispatch] = useState(true);
  const [strictJurisdiction, setStrictJurisdiction] = useState(true);
  const [multimodalVerification, setMultimodalVerification] = useState(true);
  const [telemetryStreaming, setTelemetryStreaming] = useState(true);

  // Baseline to detect unsaved changes
  const [baseline, setBaseline] = useState<any>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemConfig();
      setConfig(data);

      setClusterName(data.clusterName || 'Hosur City Municipal Corporation (District Central)');
      setTimezone(data.timezone || 'Asia/Kolkata (IST)');
      setAutoDispatchThreshold(data.autoDispatchThreshold ?? 0.75);
      setSlaGraceMinutes(data.slaGraceMinutes ?? 30);

      const flags = data.featureFlags || {};
      setAutonomousDispatch(flags.autonomousDispatch ?? true);
      setStrictJurisdiction(flags.strictJurisdictionMatching ?? true);
      setMultimodalVerification(flags.multimodalVerification ?? true);
      setTelemetryStreaming(flags.telemetryStreaming ?? true);

      setBaseline({
        clusterName: data.clusterName,
        timezone: data.timezone,
        autoDispatchThreshold: data.autoDispatchThreshold,
        slaGraceMinutes: data.slaGraceMinutes,
        autonomousDispatch: flags.autonomousDispatch,
        strictJurisdiction: flags.strictJurisdictionMatching,
        multimodalVerification: flags.multimodalVerification,
        telemetryStreaming: flags.telemetryStreaming,
      });
    } catch (err: any) {
      console.error('Failed to load system config:', err);
      setError(err.message || 'Unable to connect to configuration service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const hasUnsavedChanges =
    baseline &&
    (clusterName !== baseline.clusterName ||
      timezone !== baseline.timezone ||
      autoDispatchThreshold !== baseline.autoDispatchThreshold ||
      slaGraceMinutes !== baseline.slaGraceMinutes ||
      autonomousDispatch !== baseline.autonomousDispatch ||
      strictJurisdiction !== baseline.strictJurisdiction ||
      multimodalVerification !== baseline.multimodalVerification ||
      telemetryStreaming !== baseline.telemetryStreaming);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await adminService.updateSystemConfig({
        clusterName,
        timezone,
        autoDispatchThreshold,
        slaGraceMinutes,
        featureFlags: {
          autonomousDispatch,
          strictJurisdictionMatching: strictJurisdiction,
          multimodalVerification,
          telemetryStreaming,
        },
      });

      setSavedNotice('Platform configuration saved and persisted to database.');
      setTimeout(() => setSavedNotice(null), 4000);
      await fetchConfig();
    } catch (err: any) {
      setError(err.message || 'Failed to update system configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-5 pb-12 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="Platform & Municipal Settings"
        description="Configure municipal cluster boundaries, automated dispatch rules, integration connectivity, and system feature flags."
        tag="SYSTEM CONFIG"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
              <span>Discard / Reload</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B5BF7] hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-950/40 cursor-pointer"
            >
              <LuSave className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        }
      />

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#4ADE80] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <LuCircleCheck className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {error && (
        <AdminErrorState
          title="Configuration Update Failed"
          reason={error}
          onRetry={fetchConfig}
        />
      )}

      {loading && !config ? (
        <AdminLoadingState
          message="Loading system configuration..."
          submessage="Querying persistent configuration collection and integration statuses..."
        />
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          {/* SECTION 1: MUNICIPAL CLUSTER & JURISDICTION */}
          <AdminCard className="p-5 sm:p-5.5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="flex items-center gap-2">
                <LuGlobe className="w-4 h-4 text-[#5B5BF7]" />
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                  Municipal Cluster & Regional Timezone
                </h3>
              </div>
              {config?.updatedAt && (
                <span className="text-[11px] text-[#64748B] font-mono">
                  Persisted: {new Date(config.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8] block">
                  Assigned Operations Cluster
                </label>
                <input
                  type="text"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7] font-sans"
                />
                <p className="text-[10.5px] text-[#64748B]">
                  Target municipality governed by this CivicPulse runtime instance.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#94A3B8] block">
                  Municipal Timezone & Operating Clocks
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#07111F] border border-[rgba(148,163,184,0.16)] rounded-xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#5B5BF7] font-sans"
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST) — Standard Municipal Time</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                </select>
                <p className="text-[10.5px] text-[#64748B]">
                  Enforces SLA countdown timers and field shift cutoffs.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* SECTION 2: OPERATIONAL AUTOMATION RULES */}
          <AdminCard className="p-5 sm:p-5.5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <LuSlidersHorizontal className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                Operational Dispatch & SLA Thresholds
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Auto Dispatch Threshold */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    Autonomous Dispatch Confidence Floor
                  </span>
                  <span className="font-mono text-xs font-bold text-[#5B5BF7]">
                    {(autoDispatchThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  value={autoDispatchThreshold}
                  onChange={(e) => setAutoDispatchThreshold(Number(e.target.value))}
                  className="w-full accent-[#5B5BF7] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Minimum combined confidence required for routing agents to create work orders automatically without manual triage approval.
                </p>
              </div>

              {/* SLA Grace Period */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    SLA Warning Grace Period
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F59E0B]">
                    {slaGraceMinutes} minutes
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={slaGraceMinutes}
                  onChange={(e) => setSlaGraceMinutes(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Buffer duration before escalation broadcasts are sent to department supervisors.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* SECTION 3: SYSTEM FEATURE FLAGS */}
          <AdminCard className="p-5 sm:p-5.5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <LuShield className="w-4 h-4 text-[#22C55E]" />
              <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                Autonomous System Feature Flags
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Flag 1 */}
              <div
                onClick={() => setAutonomousDispatch(!autonomousDispatch)}
                className="p-3.5 sm:p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] hover:border-[#5B5BF7]/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs text-[#F8FAFC] block">
                    Autonomous Dispatch Worker
                  </span>
                  <p className="text-[11px] text-[#94A3B8]">
                    Allow routing agents to assign field crews directly.
                  </p>
                </div>
                <span className={cn('text-xl shrink-0', autonomousDispatch ? 'text-[#22C55E]' : 'text-[#64748B]')}>
                  {autonomousDispatch ? <LuToggleRight className="w-6 h-6" /> : <LuToggleLeft className="w-6 h-6" />}
                </span>
              </div>

              {/* Flag 2 */}
              <div
                onClick={() => setStrictJurisdiction(!strictJurisdiction)}
                className="p-3.5 sm:p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] hover:border-[#5B5BF7]/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs text-[#F8FAFC] block">
                    Strict Jurisdiction Boundary Matching
                  </span>
                  <p className="text-[11px] text-[#94A3B8]">
                    Strictly block cross-ward dispatches outside crew zones.
                  </p>
                </div>
                <span className={cn('text-xl shrink-0', strictJurisdiction ? 'text-[#22C55E]' : 'text-[#64748B]')}>
                  {strictJurisdiction ? <LuToggleRight className="w-6 h-6" /> : <LuToggleLeft className="w-6 h-6" />}
                </span>
              </div>

              {/* Flag 3 */}
              <div
                onClick={() => setMultimodalVerification(!multimodalVerification)}
                className="p-3.5 sm:p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] hover:border-[#5B5BF7]/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs text-[#F8FAFC] block">
                    Multimodal Photo Verification
                  </span>
                  <p className="text-[11px] text-[#94A3B8]">
                    Require Gemini Before/After verification before ticket closure.
                  </p>
                </div>
                <span className={cn('text-xl shrink-0', multimodalVerification ? 'text-[#22C55E]' : 'text-[#64748B]')}>
                  {multimodalVerification ? <LuToggleRight className="w-6 h-6" /> : <LuToggleLeft className="w-6 h-6" />}
                </span>
              </div>

              {/* Flag 4 */}
              <div
                onClick={() => setTelemetryStreaming(!telemetryStreaming)}
                className="p-3.5 sm:p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] hover:border-[#5B5BF7]/40 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-0.5 pr-2">
                  <span className="font-bold text-xs text-[#F8FAFC] block">
                    Live Telemetry WebSocket Streaming
                  </span>
                  <p className="text-[11px] text-[#94A3B8]">
                    Stream agent tool execution logs live to admin consoles.
                  </p>
                </div>
                <span className={cn('text-xl shrink-0', telemetryStreaming ? 'text-[#22C55E]' : 'text-[#64748B]')}>
                  {telemetryStreaming ? <LuToggleRight className="w-6 h-6" /> : <LuToggleLeft className="w-6 h-6" />}
                </span>
              </div>
            </div>
          </AdminCard>

          {/* SECTION 4: INTEGRATIONS & CREDENTIALS (SAFE MASKING) */}
          <AdminCard className="p-5 sm:p-5.5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="flex items-center gap-2">
                <LuKey className="w-4 h-4 text-[#818CF8]" />
                <h3 className="font-heading font-bold text-sm text-[#F8FAFC]">
                  Third-Party Integrations & Security Boundaries
                </h3>
              </div>
              <span className="text-[11px] text-[#94A3B8]">
                Protected environment secrets (Masked)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Gemini AI */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F8FAFC] block">Google Gemini AI Studio</span>
                  <span className="text-[10.5px] text-[#64748B] font-mono">
                    Model: {config?.integrations?.gemini?.model || 'gemini-1.5-flash'}
                  </span>
                </div>
                <AdminBadge
                  size="sm"
                  variant={config?.integrations?.gemini?.configured ? 'success' : 'danger'}
                  dot
                >
                  {config?.integrations?.gemini?.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </AdminBadge>
              </div>

              {/* Redis BullMQ */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F8FAFC] block">Redis Distributed Worker Pool</span>
                  <span className="text-[10.5px] text-[#64748B] font-mono">Port: 6379</span>
                </div>
                <AdminBadge
                  size="sm"
                  variant={config?.integrations?.redis?.configured ? 'success' : 'danger'}
                  dot
                >
                  {config?.integrations?.redis?.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </AdminBadge>
              </div>

              {/* Mapbox GIS */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F8FAFC] block">Mapbox Vector & GIS Tiles</span>
                  <span className="text-[10.5px] text-[#64748B] font-mono">Navigation Engine</span>
                </div>
                <AdminBadge
                  size="sm"
                  variant={config?.integrations?.mapbox?.configured ? 'success' : 'danger'}
                  dot
                >
                  {config?.integrations?.mapbox?.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </AdminBadge>
              </div>

              {/* Outbound Webhooks */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F8FAFC] block">Municipal Webhook Relay</span>
                  <span className="text-[10.5px] text-[#64748B] font-mono">HMAC-SHA256 Signature</span>
                </div>
                <AdminBadge
                  size="sm"
                  variant={config?.integrations?.webhooks?.configured ? 'success' : 'outline'}
                >
                  {config?.integrations?.webhooks?.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </AdminBadge>
              </div>
            </div>
          </AdminCard>
        </form>
      )}
    </div>
  );
}
export default AdminSettingsPage;
