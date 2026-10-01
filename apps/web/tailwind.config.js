/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Living City Master Color Palette (Fixed Master Prompt)
        ivory: '#F7F8F4',
        mist: '#EEF4F7',
        navy: {
          DEFAULT: '#102A43',
          dark: '#0A1B2A',
          deep: '#061320',
          light: '#243B53',
        },
        'slate-civic': '#526777',
        botanical: {
          DEFAULT: '#159A68',
          hover: '#128358',
          light: '#E7F7F0',
          dark: '#0D6846',
        },
        'civic-blue': {
          DEFAULT: '#2878E5',
          hover: '#1F65C7',
          light: '#EBF3FD',
          dark: '#1652A5',
        },
        'amber-civic': {
          DEFAULT: '#F2B84B',
          light: '#FEF8EC',
        },
        'coral-civic': {
          DEFAULT: '#EF6A63',
          light: '#FDEEED',
        },
        'green-civic': {
          DEFAULT: '#36B37E',
          light: '#EBF8F2',
        },
        // Clean Urban-Tech Core Brand Palette
        civic: {
          blue: {
            DEFAULT: '#2878E5',
            dark: '#1652A5',
            light: '#EBF3FD',
          },
          green: {
            DEFAULT: '#159A68',
            dark: '#0D6846',
            light: '#E7F7F0',
          },
          indigo: {
            DEFAULT: '#6366F1',
            dark: '#4F46E5',
            light: '#EEF2FF',
          },
          amber: '#F2B84B',
          red: '#EF6A63',
        },
        // CivicPulse Reference Palette
        brand: {
          bg: '#F7F8F4',
          surface: '#FFFFFF',
          text: '#102A43',
          muted: '#526777',
          border: '#E2E8EE',
          soft: '#EEF4F7',
          primary: '#159A68',
          success: '#36B37E',
          blue: '#2878E5',
          aqua: '#159A68',
          dark: '#102A43',
          darkVariant: '#0A1B2A',
        },
        // Clean Urban-Tech Workspace & Surfaces
        void: '#F8FAFC',
        workspace: '#F8FAFC',
        card: '#FFFFFF',
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
          overlay: 'rgba(15, 23, 42, 0.45)',
          muted: '#F8FAFC',
          dark: '#0F1B2D',
        },
        // Clean Slate Borders
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#E2E8F0',
          active: '#2563EB',
          hover: '#CBD5E1',
        },
        // Typography Slate System
        content: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        // Dedicated Dark AI Command Center Theme
        ai: {
          void: '#08111F',
          surface: '#0F1B2D',
          elevated: '#15243B',
          border: '#1E334A',
          text: '#F8FAFC',
          muted: '#94A3B8',
          blue: '#3B82F6',
          green: '#10B981',
          purple: '#8B5CF6',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        // Operational Statuses
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        // Semantic Severities
        severity: {
          low: '#2563EB',
          medium: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444',
        },
      },
      fontFamily: {
        manrope: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        sora: ['Manrope', 'Sora', 'sans-serif'],
        'dm-sans': ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'civic-card': '0 2px 8px rgba(15, 23, 42, 0.04)',
        'civic-hover': '0 8px 24px rgba(15, 23, 42, 0.08)',
        'civic-modal': '0 20px 50px rgba(15, 23, 42, 0.15)',
        // Retained for fallback compatibility
        'glow-cyan': '0 4px 12px rgba(37, 99, 235, 0.15)',
        'glow-purple': '0 4px 12px rgba(99, 102, 241, 0.15)',
        'glow-danger': '0 4px 12px rgba(239, 68, 68, 0.15)',
        'glass': '0 4px 16px 0 rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'card': '16px',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};
