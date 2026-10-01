import React, { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import {
  AdminPageHeader,
  AdminCard,
  AdminBadge,
} from '@/components/admin/primitives';
import {
  LuUser,
  LuShield,
  LuLock,
  LuCircleCheck,
  LuCalendar,
  LuMail,
  LuClock,
  LuBuilding2,
  LuSlidersHorizontal,
  LuBot,
  LuUsers,
  LuActivity,
  LuFileCheck,
} from 'react-icons/lu';

export function AdminProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(authService.getCurrentUser());

  useEffect(() => {
    let mounted = true;
    authService.me().then((user) => {
      if (mounted && user) {
        setCurrentUser(user);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const adminName = currentUser?.name || 'Dr. Sarah Chen';
  const adminEmail = currentUser?.email || 'sarah.chen@civicpulse.org';
  const role = currentUser?.role || 'PLATFORM_ADMIN';
  const departmentName =
    currentUser?.departmentId?.name ||
    currentUser?.department?.name ||
    (typeof currentUser?.departmentId === 'string'
      ? currentUser.departmentId
      : 'Platform Administration');

  const createdAt = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : 'September 2026';

  const lastLogin = currentUser?.lastLoginAt
    ? new Date(currentUser.lastLoginAt).toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : `18:42 / 30 Sep 2026`;

  const userInitials = (() => {
    const parts = adminName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0]?.slice(0, 2).toUpperCase() || 'SC';
  })();

  const adminPermissions = [
    {
      icon: LuBot,
      code: 'AGENT_FLEET_CONTROL',
      label: 'AI Agent Lifecycle & Calibration',
      desc: 'Create, pause, tune and validate specialist agents',
    },
    {
      icon: LuSlidersHorizontal,
      code: 'POLICY_GOVERNANCE',
      label: 'Algorithmic Threshold Modification',
      desc: 'Modify autonomous routing and severity thresholds',
    },
    {
      icon: LuUsers,
      code: 'RBAC_MANAGEMENT',
      label: 'User Governance & Role Granting',
      desc: 'Full platform user administration and operator delegation',
    },
    {
      icon: LuActivity,
      code: 'SYSTEM_INFRASTRUCTURE',
      label: 'Cluster Telemetry & Redis Queue',
      desc: 'Monitor runtime health, worker queues and circuit breakers',
    },
    {
      icon: LuFileCheck,
      code: 'AUDIT_LEDGER_IMMUTABLE',
      label: 'Cryptographic Audit Log Access',
      desc: 'Inspect immutable administrative records and system provenance',
    },
  ];

  const adminScopes = [
    'cluster:all',
    'agents:orchestrate',
    'policies:write',
    'audit:read',
    'users:admin',
    'departments:all',
    'incidents:dossier:override',
  ];

  return (
    <div className="w-full space-y-4 pb-8 font-sans text-[#F8FAFC]">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[rgba(148,163,184,0.1)]">
        <div>
          <h1 className="font-heading font-extrabold text-xl sm:text-[22px] text-[#F8FAFC] tracking-tight">
            Platform Administrator Profile
          </h1>
          <p className="text-xs text-[#94A3B8] font-normal leading-relaxed">
            Verified identity, access scope, security posture and administrative privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10.5px] font-mono font-bold text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            PLATFORM GOVERNANCE
          </span>
        </div>
      </div>

      {/* 2. COMPACT TWO-COLUMN ENTERPRISE PROFILE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full items-start">
        {/* LEFT COLUMN: IDENTITY (Top) + SECURITY & AUTH (Bottom) — ~320px on Desktop */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          {/* CARD 1: IDENTITY */}
          <AdminCard className="p-4 sm:p-4.5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.1)]">
              <div className="flex items-center gap-2">
                <LuUser className="w-3.5 h-3.5 text-[#5B5BF7]" />
                <h3 className="font-bold text-xs font-heading tracking-wide uppercase text-[#F8FAFC]">
                  Identity
                </h3>
              </div>
              <AdminBadge variant="success" size="sm" dot>
                ACTIVE & VERIFIED
              </AdminBadge>
            </div>

            {/* Avatar & Name Summary */}
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-[#5B5BF7] to-[#4338CA] border border-indigo-400/40 text-white font-extrabold text-lg font-heading flex items-center justify-center shadow-md shadow-indigo-950/40 shrink-0">
                {userInitials}
              </div>
              <div className="min-w-0">
                <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#F8FAFC] truncate leading-tight">
                  {adminName}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] text-[#22D3EE] font-semibold">
                    Platform Administrator
                  </span>
                  <span className="text-[#64748B] text-[10px]">•</span>
                  <span className="font-mono text-[9.5px] text-[#94A3B8]">
                    {role}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Metadata Rows */}
            <div className="space-y-2 pt-1 border-t border-[rgba(148,163,184,0.08)] text-[11.5px]">
              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                <span className="text-[#94A3B8] flex items-center gap-1.5 shrink-0">
                  <LuMail className="w-3.5 h-3.5 text-[#64748B]" />
                  EMAIL
                </span>
                <span className="text-[#F8FAFC] font-mono text-[11px] truncate max-w-[190px] select-all">
                  {adminEmail}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                <span className="text-[#94A3B8] flex items-center gap-1.5 shrink-0">
                  <LuBuilding2 className="w-3.5 h-3.5 text-[#64748B]" />
                  DEPARTMENT
                </span>
                <span className="text-[#F8FAFC] truncate max-w-[190px] font-medium" title={departmentName}>
                  {departmentName}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                <span className="text-[#94A3B8] flex items-center gap-1.5 shrink-0">
                  <LuCalendar className="w-3.5 h-3.5 text-[#64748B]" />
                  MEMBER SINCE
                </span>
                <span className="text-[#F8FAFC] font-mono text-[11px]">
                  {createdAt}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#94A3B8] flex items-center gap-1.5 shrink-0">
                  <LuClock className="w-3.5 h-3.5 text-[#64748B]" />
                  LAST LOGIN
                </span>
                <span className="text-[#38BDF8] font-mono text-[10.5px]">
                  {lastLogin}
                </span>
              </div>
            </div>
          </AdminCard>

          {/* CARD 2: SECURITY & AUTHENTICATION */}
          <AdminCard className="p-4 sm:p-4.5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[rgba(148,163,184,0.1)]">
              <LuLock className="w-3.5 h-3.5 text-[#F59E0B]" />
              <h3 className="font-bold text-xs font-heading tracking-wide uppercase text-[#F8FAFC]">
                Security & Authentication
              </h3>
            </div>

            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                <span className="text-[#94A3B8]">Authentication Mode</span>
                <span className="font-mono text-[#F8FAFC] text-[11px] font-semibold">
                  JWT Session + RBAC
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                <span className="text-[#94A3B8]">Active Sessions</span>
                <span className="text-emerald-400 font-bold font-mono text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  1 Active (This Device)
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.06)]">
                <span className="text-[#94A3B8]">Last Password Change</span>
                <span className="text-[#94A3B8] font-mono text-[11px]">14 days ago</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#94A3B8]">Session Security</span>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#13243A] text-[#38BDF8] border border-[#38BDF8]/30">
                  HTTPS-Only / Strict
                </span>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* RIGHT COLUMN: ACCESS & GOVERNANCE RIGHTS — Fills remaining width (flex-1) */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          <AdminCard className="p-4 sm:p-5 space-y-3.5">
            {/* Header: Access & Governance Rights */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(148,163,184,0.1)]">
              <div className="flex items-center gap-2">
                <LuShield className="w-4 h-4 text-[#818CF8]" />
                <h3 className="font-bold text-xs sm:text-sm font-heading tracking-wide uppercase text-[#F8FAFC]">
                  Access & Governance Rights
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/15 text-[#818CF8] border border-indigo-500/30">
                ROLE: SUPERUSER
              </span>
            </div>

            {/* Scope Chips Section */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] block">
                Granted Administrative Scopes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {adminScopes.map((scope) => (
                  <span
                    key={scope}
                    className="px-2 py-0.5 rounded-md text-[10.5px] font-mono bg-[#112138] hover:bg-[#162947] text-[#93C5FD] border border-[rgba(148,163,184,0.16)] transition-colors select-all"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            {/* 5 Compact Permission Rows (~44-48px each) */}
            <div className="space-y-2 pt-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] block">
                Privilege Enforcements:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {adminPermissions.map((perm) => {
                  const Icon = perm.icon;
                  return (
                    <div
                      key={perm.code}
                      className="px-3 py-2 rounded-xl bg-[#0C1A2E] hover:bg-[#0F223D] border border-[rgba(148,163,184,0.12)] flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#13243A] text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <LuCircleCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-xs text-[#F8FAFC] truncate">
                              {perm.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#94A3B8] truncate leading-tight mt-0.5">
                            {perm.desc}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono text-[9px] text-[#64748B] bg-[#07111F] px-1.5 py-0.5 rounded border border-[rgba(148,163,184,0.1)] shrink-0 hidden sm:inline-block">
                        {perm.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage;
