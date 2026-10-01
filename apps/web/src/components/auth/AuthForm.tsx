import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Activity } from 'lucide-react';
import { authService } from '@/services/authService';
import { getPortalForRole } from '@/components/auth/ProtectedRoute';
import { DemoAccountPanel } from './DemoAccountPanel';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSelectEmail = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Authenticates with backend using HttpOnly cookie / JWT verification
      const user = await authService.login(email.trim(), password);
      // Seamless redirect to user's authorized role portal
      navigate(getPortalForRole(user.role), { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-[420px] mx-auto space-y-6"
    >
      {/* Header: Human-Centered Greeting */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EEF4F7] text-[#102A43] text-xs font-semibold font-sans mb-1">
          <Activity className="w-3.5 h-3.5 text-[#2878E5]" />
          <span>Civic Operations Portal</span>
        </div>

        <h1 className="text-3xl font-bold font-heading text-[#102A43] tracking-tight leading-tight">
          Welcome back
        </h1>
        <p className="text-sm text-[#526777] font-sans">
          Sign in to continue to your CivicPulse workspace.
        </p>
      </div>

      {/* Accessible Inline Error Message */}
      {error && (
        <div
          role="alert"
          className="p-3 bg-[#EF6A63]/10 border border-[#EF6A63]/30 text-[#B91C1C] text-xs rounded-xl flex items-start gap-2.5 font-medium font-sans animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#EF6A63] mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="auth-email"
            className="block text-xs font-semibold text-[#102A43] tracking-wide font-sans"
          >
            Email address
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            className="w-full h-12 bg-white border border-[#D9E2EC] rounded-xl px-3.5 text-sm text-[#102A43] placeholder-slate-400 font-sans focus:outline-none focus:border-[#2878E5] focus:ring-2 focus:ring-[#2878E5]/15 transition-all duration-150 disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Password with Show/Hide & Forgot Link */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-[#102A43] tracking-wide font-sans"
            >
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-[#526777] hover:text-[#2878E5] transition-colors font-medium font-sans"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full h-12 bg-white border border-[#D9E2EC] rounded-xl pl-3.5 pr-11 text-sm text-[#102A43] placeholder-slate-400 font-sans focus:outline-none focus:border-[#2878E5] focus:ring-2 focus:ring-[#2878E5]/15 transition-all duration-150 disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-[#2878E5] rounded-md transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#2878E5] hover:bg-[#1F65C7] active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-xs transition-all duration-150 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2878E5] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 font-sans"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4 text-white/90" />
            </>
          )}
        </button>
      </form>

      {/* Secondary Action: Citizen Registration */}
      <div className="text-center pt-1">
        <p className="text-xs text-[#526777] font-sans">
          New to CivicPulse?{' '}
          <Link
            to="/auth/register"
            className="text-[#2878E5] font-semibold hover:text-[#1F65C7] hover:underline transition-colors"
          >
            Register as Citizen
          </Link>
        </p>
      </div>

      {/* Compact Development/Demo Profile Helper (Hidden in Production) */}
      <DemoAccountPanel currentEmail={email} onSelectEmail={handleSelectEmail} />
    </motion.div>
  );
}
