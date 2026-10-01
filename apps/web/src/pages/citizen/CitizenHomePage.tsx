import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CitizenHero } from '@/components/citizen/CitizenHero';
import { CitizenStats } from '@/components/citizen/CitizenStats';
import { RecentReportsCard } from '@/components/citizen/RecentReportsCard';
import { NearbyIssuesCard } from '@/components/citizen/NearbyIssuesCard';
import { LatestUpdatesCard } from '@/components/citizen/LatestUpdatesCard';
import { useIncidents } from '@/contexts/IncidentContext';
import { CitizenContentContainer } from '@/components/citizen/CitizenContentContainer';

export function CitizenHomePage() {
  const { incidents, loading } = useIncidents();
  const shouldReduceMotion = useReducedMotion();

  return (
    <CitizenContentContainer className="space-y-0">
      {/* 1. Greeting Hero with Realistic Aerial City Visual (Entrance: 0ms) */}
      <motion.section
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="mb-4.5 sm:mb-5"
      >
        <CitizenHero />
      </motion.section>

      {/* 2. Four Status Metric Cards with Animated Counters & Sparklines (Entrance: 200ms) */}
      <motion.section
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
        className="mb-4.5 sm:mb-5"
      >
        <CitizenStats incidents={incidents} loading={loading} />
      </motion.section>

      {/* 3. Main 2-Column Content Grid: 16-20px gap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column (Approx 65% width): My Recent Civic Reports (Entrance: 350ms) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35, ease: 'easeOut' }}
          className="lg:col-span-7 xl:col-span-8"
        >
          <RecentReportsCard incidents={incidents} loading={loading} />
        </motion.div>

        {/* Right Column (Approx 35% width): Issues Near You & Latest Updates */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 sm:space-y-5">
          {/* Nearby Issues (Entrance: 450ms) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45, ease: 'easeOut' }}
          >
            <NearbyIssuesCard />
          </motion.div>

          {/* Latest Updates (Entrance: 550ms) */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }}
          >
            <LatestUpdatesCard />
          </motion.div>
        </div>
      </div>
    </CitizenContentContainer>
  );
}

export default CitizenHomePage;
