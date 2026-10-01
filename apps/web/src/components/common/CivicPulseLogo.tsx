import React from 'react';
import { cn } from '@/lib/utils';

export interface CivicPulseLogoProps {
  size?: number;
  className?: string;
  variant?: 'brand' | 'white' | 'monochrome' | 'admin';
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function CivicPulseLogo({
  size = 36,
  className,
  variant = 'brand',
  showWordmark = false,
  wordmarkClassName,
}: CivicPulseLogoProps) {
  const isWhite = variant === 'white';
  const isMono = variant === 'monochrome';
  const isAdmin = variant === 'admin';

  // Semantic color mappings
  const arcColor = isMono ? 'currentColor' : isAdmin ? '#6366F1' : isWhite ? '#36B37E' : '#159A68';
  const primaryTowerColor = isMono ? 'currentColor' : isAdmin ? '#6366F1' : isWhite ? '#36B37E' : '#159A68';
  const secondaryTowerColor = isMono ? 'currentColor' : isAdmin ? '#22D3EE' : isWhite ? 'rgba(255, 255, 255, 0.85)' : '#102A43';
  const beaconColor = isMono ? 'currentColor' : isAdmin ? '#22D3EE' : '#36B37E';

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      {/* Geometric SVG Brand Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-visible"
        aria-hidden="true"
      >
        {/* Civic 'C' Signal Arc */}
        <path
          d="M 35 12 C 27.5 6 17 6.5 11 13 C 4.5 20 4.5 28 11 35 C 17 41.5 27.5 42 35 36"
          stroke={arcColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Architectural City Silhouette Towers */}
        <rect
          x="16"
          y="22"
          width="4.5"
          height="11"
          rx="1.5"
          fill={secondaryTowerColor}
        />
        <rect
          x="22.5"
          y="14"
          width="5"
          height="19"
          rx="1.5"
          fill={primaryTowerColor}
        />
        <rect
          x="29.5"
          y="19"
          width="4.5"
          height="14"
          rx="1.5"
          fill={secondaryTowerColor}
        />

        {/* Active Civic Pulse Beacon Node */}
        <circle cx="37" cy="24" r="3" fill={beaconColor} />
      </svg>

      {/* Optional Brand Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            'font-heading font-bold text-[19px] tracking-tight leading-none',
            isAdmin ? 'text-white' : isWhite ? 'text-white' : 'text-[#102A43]',
            wordmarkClassName
          )}
        >
          Civic<span className={isAdmin ? 'text-[#818CF8]' : 'text-[#36B37E]'}>Pulse</span>
        </span>
      )}
    </div>
  );
}

export default CivicPulseLogo;
