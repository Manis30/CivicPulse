import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { workOrderService, WorkOrderTask } from '@/services/workOrderService';
import { CheckCircle2, Clock, MapPin, Camera, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OfficerHistoryPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workOrderService.getOfficerTasks().then((data) => {
      // Filter for completed or previous tasks
      setTasks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-16">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/officer')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </div>

      <PageHeader
        title="Work Order History & Pass Records"
        description="Historical log of executed field repairs and autonomous AI verification decisions."
        tag="PERFORMANCE AUDIT"
      />

      <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="font-bold text-sm text-slate-900 font-heading">
            Completed Job Log ({tasks.length})
          </span>
          <span className="text-xs text-slate-400">Autonomous Verification History</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
            <p className="text-xs">Loading historical records...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No historical work orders on record.
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {tasks.map((task) => {
              const inc = task.incidentId;
              const address = inc?.location?.address || 'Hosur Municipal Ward';
              const incidentId = inc?._id || inc?.id || task.incidentId;

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-heading">{task.workOrderNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-600 font-semibold">{inc?.category || 'CIVIC_DEFECT'}</span>
                      <StatusBadge status={task.status as any} />
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(task.updatedAt || task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed Verification
                    </span>
                    {incidentId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => navigate(`/officer/tasks/${incidentId}`)}
                        rightIcon={<ExternalLink className="w-3 h-3" />}
                      >
                        Dossier
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
