import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserRole } from '@civicpulse/shared';
import { authService } from '@/services/authService';

/**
 * Maps a UserRole to the portal path that role is allowed to access.
 */
export function getPortalForRole(role: UserRole): string {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return '/admin';
    case 'DEPARTMENT_MANAGER':
      return '/manager';
    case 'FIELD_OFFICER':
      return '/officer';
    case 'CITIZEN':
      return '/citizen';
    default:
      return '/';
  }
}

// ---------- Shared Auth Status Hook ----------

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  role: UserRole | null;
  user: ReturnType<typeof authService.getCurrentUser>;
}

export function useAuthStatus(): AuthState {
  // Synchronous initial read to avoid any flash of unauthenticated/loading state
  const readCurrentState = useCallback((): AuthState => {
    const cached = authService.getCurrentUser();
    if (cached && cached.role) {
      return {
        status: 'authenticated',
        role: cached.role as UserRole,
        user: cached,
      };
    }
    return {
      status: 'loading',
      role: null,
      user: null,
    };
  }, []);

  const [state, setState] = useState<AuthState>(readCurrentState);

  useEffect(() => {
    let mounted = true;

    const syncState = () => {
      if (!mounted) return;
      const current = readCurrentState();
      setState(current);
    };

    // Listen for custom auth events and cross-tab storage changes
    window.addEventListener('civicpulse_auth_changed', syncState);
    window.addEventListener('storage', syncState);

    // Initial check: if not cached, try cookie-based session verification with server
    const cached = authService.getCurrentUser();
    if (!cached) {
      authService
        .me()
        .then((remote) => {
          if (!mounted) return;
          if (remote && remote.role) {
            setState({
              status: 'authenticated',
              role: remote.role as UserRole,
              user: remote,
            });
          } else {
            setState({
              status: 'unauthenticated',
              role: null,
              user: null,
            });
          }
        })
        .catch(() => {
          if (mounted) {
            setState({
              status: 'unauthenticated',
              role: null,
              user: null,
            });
          }
        });
    } else {
      // Background re-validation for cached session
      authService
        .me()
        .then((remote) => {
          if (!mounted) return;
          if (!remote) {
            // Session revoked or expired on server
            authService.logout();
            setState({
              status: 'unauthenticated',
              role: null,
              user: null,
            });
          } else if (remote.role !== state.role) {
            setState({
              status: 'authenticated',
              role: remote.role as UserRole,
              user: remote,
            });
          }
        })
        .catch(() => {
          // If network error, retain local cache
        });
    }

    return () => {
      mounted = false;
      window.removeEventListener('civicpulse_auth_changed', syncState);
      window.removeEventListener('storage', syncState);
    };
  }, [readCurrentState, state.role]);

  return state;
}

// ---------- ProtectedRoute ----------

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Exact roles allowed to access this route. No cross-portal access. */
  allowedRoles: UserRole[];
}

/**
 * Route guard for authenticated portal pages.
 *
 * - NOT authenticated → redirect to /auth/login
 * - Authenticated but WRONG role → redirect to the user's OWN respective portal
 * - Authenticated + correct role → render children
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { status, role } = useAuthStatus();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07111F] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider uppercase text-slate-400">Verifying session…</span>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page with return state
  if (status === 'unauthenticated' || !role) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but visiting another user role's portal (e.g. Admin visiting /citizen),
  // immediately bounce them back to their own assigned portal!
  if (!allowedRoles.includes(role)) {
    return <Navigate to={getPortalForRole(role)} replace />;
  }

  return <>{children}</>;
}

// ---------- GuestRoute ----------

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard for public auth pages (login, register, forgot-password).
 *
 * - Authenticated → redirect to user's portal (user CANNOT visit login while logged in)
 * - NOT authenticated → render children (show login/register form)
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { status, role } = useAuthStatus();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-sans text-slate-500">Checking session…</span>
        </div>
      </div>
    );
  }

  // If already authenticated, user cannot navigate to login page through URL — redirect to their portal!
  if (status === 'authenticated' && role) {
    return <Navigate to={getPortalForRole(role)} replace />;
  }

  return <>{children}</>;
}

// ---------- RootRoute ----------

interface RootRouteProps {
  children: React.ReactNode;
}

/**
 * RootRoute:
 * - If token is present (authenticated): redirect to the user's respective portal
 * - If no token (unauthenticated): render public landing page
 */
export function RootRoute({ children }: RootRouteProps) {
  const { status, role } = useAuthStatus();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F8F4] text-[#102A43]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#159A68]/40 border-t-[#159A68] rounded-full animate-spin" />
          <span className="text-xs font-sans text-[#526777]">Loading CivicPulse…</span>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && role) {
    return <Navigate to={getPortalForRole(role)} replace />;
  }

  return <>{children}</>;
}
