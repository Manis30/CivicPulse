import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resToken = await authService.forgotPassword(email);
      setMessage('Password recovery token generated successfully.');
      if (resToken && resToken.length > 20) {
        setToken(resToken);
      }
    } catch (err: any) {
      setError(err.message || 'Recovery request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#F8FAFC] font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-civic-card">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Password Recovery
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Enter your registered email to receive a secure recovery token
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <Card className="p-6 bg-white border border-slate-200 shadow-civic-card rounded-2xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Registered Email Address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@civicpulse.org"
                required
              />
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Request Reset Token</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {token && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <p className="text-xs font-bold text-indigo-900">Your Password Reset Token:</p>
                <code className="text-[11px] block break-all bg-white p-2 rounded border border-indigo-100 text-indigo-800 font-mono">
                  {token}
                </code>
                <Link
                  to={`/auth/reset-password?token=${encodeURIComponent(token)}`}
                  className="inline-block text-xs font-bold text-indigo-700 hover:underline"
                >
                  Proceed to Reset Password &rarr;
                </Link>
              </div>
            )}

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Remember your password?{' '}
              <Link to="/auth/login" className="text-blue-600 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
