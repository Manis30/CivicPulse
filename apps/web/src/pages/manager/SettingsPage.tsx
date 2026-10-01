import { useState } from 'react';
import { PageHeader } from '@/components/data-display/DataDisplay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/Input';
import { Settings, Save, Shield, Bell, Database, CheckCircle2, Globe, Sliders } from 'lucide-react';

export function SettingsPage() {
  const [clusterName, setClusterName] = useState('Metro Cluster #04 (Downtown & Port)');
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [autoDispatchThreshold, setAutoDispatchThreshold] = useState('0.75');
  const [slaGraceMins, setSlaGraceMins] = useState('30');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-16 max-w-4xl mx-auto">
      <PageHeader
        title="Operations Workspace Settings"
        description="Configure municipal cluster boundaries, automated triage triggers, and enterprise integration credentials."
        tag="SYSTEM CONFIG"
      />

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration updated successfully across active workers.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Cluster & Jurisdiction */}
        <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold font-heading text-sm">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Municipal Jurisdiction & Cluster</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Assigned City Operations Cluster">
              <Input
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
              />
            </FormField>

            <FormField label="Local Timezone & Clocks">
              <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="America/New_York (EST)">America/New_York (EST)</option>
                <option value="America/Chicago (CST)">America/Chicago (CST)</option>
                <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              </Select>
            </FormField>
          </div>
        </Card>

        {/* Autonomous AI Dispatch Triggers */}
        <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold font-heading text-sm">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Autonomous Triage & Dispatch Automation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Auto-Dispatch Severity Threshold (0.00 - 1.00)">
              <Input
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={autoDispatchThreshold}
                onChange={(e) => setAutoDispatchThreshold(e.target.value)}
              />
            </FormField>

            <FormField label="SLA Breach Warning Grace Period (Minutes)">
              <Input
                type="number"
                value={slaGraceMins}
                onChange={(e) => setSlaGraceMins(e.target.value)}
              />
            </FormField>
          </div>
        </Card>

        {/* External Systems & Export Hooks */}
        <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold font-heading text-sm">
            <Database className="w-4 h-4 text-blue-600" />
            <span>External BI Integrations</span>
          </div>

          <FormField label="Domo Business Intelligence Webhook URL">
            <Input
              defaultValue="https://api.domo.com/v1/datasets/civicpulse-telemetry/push"
              placeholder="https://api.domo.com/..."
            />
          </FormField>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary">Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Operations Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
