import { cn, formatRelativeTime } from '@/lib/utils';
import { AgentExecution } from '@civicpulse/shared';
import { Cpu, ArrowUpRight, CheckCircle2, AlertCircle, Bot } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface ActivityFeedProps {
  executions: AgentExecution[];
  onSelectExecution?: (execution: AgentExecution) => void;
  className?: string;
}

export function ActivityFeed({
  executions,
  onSelectExecution,
  className,
}: ActivityFeedProps) {
  // Agent color accent mapping
  const getAgentTheme = (name: string) => {
    if (name.includes('Vision') || name.includes('Location')) {
      return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
    }
    if (name.includes('Duplicate') || name.includes('Pattern')) {
      return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
    }
    if (name.includes('Severity')) {
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
    }
    if (name.includes('Routing') || name.includes('Resolution')) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
    }
    return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
  };

  return (
    <div className={cn('space-y-3', className)}>
      {executions.map((exec) => {
        const isSuccess = exec.status === 'SUCCESS';
        const isFallback = exec.status === 'FALLBACK';
        const isFailed = exec.status === 'FAILED';
        const theme = getAgentTheme(exec.agentName);

        return (
          <div
            key={exec.id}
            onClick={() => onSelectExecution?.(exec)}
            className={cn(
              'p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-civic-card transition-all duration-150 cursor-pointer group',
              onSelectExecution && 'hover:border-blue-400'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className={cn('p-2 rounded-lg border text-xs shrink-0', theme.bg, theme.text, theme.border)}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-sans">
                    {exec.agentName}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans">
                    {formatRelativeTime(exec.startedAt)}
                  </p>
                </div>
              </div>

              <Badge
                variant={isSuccess ? 'success' : isFallback ? 'warning' : 'danger'}
                size="sm"
                className="font-sans font-semibold text-[10px]"
              >
                {exec.status}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans mt-1">
              {exec.reasoning}
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[11px] font-sans text-slate-400 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">
                  {exec.toolsCalled[0]?.toolName || 'executeWorkflow'}()
                </span>
                <span className="text-slate-400">({exec.durationMs}ms)</span>
              </div>

              {exec.incidentId && (
                <span className="text-slate-400 group-hover:text-blue-600 font-medium flex items-center gap-0.5 transition-colors">
                  {exec.incidentId}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

