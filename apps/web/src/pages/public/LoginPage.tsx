import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, User, HardHat, Compass, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { UserRole } from '@civicpulse/shared';
import { getPortalForRole } from '@/components/auth/ProtectedRoute';

export function LoginPage() {
  const [email, setEmail] = useState('manager.chen@civicpulse.org');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.switchRole(role);
      navigate(getPortalForRole(user.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Role authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authService.login(email, password);
      navigate(getPortalForRole(user.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#F8FAFC] font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white shadow-civic-card">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Sign In to CivicPulse
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Clean Urban-Tech Civic Operations & Autonomous Triage
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Role Switcher for Seamless Demonstration */}
        <Card className="p-5 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-heading">
              1-Click Verified Role Login
            </span>
            <span className="text-[11px] text-slate-400">Authentic JWT Session</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-sans">
            <button
              onClick={() => handleRoleSwitch('DEPARTMENT_MANAGER')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-left transition-all flex items-center gap-2.5 group disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 group-hover:text-blue-700">Manager</p>
                <p className="text-[10px] text-slate-500 truncate">Command Center</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitch('CITIZEN')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left transition-all flex items-center gap-2.5 group disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 group-hover:text-emerald-700">Citizen</p>
                <p className="text-[10px] text-slate-500 truncate">Report & Track</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitch('FIELD_OFFICER')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-left transition-all flex items-center gap-2.5 group disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <HardHat className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 group-hover:text-amber-800">Field Officer</p>
                <p className="text-[10px] text-slate-500 truncate">Tasks & Evidence</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSwitch('PLATFORM_ADMIN')}
              disabled={loading}
              className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-left transition-all flex items-center gap-2.5 group disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 group-hover:text-indigo-700">Admin</p>
                <p className="text-[10px] text-slate-500 truncate">AI Command</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Standard Credentials Form */}
        <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <FormField label="Email Address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@civicpulse.org"
                required
              />
            </FormField>

            <FormField label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </FormField>

            <div className="flex items-center justify-between text-xs font-sans">
              <Link to="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
              <Link to="/auth/register" className="text-emerald-700 font-semibold hover:underline">
                Register as Citizen
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
