import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight } from 'lucide-react';

export function PlaceholderView({
  title,
  description,
  module = 'Operations Workspace',
  backLink = '/manager/command-center',
  backLabel = 'Return to Command Center',
}: {
  title: string;
  description: string;
  module?: string;
  backLink?: string;
  backLabel?: string;
}) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <PageHeader
        title={title}
        description={description}
        tag={module.toUpperCase()}
      />

      <Card className="p-10 text-center space-y-4 max-w-xl mx-auto bg-white border border-slate-200 shadow-civic-card rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 mx-auto flex items-center justify-center">
          <Layers className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold font-heading text-slate-900">{title}</h3>
          <p className="text-slate-500 text-xs font-sans leading-relaxed">
            Connected to the real-time routing shell and ready for operational data binding.
          </p>
        </div>

        <div className="pt-3">
          <Link to={backLink}>
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {backLabel}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

