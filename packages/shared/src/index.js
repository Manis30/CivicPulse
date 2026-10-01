"use strict";
/**
 * CivicPulse - Enterprise Shared Types & Domain Models
 * Authoritative system contracts for Frontend and Backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_STATUS_TRANSITIONS = exports.CIVIC_DESIGN_TOKENS = void 0;
// ==========================================
// 8. Design Tokens & System Constants
// ==========================================
exports.CIVIC_DESIGN_TOKENS = {
    colors: {
        bgVoid: '#05070B',
        bgSurface: '#0B1017',
        bgSurfaceElevated: '#111827',
        bgSurfaceOverlay: 'rgba(17, 24, 39, 0.75)',
        borderSubtle: 'rgba(255, 255, 255, 0.08)',
        borderActive: 'rgba(56, 189, 248, 0.35)',
        accentCyan: '#0EA5E9',
        accentPurple: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#F43F5E',
    },
    severityColors: {
        LOW: '#0EA5E9', // neutral / cyan
        MEDIUM: '#F59E0B', // amber
        HIGH: '#F97316', // orange / danger
        CRITICAL: '#F43F5E', // rose / red
    },
    statusColors: {
        SUBMITTED: '#64748B',
        ANALYZING: '#8B5CF6',
        VALIDATED: '#0EA5E9',
        ASSIGNED: '#38BDF8',
        IN_PROGRESS: '#F59E0B',
        RESOLVED: '#10B981',
        VERIFYING: '#8B5CF6',
        CLOSED: '#059669',
        REOPENED: '#F43F5E',
    }
};
exports.VALID_STATUS_TRANSITIONS = {
    SUBMITTED: ['ANALYZING'],
    ANALYZING: ['VALIDATED'],
    VALIDATED: ['ASSIGNED'],
    ASSIGNED: ['IN_PROGRESS'],
    IN_PROGRESS: ['RESOLVED'],
    RESOLVED: ['VERIFYING'],
    VERIFYING: ['CLOSED', 'REOPENED'],
    REOPENED: ['ASSIGNED'],
    CLOSED: [] // Terminal state in standard state machine
};
