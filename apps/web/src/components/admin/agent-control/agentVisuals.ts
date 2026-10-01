import React from 'react';
import { AgentTelemetry } from '@/services/adminService';
import {
  LuCamera,
  LuMapPin,
  LuLayers,
  LuTriangleAlert,
  LuGitFork,
  LuSearch,
  LuSettings,
  LuShieldCheck,
  LuBell,
  LuGlobe,
  LuBot,
} from 'react-icons/lu';

export interface AgentVisualConfig {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  accentBorder: string;
  glowColor: string;
  badgeBg: string;
  badgeText: string;
}

export const AGENT_VISUALS: Record<string, AgentVisualConfig> = {
  AGENT_VISION: {
    icon: LuCamera,
    color: '#38BDF8', // Cyan / Sky
    accentBorder: 'border-cyan-500/40',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
  },
  AGENT_LOCATION: {
    icon: LuMapPin,
    color: '#A855F7', // Purple
    accentBorder: 'border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
  },
  AGENT_DUPLICATE: {
    icon: LuLayers,
    color: '#F59E0B', // Amber
    accentBorder: 'border-amber-500/40',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
  },
  AGENT_SEVERITY: {
    icon: LuTriangleAlert,
    color: '#F43F5E', // Rose / Red
    accentBorder: 'border-rose-500/40',
    glowColor: 'rgba(244, 63, 94, 0.35)',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
  },
  AGENT_ROUTING: {
    icon: LuGitFork,
    color: '#6366F1', // Indigo
    accentBorder: 'border-indigo-500/40',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
  },
  AGENT_INVESTIGATION: {
    icon: LuSearch,
    color: '#0EA5E9', // Electric Blue
    accentBorder: 'border-sky-500/40',
    glowColor: 'rgba(14, 165, 233, 0.35)',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
  },
  AGENT_OPERATIONS: {
    icon: LuSettings,
    color: '#EC4899', // Pink / Operations
    accentBorder: 'border-pink-500/40',
    glowColor: 'rgba(236, 72, 153, 0.35)',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-400',
  },
  AGENT_VERIFICATION: {
    icon: LuShieldCheck,
    color: '#10B981', // Emerald Green
    accentBorder: 'border-emerald-500/40',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
  },
  AGENT_NOTIFICATION: {
    icon: LuBell,
    color: '#06B6D4', // Teal Cyan
    accentBorder: 'border-teal-500/40',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
  },
  AGENT_INTELLIGENCE: {
    icon: LuGlobe,
    color: '#14B8A6', // Mint Teal
    accentBorder: 'border-teal-500/40',
    glowColor: 'rgba(20, 184, 166, 0.35)',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
  },
};

export function getAgentVisual(agentId: string): AgentVisualConfig {
  return (
    AGENT_VISUALS[agentId] || {
      icon: LuBot,
      color: '#818CF8',
      accentBorder: 'border-indigo-500/30',
      glowColor: 'rgba(129, 140, 248, 0.25)',
      badgeBg: 'bg-indigo-500/10',
      badgeText: 'text-indigo-400',
    }
  );
}

// Relative node coordinates around 1000x600 viewBox for the network diagram
export interface AgentPosition {
  agentId: string;
  x: number; // percentage or viewBox coordinate
  y: number;
}

export const NETWORK_NODE_LAYOUT: Record<string, { x: number; y: number }> = {
  // Top center
  AGENT_VISION: { x: 500, y: 75 },
  // Left side
  AGENT_LOCATION: { x: 260, y: 140 },
  AGENT_INVESTIGATION: { x: 230, y: 285 },
  AGENT_OPERATIONS: { x: 240, y: 430 },
  AGENT_VERIFICATION: { x: 330, y: 535 },
  // Right side
  AGENT_DUPLICATE: { x: 740, y: 140 },
  AGENT_SEVERITY: { x: 770, y: 285 },
  AGENT_ROUTING: { x: 760, y: 430 },
  AGENT_NOTIFICATION: { x: 670, y: 535 },
  // Bottom center
  AGENT_INTELLIGENCE: { x: 500, y: 550 },
};
