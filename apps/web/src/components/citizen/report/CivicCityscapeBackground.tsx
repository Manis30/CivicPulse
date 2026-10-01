import React from 'react';

export interface CivicCityscapeBackgroundProps {
  className?: string;
}

/**
 * CivicCityscapeBackground
 * Shared full-viewport atmospheric cityscape background for CivicPulse.
 * Utilizes the official CivicPulse cityscape asset (/assets/images/civicpulse_cityscape_bg.png)
 * shared consistently across:
 * 1. Report Loading / AI Processing page
 * 2. Report Submitted / Incident Confirmation page
 */
export function CivicCityscapeBackground({ className = '' }: CivicCityscapeBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-[#F7F8F4] ${className}`}
    >
      <img
        src="/assets/images/civicpulse_cityscape_bg.png"
        alt=""
        className="w-full h-full object-cover object-bottom"
        loading="eager"
        decoding="sync"
      />
    </div>
  );
}

export const CivicLoadingCityscape = CivicCityscapeBackground;
export default CivicCityscapeBackground;
