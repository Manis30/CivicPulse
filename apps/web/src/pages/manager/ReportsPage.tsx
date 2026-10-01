import { useState } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { FileText, Download, Filter, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export function ReportsPage() {
  const [reportType, setReportType] = useState('SLA_COMPLIANCE');

  const generatedReports = [
    { id: 'REP-2026-M09', title: 'Monthly SLA Compliance & Escalation Audit', date: 'Sept 2026', size: '2.4 MB', records: '1,420 Incidents', status: 'Ready' },
    { id: 'REP-2026-W38', title: 'Ward 4 Midtown Infrastructure Density Assessment', date: 'Sept 18, 2026', size: '1.1 MB', records: '382 Incidents', status: 'Ready' },
    { id: 'REP-2026-F02', title: 'Fleet Response Time & Dispatch Latency Telemetry', date: 'Sept 15, 2026', size: '4.8 MB', records: '2,890 Dispatches', status: 'Ready' },
    { id: 'REP-2026-A01', title: 'Phase 4B Autonomous Agent Decision Rationale Log', date: 'Sept 10, 2026', size: '6.2 MB', records: '4,100 Decisions', status: 'Ready' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16">
      <PageHeader
        title="Operational Reports & SLA Audits"
        description="Generate certified municipal compliance logs, field performance dossiers, and Domo-compatible business intelligence exports."
        tag="MUNICIPAL AUDIT"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold" leftIcon={<FileText className="w-4 h-4" />}>
              Generate Custom Audit
            </Button>
          </div>
        }
      />

      {/* SLA Breach Monitor Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-civic-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base font-heading text-slate-900">
              Active SLA Breach & Escalation Watch
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              2 high-priority water leak incidents are within 45 minutes of exceeding target SLA windows.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="font-semibold text-slate-800">
          Review Escalation Triggers
        </Button>
      </div>

      {/* Structured Reports Ledger */}
      <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="font-bold text-base font-heading text-slate-900">
            Available Export Packages
          </h4>
          <span className="text-xs text-slate-400 font-medium">Auto-generated nightly</span>
        </div>

        <div className="space-y-3">
          {generatedReports.map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-heading">{rep.title}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {rep.id} • {rep.records} • {rep.size} • Created {rep.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download CSV
                </Button>
                <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  JSON
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
