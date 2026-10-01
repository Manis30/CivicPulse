import React from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { motion } from 'framer-motion';

interface ReportTopNavProps {
  currentStep: number;
  totalSteps?: number;
  stepName?: string;
  onBack?: () => void;
}

export function ReportTopNav({
  currentStep = 1,
  totalSteps = 5,
  stepName = 'CATEGORY',
  onBack,
}: ReportTopNavProps) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE6]/70 gap-4 select-none">
      {/* Left: Back button + Editorial Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-[#E3EAE6] text-[#526777] hover:text-[#102A43] hover:border-[#159A68]/40 hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-2xs group"
            title="Go Back"
          >
            <LuArrowLeft className="w-4 h-4 text-[#526777] group-hover:text-[#159A68] transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-[24px] text-[#102A43] tracking-tight leading-[1.2]">
              Report a Problem
            </h1>
            <span className="w-2 h-2 rounded-full bg-[#159A68]" />
          </div>
          <p className="text-[14px] text-[#526777] font-normal leading-[1.45]">
            Help your city identify, verify, and resolve municipal issues.
          </p>
        </div>
      </div>

      {/* Right: Step Indicator Badge */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E3EAE6] shadow-2xs text-[11px] font-heading">
          <span className="font-bold text-[#159A68]">
            STEP {currentStep} / {totalSteps}
          </span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="font-extrabold text-[#102A43] uppercase tracking-wider">
            {stepName}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReportTopNav;
