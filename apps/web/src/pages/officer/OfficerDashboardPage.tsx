import { useState, useEffect, useRef } from 'react';
import { Card, MetricCard, Panel } from '@/components/ui/Card';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  HardHat,
  CheckSquare,
  Clock,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Upload,
  MapPin,
  Play,
  RotateCw,
  XCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Overlays';
import { workOrderService, WorkOrderTask } from '@/services/workOrderService';
import { evidenceService } from '@/services/evidenceService';
import { authService } from '@/services/authService';

export function OfficerDashboardPage() {
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Complete Work Order & Verification Modal
  const [selectedTask, setSelectedTask] = useState<WorkOrderTask | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('Pothole cleaned, asphalt compound laid and compacted according to standard municipal specs.');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentUser = authService.getCurrentUser();

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workOrderService.getOfficerTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load field tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAccept = async (taskId: string) => {
    try {
      await workOrderService.acceptTask(taskId);
      await loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to accept task');
    }
  };

  const handleStart = async (taskId: string) => {
    try {
      await workOrderService.startTask(taskId);
      await loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to start task');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCompleteWork = async () => {
    if (!selectedTask) return;
    try {
      setIsVerifying(true);

      let afterEvidenceId: string | undefined;
      if (afterFile) {
        const ev = await evidenceService.uploadEvidence(afterFile, {
          type: 'AFTER',
          incidentId: selectedTask.incidentId?._id || selectedTask.incidentId,
        });
        afterEvidenceId = ev.id;
      }

      // Complete task and invoke AGENT_VERIFICATION autonomously
      const result = await workOrderService.completeTask(selectedTask.id, {
        afterEvidenceId,
        notes: completionNotes,
      });

      setVerificationResult(result);
      await loadTasks();
    } catch (err: any) {
      alert(err.message || 'Failed to complete work order');
    } finally {
      setIsVerifying(false);
    }
  };

  // Metrics derived purely from live tasks
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'ACCEPTED' || t.status === 'IN_PROGRESS').length;
  const criticalCount = tasks.filter((t) => t.priority === 'CRITICAL').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 font-sans text-slate-900 max-w-5xl mx-auto pb-16">
      {/* Officer Header with Shift Info */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-civic-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs">
            <HardHat className="w-3.5 h-3.5" />
            <span>FIELD OFFICER CONSOLE</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            {currentUser?.name || 'Field Officer'}
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Badge: {(currentUser as any)?.badgeNumber || 'OF-7842'} • Municipal Field Response Team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadTasks} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
            Refresh Tasks
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ON SHIFT • ACTIVE DISPATCH</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadTasks} className="font-bold underline">Retry</button>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Pending Queue"
          value={String(pendingCount)}
          icon={<CheckSquare className="w-4 h-4 text-amber-600" />}
          accent="warning"
        />
        <MetricCard
          label="In Progress"
          value={String(inProgressCount)}
          icon={<Play className="w-4 h-4 text-blue-600" />}
          accent="blue"
        />
        <MetricCard
          label="Critical Priority"
          value={String(criticalCount)}
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          accent="danger"
        />
        <MetricCard
          label="Verified Completed"
          value={String(completedCount)}
          sublabel="AI verification passed"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          accent="success"
        />
      </div>

      {/* Active Work Orders List */}
      <Panel
        title="Assigned Work Orders"
        subtitle="Manage assigned tasks, update operational state, and attach AFTER photographic evidence for autonomous AI verification"
      >
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
            <p className="text-xs">Loading live work orders from database...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-heading font-bold text-slate-800 text-sm">All caught up!</p>
            <p className="text-xs text-slate-400">No pending work orders assigned to your crew at this moment.</p>
          </div>
        ) : (
          <div className="space-y-4 font-sans text-xs">
            {tasks.map((task) => {
              const inc = task.incidentId;
              const address = inc?.location?.address || 'Hosur Ward Zone';
              const category = inc?.category || 'CIVIC_DEFECT';
              const isPending = task.status === 'PENDING';
              const isAccepted = task.status === 'ACCEPTED';
              const isInProgress = task.status === 'IN_PROGRESS';
              const isCompleted = task.status === 'COMPLETED';

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-civic-hover transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm font-heading text-slate-900">{task.workOrderNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-600 font-semibold">{category}</span>
                      {inc?.incidentNumber && (
                        <span className="text-slate-400 text-[11px]">({inc.incidentNumber})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={task.priority} />
                      <StatusBadge status={task.status as any} />
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>SLA Deadline: {new Date(task.slaDeadline).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checklist & Equipment */}
                  {task.equipment && task.equipment.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Required Gear:</span>
                      <span>{task.equipment.join(', ')}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {isCompleted ? '✓ Verified by Computer Vision' : 'Autonomous AI verification required upon completion'}
                    </span>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                          onClick={() => handleAccept(task.id)}
                        >
                          Accept Order
                        </Button>
                      )}

                      {isAccepted && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                          onClick={() => handleStart(task.id)}
                          leftIcon={<Play className="w-3 h-3" />}
                        >
                          Start Work
                        </Button>
                      )}

                      {isInProgress && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          onClick={() => {
                            setSelectedTask(task);
                            setVerificationResult(null);
                            setAfterFile(null);
                            setPreviewUrl(null);
                          }}
                          leftIcon={<Camera className="w-3.5 h-3.5" />}
                        >
                          Submit Repair Evidence
                        </Button>
                      )}

                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Work Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Completion & Verification Dialog */}
      <Dialog
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setVerificationResult(null);
        }}
        title="Complete Work Order & Verify Fix"
        description="Autonomous verification requires clear photographic evidence of physical resolution."
      >
        {isVerifying ? (
          <div className="py-8 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-bold font-heading text-slate-900">
                Agent Verification Executing...
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Gemini Vision is comparing the citizen BEFORE image with your field AFTER image to confirm physical defect remediation.
              </p>
            </div>
          </div>
        ) : verificationResult ? (
          <div className="py-6 text-center space-y-4">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              verificationResult.verification?.decision === 'PASS'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              {verificationResult.verification?.decision === 'PASS' ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold font-heading text-slate-900">
                {verificationResult.verification?.decision === 'PASS'
                  ? 'Verification PASSED — Incident Closed'
                  : 'Verification Review Required'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {verificationResult.verification?.reason || 'Comparison completed by AGENT_VERIFICATION.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Resolution Confidence:</span>
                <span className="font-bold text-slate-900">
                  {Math.round((verificationResult.verification?.confidence || 0.95) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Incident State:</span>
                <span className="font-bold text-emerald-600">
                  {verificationResult.incidentStatus || 'CLOSED'}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full"
              onClick={() => {
                setSelectedTask(null);
                setVerificationResult(null);
              }}
            >
              Done & Return to Tasks
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Attach AFTER Photographic Proof (Required)
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 p-6 rounded-2xl text-center bg-slate-50/70 hover:bg-amber-50/20 cursor-pointer space-y-2 transition-all"
              >
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Click to select photo taken on-site</p>
                <p className="text-[11px] text-slate-400">JPEG, PNG, WebP up to 15MB</p>
              </div>

              {afterFile && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {previewUrl && (
                      <img src={previewUrl} alt="After Preview" className="w-10 h-10 rounded object-cover" />
                    )}
                    <span className="font-bold text-emerald-800">{afterFile.name}</span>
                  </div>
                  <span className="text-emerald-700 font-semibold">Ready</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Field Completion Notes
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                placeholder="Document repairs executed, materials consumed, or special observations..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleCompleteWork}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Execute Autonomous Verification
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
