import React, { useState, useEffect } from 'react';
import { adminService, AIPolicy } from '@/services/adminService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
  AdminLoadingState,
  AdminErrorState,
} from '@/components/admin/primitives';
import {
  LuSlidersHorizontal,
  LuShield,
  LuSave,
  LuRotateCcw,
  LuCircleCheck,
  LuTriangleAlert,
  LuClock,
  LuUser,
  LuInfo,
  LuX,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';

export function PoliciesPage() {
  const [policies, setPolicies] = useState<AIPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Form states mapped from MongoDB AIPolicy collection
  const [spatialRadius, setSpatialRadius] = useState(50);
  const [textSimilarity, setTextSimilarity] = useState(0.75);
  const [timeWindowHours, setTimeWindowHours] = useState(72);
  const [criticalScore, setCriticalScore] = useState(80);
  const [highScore, setHighScore] = useState(60);
  const [verificationFloor, setVerificationFloor] = useState(0.75);
  const [maxAutoReopens, setMaxAutoReopens] = useState(2);
  const [maxCrewTasks, setMaxCrewTasks] = useState(5);

  // Stored baseline values to compute unsaved changes
  const [baseline, setBaseline] = useState<any>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPolicies();
      setPolicies(data);

      const b: any = {};

      const dup = data.find((p) => p.category === 'DUPLICATE');
      if (dup?.rules) {
        const sr = Number(dup.rules.spatialRadiusMeters?.value ?? 50);
        const ts = Number(dup.rules.textSimilarityThreshold?.value ?? 0.75);
        const tw = Number(dup.rules.timeWindowHours?.value ?? 72);
        setSpatialRadius(sr);
        setTextSimilarity(ts);
        setTimeWindowHours(tw);
        b.spatialRadius = sr;
        b.textSimilarity = ts;
        b.timeWindowHours = tw;
      }

      const sev = data.find((p) => p.category === 'SEVERITY');
      if (sev?.rules) {
        const cs = Number(sev.rules.criticalThresholdScore?.value ?? 80);
        const hs = Number(sev.rules.highThresholdScore?.value ?? 60);
        setCriticalScore(cs);
        setHighScore(hs);
        b.criticalScore = cs;
        b.highScore = hs;
      }

      const ver = data.find((p) => p.category === 'VERIFICATION');
      if (ver?.rules) {
        const vf = Number(ver.rules.confidenceThreshold?.value ?? 0.75);
        const mr = Number(ver.rules.maxAutoReopens?.value ?? 2);
        setVerificationFloor(vf);
        setMaxAutoReopens(mr);
        b.verificationFloor = vf;
        b.maxAutoReopens = mr;
      }

      const rout = data.find((p) => p.category === 'ROUTING');
      if (rout?.rules) {
        const mt = Number(rout.rules.maxConcurrentCrewTasks?.value ?? 5);
        setMaxCrewTasks(mt);
        b.maxCrewTasks = mt;
      }

      setBaseline(b);
    } catch (err: any) {
      setError(err.message || 'Failed to load AI policies from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const hasDuplicateChanges =
    baseline &&
    (spatialRadius !== baseline.spatialRadius ||
      textSimilarity !== baseline.textSimilarity ||
      timeWindowHours !== baseline.timeWindowHours);

  const hasSeverityChanges =
    baseline &&
    (criticalScore !== baseline.criticalScore || highScore !== baseline.highScore);

  const hasVerificationChanges =
    baseline &&
    (verificationFloor !== baseline.verificationFloor ||
      maxAutoReopens !== baseline.maxAutoReopens);

  const hasRoutingChanges =
    baseline && maxCrewTasks !== baseline.maxCrewTasks;

  const totalUnsavedChanges =
    (hasDuplicateChanges ? 1 : 0) +
    (hasSeverityChanges ? 1 : 0) +
    (hasVerificationChanges ? 1 : 0) +
    (hasRoutingChanges ? 1 : 0);

  const executePersist = async () => {
    try {
      setSaving(true);
      setError(null);
      setConfirmModalOpen(false);

      if (hasDuplicateChanges) {
        await adminService.updatePolicy({
          category: 'DUPLICATE',
          rules: {
            spatialRadiusMeters: { ruleKey: 'spatialRadiusMeters', description: 'Maximum radius in meters', value: spatialRadius, type: 'number', editable: true },
            textSimilarityThreshold: { ruleKey: 'textSimilarityThreshold', description: 'Cosine text similarity', value: textSimilarity, type: 'number', editable: true },
            timeWindowHours: { ruleKey: 'timeWindowHours', description: 'Temporal window in hours', value: timeWindowHours, type: 'number', editable: true },
          },
          reason: 'Administrative tuning of spatial radius and similarity cutoff',
        });
      }

      if (hasSeverityChanges) {
        await adminService.updatePolicy({
          category: 'SEVERITY',
          rules: {
            criticalThresholdScore: { ruleKey: 'criticalThresholdScore', description: 'Critical threshold score', value: criticalScore, type: 'number', editable: true },
            highThresholdScore: { ruleKey: 'highThresholdScore', description: 'High threshold score', value: highScore, type: 'number', editable: true },
          },
          reason: 'Administrative adjustment of incident severity scoring weights',
        });
      }

      if (hasVerificationChanges) {
        await adminService.updatePolicy({
          category: 'VERIFICATION',
          rules: {
            confidenceThreshold: { ruleKey: 'confidenceThreshold', description: 'Minimum Gemini Vision confidence floor', value: verificationFloor, type: 'number', editable: true },
            maxAutoReopens: { ruleKey: 'maxAutoReopens', description: 'Max reopen cycles before human escalation', value: maxAutoReopens, type: 'number', editable: true },
          },
          reason: 'Administrative calibration of autonomous verification threshold',
        });
      }

      if (hasRoutingChanges) {
        await adminService.updatePolicy({
          category: 'ROUTING',
          rules: {
            maxConcurrentCrewTasks: { ruleKey: 'maxConcurrentCrewTasks', description: 'Max crew tasks before capacity saturation', value: maxCrewTasks, type: 'number', editable: true },
          },
          reason: 'Administrative tuning of crew concurrent workload limit',
        });
      }

      setSavedNotice('AI policies updated successfully and persisted to database.');
      setTimeout(() => setSavedNotice(null), 4000);
      await fetchPolicies();
    } catch (err: any) {
      setError(err.message || 'Failed to persist policies');
    } finally {
      setSaving(false);
    }
  };

  const dupPolicy = policies.find((p) => p.category === 'DUPLICATE');
  const sevPolicy = policies.find((p) => p.category === 'SEVERITY');
  const verPolicy = policies.find((p) => p.category === 'VERIFICATION');
  const routPolicy = policies.find((p) => p.category === 'ROUTING');

  return (
    <div className="w-full space-y-6 pb-16 font-sans text-[#F8FAFC]">
      <AdminPageHeader
        title="AI Policies & Algorithmic Thresholds"
        description="Fine-tune machine learning confidence floors, spatial clustering radiuses, severity cutoffs, and autonomous reopen thresholds."
        tag="AI GOVERNANCE"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchPolicies}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1B2D] hover:bg-[#13243A] border border-[rgba(148,163,184,0.16)] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <LuRotateCcw className="w-3.5 h-3.5" />
              <span>Discard / Reload</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              disabled={totalUnsavedChanges === 0 || saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B5BF7] hover:bg-[#4F46E5] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-indigo-950/40 cursor-pointer"
            >
              <LuSave className="w-3.5 h-3.5" />
              <span>{saving ? 'Persisting...' : `Save Changes (${totalUnsavedChanges})`}</span>
            </button>
          </div>
        }
      />

      {savedNotice && (
        <div className="p-4 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#4ADE80] text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <LuCircleCheck className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {error && (
        <AdminErrorState
          title="Policy Operation Failed"
          reason={error}
          onRetry={fetchPolicies}
        />
      )}

      {loading && policies.length === 0 ? (
        <AdminLoadingState
          message="Loading AI policies from database..."
          submessage="Querying AIPolicy collection and calibration history..."
        />
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: DUPLICATE DETECTION */}
          <AdminCard className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-[#F8FAFC]">
                    Duplicate Detection & Spatial Clustering
                  </h3>
                  {hasDuplicateChanges ? (
                    <AdminBadge variant="warning" size="sm">
                      UNSAVED CHANGES
                    </AdminBadge>
                  ) : (
                    <AdminBadge variant="success" size="sm">
                      SYNCHRONIZED
                    </AdminBadge>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Governed by Location Agent & Duplicate Agent (AGENT_DUPLICATE)
                </p>
              </div>

              {dupPolicy?.updatedAt && (
                <div className="text-right text-[11px] text-[#64748B] font-mono">
                  Updated: {new Date(dupPolicy.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Spatial Radius */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    Spatial Radius
                  </span>
                  <span className="font-mono text-xs font-bold text-[#5B5BF7]">
                    {spatialRadius} meters
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={250}
                  step={5}
                  value={spatialRadius}
                  onChange={(e) => setSpatialRadius(Number(e.target.value))}
                  className="w-full accent-[#5B5BF7] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Max distance to evaluate GIS 2dsphere proximity clusters.
                </p>
              </div>

              {/* Text Similarity */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    Text Similarity Cutoff
                  </span>
                  <span className="font-mono text-xs font-bold text-[#5B5BF7]">
                    {(textSimilarity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  value={textSimilarity}
                  onChange={(e) => setTextSimilarity(Number(e.target.value))}
                  className="w-full accent-[#5B5BF7] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Cosine TF-IDF similarity threshold to trigger duplicate grouping.
                </p>
              </div>

              {/* Time Window */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    Time Window
                  </span>
                  <span className="font-mono text-xs font-bold text-[#5B5BF7]">
                    {timeWindowHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={168}
                  step={6}
                  value={timeWindowHours}
                  onChange={(e) => setTimeWindowHours(Number(e.target.value))}
                  className="w-full accent-[#5B5BF7] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Temporal evaluation window for candidate duplicate incidents.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* SECTION 2: SEVERITY SCORING */}
          <AdminCard className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-[#F8FAFC]">
                    Severity Scoring & Transit Hazard Cutoffs
                  </h3>
                  {hasSeverityChanges ? (
                    <AdminBadge variant="warning" size="sm">
                      UNSAVED CHANGES
                    </AdminBadge>
                  ) : (
                    <AdminBadge variant="success" size="sm">
                      SYNCHRONIZED
                    </AdminBadge>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Governed by Severity Agent (AGENT_SEVERITY)
                </p>
              </div>

              {sevPolicy?.updatedAt && (
                <div className="text-right text-[11px] text-[#64748B] font-mono">
                  Updated: {new Date(sevPolicy.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Critical Score */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    CRITICAL Severity Floor
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F0526B]">
                    Score {criticalScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={95}
                  step={5}
                  value={criticalScore}
                  onChange={(e) => setCriticalScore(Number(e.target.value))}
                  className="w-full accent-[#F0526B] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Computed multi-factor risk score to trigger emergency dispatch.
                </p>
              </div>

              {/* High Score */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    HIGH Severity Floor
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F59E0B]">
                    Score {highScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={75}
                  step={5}
                  value={highScore}
                  onChange={(e) => setHighScore(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Score to mark ticket as High priority with expedited SLA timer.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* SECTION 3: RESOLUTION VERIFICATION */}
          <AdminCard className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-[#F8FAFC]">
                    Autonomous Resolution Verification
                  </h3>
                  {hasVerificationChanges ? (
                    <AdminBadge variant="warning" size="sm">
                      UNSAVED CHANGES
                    </AdminBadge>
                  ) : (
                    <AdminBadge variant="success" size="sm">
                      SYNCHRONIZED
                    </AdminBadge>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Governed by Verification Agent (AGENT_VERIFICATION)
                </p>
              </div>

              {verPolicy?.updatedAt && (
                <div className="text-right text-[11px] text-[#64748B] font-mono">
                  Updated: {new Date(verPolicy.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Confidence Floor */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    Gemini Vision Confidence Floor
                  </span>
                  <span className="font-mono text-xs font-bold text-[#22C55E]">
                    {(verificationFloor * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={0.95}
                  step={0.05}
                  value={verificationFloor}
                  onChange={(e) => setVerificationFloor(Number(e.target.value))}
                  className="w-full accent-[#22C55E] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Minimum multimodal computer vision score required to auto-close work orders.
                </p>
              </div>

              {/* Max Auto Reopen Cycles */}
              <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#F8FAFC]">
                    Max Automatic Reopen Cycles
                  </span>
                  <span className="font-mono text-xs font-bold text-[#38BDF8]">
                    {maxAutoReopens} cycles
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={maxAutoReopens}
                  onChange={(e) => setMaxAutoReopens(Number(e.target.value))}
                  className="w-full accent-[#38BDF8] cursor-pointer"
                />
                <p className="text-[11px] text-[#94A3B8]">
                  Max times ticket is auto-reopened before escalating to manual supervisor review.
                </p>
              </div>
            </div>
          </AdminCard>

          {/* SECTION 4: OPERATIONS & WORKLOAD */}
          <AdminCard className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[rgba(148,163,184,0.12)]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-[#F8FAFC]">
                    Field Operations & Routing Constraints
                  </h3>
                  {hasRoutingChanges ? (
                    <AdminBadge variant="warning" size="sm">
                      UNSAVED CHANGES
                    </AdminBadge>
                  ) : (
                    <AdminBadge variant="success" size="sm">
                      SYNCHRONIZED
                    </AdminBadge>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Governed by Routing Agent (AGENT_ROUTING)
                </p>
              </div>

              {routPolicy?.updatedAt && (
                <div className="text-right text-[11px] text-[#64748B] font-mono">
                  Updated: {new Date(routPolicy.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-3 max-w-md">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-[#F8FAFC]">
                  Max Concurrent Tasks Per Field Crew
                </span>
                <span className="font-mono text-xs font-bold text-[#5B5BF7]">
                  {maxCrewTasks} tasks
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                step={1}
                value={maxCrewTasks}
                onChange={(e) => setMaxCrewTasks(Number(e.target.value))}
                className="w-full accent-[#5B5BF7] cursor-pointer"
              />
              <p className="text-[11px] text-[#94A3B8]">
                Capacity threshold to prevent field crew saturation during dispatch.
              </p>
            </div>
          </AdminCard>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR HIGH-IMPACT POLICY CHANGES */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setConfirmModalOpen(false)}
            className="fixed inset-0 bg-[#07111F]/80 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-[#0E1B2D] border border-[rgba(148,163,184,0.2)] shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center gap-3 text-[#F59E0B]">
              <div className="p-2 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30">
                <LuTriangleAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-[#F8FAFC]">
                  Confirm Algorithmic Policy Update
                </h4>
                <p className="text-[11px] text-[#94A3B8]">High-impact cluster calibration</p>
              </div>
            </div>

            <p className="text-[#94A3B8] leading-relaxed">
              You are about to persist updated AI governance parameters across all running agent workers and the central MongoDB policy ledger. This will alter autonomous triage and verification behavior immediately.
            </p>

            <div className="p-3 rounded-xl bg-[#101F33] border border-[rgba(148,163,184,0.1)] space-y-1 font-mono text-[11px] text-[#818CF8]">
              <div>Modified Policies: {totalUnsavedChanges}</div>
              {hasDuplicateChanges && <div>• Duplicate Detection & Radius</div>}
              {hasSeverityChanges && <div>• Severity & Hazard Cutoffs</div>}
              {hasVerificationChanges && <div>• Resolution Verification Floor</div>}
              {hasRoutingChanges && <div>• Crew Concurrency Limits</div>}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-[#101F33] hover:bg-[#13243A] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executePersist}
                className="px-4 py-2 rounded-xl bg-[#5B5BF7] hover:bg-[#4F46E5] text-white font-bold transition-colors shadow-sm"
              >
                Confirm & Persist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default PoliciesPage;
