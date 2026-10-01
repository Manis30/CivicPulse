import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  HardHat,
  BarChart3,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const ROLES = [
  {
    id: 'citizen',
    title: 'CITIZENS',
    headline: 'Report problems and follow progress.',
    description: 'Citizens snap photos, receive instant confirmation, and track real-time resolution from municipal ward crews.',
    features: [
      'Instant mobile photo upload & GPS geostamp',
      'Live timeline notifications on field repairs',
      'Direct municipal accountability without bureaucracy',
    ],
    cta: 'Open Citizen Portal',
    link: '/citizen',
    badge: 'Civic Experience',
    style: {
      cardBg: 'bg-white',
      border: 'border-[#E1E4F5]',
      accent: '#5B5BF5',
      badgeBg: 'bg-[#ECEDFF] text-[#5B5BF5]',
      btnBg: 'bg-[#5B5BF5] hover:bg-[#4848E0] text-white',
    },
  },
  {
    id: 'officer',
    title: 'FIELD TEAMS',
    headline: 'Know what needs attention and where.',
    description: 'Municipal repair crews receive organized digital work orders with turn-by-turn navigation and material lists.',
    features: [
      'Turn-by-turn dispatch to verified coordinates',
      'Clear damage assessment & required tools',
      'One-tap photo submission for autonomous AI audit',
    ],
    cta: 'View Officer Tasks',
    link: '/officer/tasks',
    badge: 'Ground Operations',
    style: {
      cardBg: 'bg-white',
      border: 'border-[#E1E4F5]',
      accent: '#0F7D5A',
      badgeBg: 'bg-[#ECFDF5] text-[#0F7D5A]',
      btnBg: 'bg-[#0F7D5A] hover:bg-[#0A6246] text-white',
    },
  },
  {
    id: 'manager',
    title: 'CITY MANAGERS',
    headline: 'Understand incidents, priorities and workload.',
    description: 'Ward commissioners and department heads monitor city health, department SLAs, and operational dispatch velocities.',
    features: [
      'Live 3D command center across all 18 wards',
      'Real-time SLA breach tracking & team allocation',
      'Cross-department resource optimization',
    ],
    cta: 'Access Command Center',
    link: '/manager/command-center',
    badge: 'Municipal Cockpit',
    style: {
      cardBg: 'bg-white',
      border: 'border-[#E1E4F5]',
      accent: '#3E8BFF',
      badgeBg: 'bg-[#EFF6FF] text-[#3E8BFF]',
      btnBg: 'bg-[#3E8BFF] hover:bg-[#2575EB] text-white',
    },
  },
  {
    id: 'ai-admin',
    title: 'CIVICPULSE AI',
    headline: 'Continuously analyzes and routes civic activity.',
    description: 'Five specialized agents run 24/7 to classify imagery, deduplicate complaints, and verify contractor resolutions.',
    features: [
      'Zero manual triaging bottlenecks or backlog',
      'Deterministic fraud & duplicate detection',
      'Transparent audit log for complete civic trust',
    ],
    cta: 'Explore AI Command',
    link: '/admin/agents',
    badge: 'Autonomous Engine',
    style: {
      cardBg: 'bg-[#0A1236]',
      border: 'border-[#5B5BF5]/30',
      accent: '#22C3B0',
      badgeBg: 'bg-[#5B5BF5]/20 text-[#22C3B0]',
      btnBg: 'bg-[#5B5BF5] hover:bg-[#4848E0] text-white shadow-lg shadow-[#5B5BF5]/25',
      dark: true,
    },
  },
];

export function RoleSection() {
  return (
    <section id="perspectives" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECEDFF] text-[#5B5BF5] text-xs font-bold tracking-wider uppercase font-heading">
            UNIFIED CIVIC ECOSYSTEM
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0E1330] font-heading tracking-tight">
            One city. Different perspectives.
          </h2>
          <p className="text-base sm:text-lg text-[#5E6485] font-sans leading-relaxed">
            From the resident reporting a leak to the field engineer fixing a road, CivicPulse delivers the exact right interface for every municipal participant.
          </p>
        </div>

        {/* 4 Distinct Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role) => (
            <div
              key={role.id}
              className={`rounded-3xl p-6 sm:p-7 border ${role.style.border} ${role.style.cardBg} flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group`}
            >
              <div>
                {/* Card Top: Role Badge & Title */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${role.style.badgeBg}`}>
                    {role.badge}
                  </span>
                  <span className={`font-mono text-xs font-bold ${role.style.dark ? 'text-slate-400' : 'text-slate-400'}`}>
                    {role.title}
                  </span>
                </div>

                {/* Headline */}
                <h3 className={`font-heading font-bold text-lg leading-snug mb-3 ${role.style.dark ? 'text-white' : 'text-[#0E1330]'}`}>
                  {role.headline}
                </h3>

                {/* Description */}
                <p className={`text-xs font-sans leading-relaxed mb-6 ${role.style.dark ? 'text-slate-300' : 'text-[#5E6485]'}`}>
                  {role.description}
                </p>

                {/* Feature Bullet List */}
                <div className="space-y-2 mb-6">
                  {role.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle
                        className="w-3.5 h-3.5 shrink-0 mt-0.5"
                        style={{ color: role.style.accent }}
                      />
                      <span className={role.style.dark ? 'text-slate-300' : 'text-[#0E1330]'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-black/5 dark:border-white/10">
                <Link to={role.link}>
                  <button
                    className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 group-hover:shadow-md ${role.style.btnBg}`}
                  >
                    <span>{role.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
