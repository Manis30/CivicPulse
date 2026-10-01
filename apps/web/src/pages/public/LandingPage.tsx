import React from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { WhyCivicPulseSection } from '@/components/landing/WhyCivicPulseSection';
import { OneReportWorkflowSection } from '@/components/landing/OneReportWorkflowSection';
import { AIAgentOrchestrationSection } from '@/components/landing/AIAgentOrchestrationSection';
import { WatchIncidentSolvedSection } from '@/components/landing/WatchIncidentSolvedSection';
import { ResolutionVerificationSection } from '@/components/landing/ResolutionVerificationSection';
import { CityIntelligenceSection } from '@/components/landing/CityIntelligenceSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

/**
 * CivicPulse Public Landing Page
 * Structure adheres strictly to the required 10-section narrative:
 * 01. NAVBAR
 * 02. CINEMATIC 3D CITY HERO
 * 03. WHY CIVICPULSE
 * 04. ONE REPORT → VERIFIED RESOLUTION
 * 05. AI AGENT ORCHESTRATION
 * 06. WATCH ONE INCIDENT GET SOLVED
 * 07. RESOLUTION VERIFICATION
 * 08. CITY INTELLIGENCE
 * 09. FINAL 3D CTA
 * 10. FOOTER
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#102A43] font-sans antialiased selection:bg-[#159A68] selection:text-white">
      {/* 01. NAVBAR */}
      <LandingNavbar />

      {/* 02. CINEMATIC 3D CITY HERO (Mapbox Standard 3D, 8-12s camera sequence, reduced editorial overlay) */}
      <HeroSection />

      {/* 03. WHY CIVICPULSE (Traditional triage vs autonomous resolution) */}
      <WhyCivicPulseSection />

      {/* 04. ONE REPORT → VERIFIED RESOLUTION (REPORT -> ANALYZE -> INVESTIGATE -> ACT -> VERIFY) */}
      <OneReportWorkflowSection />

      {/* 05. AI AGENT ORCHESTRATION (One orchestrator, 10 specialized agents mesh) */}
      <AIAgentOrchestrationSection />

      {/* 06. WATCH ONE INCIDENT GET SOLVED (Product demonstration: Pothole -> Vision -> Location -> ... -> Closed) */}
      <WatchIncidentSolvedSection />

      {/* 07. RESOLUTION VERIFICATION ("Resolved doesn't always mean solved." Before/After physical proof) */}
      <ResolutionVerificationSection />

      {/* 08. CITY INTELLIGENCE ("Every report leaves a measurable impact." 3 metrics + Hotspot visualization) */}
      <CityIntelligenceSection />

      {/* 09. FINAL 3D CTA (Civic resolution transition) */}
      <FinalCTASection />

      {/* 10. FOOTER (Minimal editorial footer) */}
      <LandingFooter />
    </div>
  );
}

export default LandingPage;
