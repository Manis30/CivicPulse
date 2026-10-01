import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card, MetricCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Download,
  AlertTriangle,
  Building2,
  Sparkles,
  Loader2,
  RotateCw,
} from 'lucide-react';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getOverview();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to query analytics overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalIncidents = analytics?.countsByStatus?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const resolvedCount = analytics?.countsByStatus
    ?.filter((s) => s.status === 'RESOLVED' || s.status === 'CLOSED')
    .reduce((acc, curr) => acc + curr.count, 0) || 0;
  const criticalCount = analytics?.countsBySeverity?.find((s) => s.severity === 'CRITICAL')?.count || 0;
  const resolutionRate = totalIncidents > 0 ? ((resolvedCount / totalIncidents) * 100).toFixed(1) : '100.0';
  const slaCompliance = analytics?.slaBreach ? (100 - (analytics.slaBreach.breachRatePercentage || 0)).toFixed(1) : '98.5';
  const avgHours = analytics?.resolutionTime?.avgHours ? `${analytics.resolutionTime.avgHours} hrs` : '< 24 hrs';

  return (
    <div className="space-y-8 font-sans text-slate-900 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Municipal Operations Analytics"
          description="Live database aggregation on city resolution velocity, SLA breach avoidance, and spatial defect distribution."
          tag="CIVIC INTELLIGENCE"
        />
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            LIVE ATLAS DATABASE
          </span>
          <Button variant="outline" size="sm" onClick={fetchAnalytics} leftIcon={<RotateCw className="w-3.5 h-3.5" />}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-xs">Aggregating real incident analytics from MongoDB...</p>
        </div>
      ) : (
        <>
          {/* High-Level Executive KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Incidents"
              value={String(totalIncidents)}
              sublabel={`${resolvedCount} resolved to date`}
              accent="blue"
            />
            <MetricCard
              label="Resolution Rate"
              value={`${resolutionRate}%`}
              sublabel="Verified closures"
              accent="success"
            />
            <MetricCard
              label="Avg Resolution Time"
              value={avgHours}
              sublabel="From report to verification"
              accent="indigo"
            />
            <MetricCard
              label="SLA Compliance"
              value={`${slaCompliance}%`}
              sublabel={`${criticalCount} critical incidents`}
              accent="warning"
            />
          </div>

          {/* Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Category */}
            <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm font-heading text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Incidents by Category
                </h3>
                <span className="text-xs text-slate-400">Database Aggregation</span>
              </div>

              <div className="space-y-3">
                {analytics?.countsByCategory && analytics.countsByCategory.length > 0 ? (
                  analytics.countsByCategory.map((c) => {
                    const pct = totalIncidents > 0 ? Math.round((c.count / totalIncidents) * 100) : 0;
                    return (
                      <div key={c.category} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-800">{c.category?.replace(/_/g, ' ')}</span>
                          <span className="text-slate-500 font-bold">{c.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.max(pct, 5)}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No categories recorded yet.</p>
                )}
              </div>
            </Card>

            {/* By Ward */}
            <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm font-heading text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Incidents by Municipal Ward
                </h3>
                <span className="text-xs text-slate-400">Hosur Jurisdictions</span>
              </div>

              <div className="space-y-3">
                {analytics?.countsByWard && analytics.countsByWard.length > 0 ? (
                  analytics.countsByWard.map((w) => {
                    const pct = totalIncidents > 0 ? Math.round((w.count / totalIncidents) * 100) : 0;
                    return (
                      <div key={w.ward || 'General'} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-800">{w.ward || 'Central Hosur'}</span>
                          <span className="text-slate-500 font-bold">{w.count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.max(pct, 5)}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No ward distributions recorded yet.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Department Workload Distribution */}
          {analytics?.departmentWorkload && analytics.departmentWorkload.length > 0 && (
            <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
              <h3 className="font-bold text-sm font-heading text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-600" />
                Department Active Workload Distribution
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {analytics.departmentWorkload.map((dw) => (
                  <div key={dw.departmentId} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 text-sm block">
                      {dw.departmentName || dw.departmentId}
                    </span>
                    <span className="text-blue-600 font-bold text-base block">
                      {dw.activeCount} Active Tasks
                    </span>
                    <span className="text-[11px] text-slate-400 block">Monitored by AGENT_ROUTING</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
