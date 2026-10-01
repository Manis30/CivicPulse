import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Textarea, Select } from '@/components/ui/Input';
import { workOrderService, WorkOrderTask } from '@/services/workOrderService';
import { ShieldCheck, HardHat, Camera, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InspectionPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [checklist, setChecklist] = useState({
    ppeEquipped: true,
    trafficConesDeployed: false,
    utilityMarkingsVerified: false,
    gasElectricalClearance: false,
    pedestrianDetourSafe: false,
  });
  const [hazardSeverity, setHazardSeverity] = useState('HIGH');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    workOrderService.getOfficerTasks().then((data) => {
      setTasks(data);
      if (data.length > 0) setSelectedTaskId(data[0].id);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      navigate('/officer');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans text-slate-900 pb-16">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/officer')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Tasks
        </Button>
      </div>

      <PageHeader
        title="Field Inspection & Safety Protocol"
        description="Verify site boundaries, utility clearances, and safety perimeter before initiating physical road or utility repairs."
        tag="SITE SAFETY AUDIT"
      />

      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>On-site inspection logged and safety clearance verified.</span>
        </div>
      )}

      <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
          <FormField label="Associated Work Order">
            <Select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)}>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.workOrderNumber} — {t.incidentId?.category || 'Task'} ({t.incidentId?.location?.address || 'Hosur'})
                </option>
              ))}
            </Select>
          </FormField>

          {/* Safety Checklist */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-800 text-sm font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pre-Operation Safety Checks
            </h3>

            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.ppeEquipped}
                  onChange={(e) => setChecklist({ ...checklist, ppeEquipped: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-slate-700">Crew equipped with standard Class 3 PPE, steel-toe boots, and hard hats</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.trafficConesDeployed}
                  onChange={(e) => setChecklist({ ...checklist, trafficConesDeployed: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-slate-700">High-visibility reflective cones positioned 30m upstream from defect</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.utilityMarkingsVerified}
                  onChange={(e) => setChecklist({ ...checklist, utilityMarkingsVerified: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-slate-700">Underground optical fiber and potable water lines located and marked</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklist.pedestrianDetourSafe}
                  onChange={(e) => setChecklist({ ...checklist, pedestrianDetourSafe: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-slate-700">Clear barricaded sidewalk pedestrian pathway established</span>
              </label>
            </div>
          </div>

          <FormField label="Assessed On-Site Hazard Level">
            <Select value={hazardSeverity} onChange={(e) => setHazardSeverity(e.target.value)}>
              <option value="LOW">Low (Cosmetic, no imminent danger)</option>
              <option value="MEDIUM">Medium (Traffic slowdown, minor vehicle damage risk)</option>
              <option value="HIGH">High (Active blowout risk, swerving hazard)</option>
              <option value="CRITICAL">Critical (Immediate structural collapse or severe road obstruction)</option>
            </Select>
          </FormField>

          <FormField label="Inspector Observations & Material Assessment">
            <Textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Defect expanded to 1.2m diameter due to recent monsoon runoff. Recommended 400kg cold-mix asphalt compound..."
            />
          </FormField>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => navigate('/officer')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
              Submit Inspection Protocol
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
