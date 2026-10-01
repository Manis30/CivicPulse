import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ArrowRight, User, HardHat, Compass, Bot, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { getPortalForRole } from '@/components/auth/ProtectedRoute';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper to quickly fill the email field — does NOT auto-login.
  // The user MUST still supply their password and submit the form.
  const handleSelectRoleEmail = (roleEmail: string) => {
    setEmail(roleEmail);
    setError(null);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await authService.login(email.trim(), password);
      navigate(getPortalForRole(user.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
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
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form — Required for Authentication */}
        <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <FormField label="Email Address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@civicpulse.org"
                required
                autoComplete="email"
              />
            </FormField>

            <FormField label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
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
                  <span>Verifying Credentials...</span>
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

        {/* Demo Accounts Reference — Fills email only, user must provide password */}
        <Card className="p-4 bg-slate-50 border border-slate-200 shadow-xs rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
            <div className="flex items-center gap-1.5 text-slate-700">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-heading">
                Demo Accounts Reference
              </span>
            </div>
            <span className="text-[10.5px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              Pass: Password123!
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
            Click any account to fill its email address. Enter the password above to authenticate:
          </p>

          <div className="grid grid-cols-2 gap-1.5 text-xs font-sans">
            <button
              type="button"
              onClick={() => handleSelectRoleEmail('manager.chen@civicpulse.org')}
              className={`p-2 rounded-xl text-left transition-all flex items-center gap-2 border ${
                email === 'manager.chen@civicpulse.org'
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">Manager</p>
                <p className="text-[10px] text-slate-400 truncate">manager.chen</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleEmail('citizen.elena@civicpulse.org')}
              className={`p-2 rounded-xl text-left transition-all flex items-center gap-2 border ${
                email === 'citizen.elena@civicpulse.org'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">Citizen</p>
                <p className="text-[10px] text-slate-400 truncate">citizen.elena</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleEmail('officer.vance@civicpulse.org')}
              className={`p-2 rounded-xl text-left transition-all flex items-center gap-2 border ${
                email === 'officer.vance@civicpulse.org'
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <HardHat className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">Field Officer</p>
                <p className="text-[10px] text-slate-400 truncate">officer.vance</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleEmail('admin.miller@civicpulse.org')}
              className={`p-2 rounded-xl text-left transition-all flex items-center gap-2 border ${
                email === 'admin.miller@civicpulse.org'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">Admin</p>
                <p className="text-[10px] text-slate-400 truncate">admin.miller</p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
