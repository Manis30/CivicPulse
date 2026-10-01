import React from 'react';

export function TimelineSkeleton() {
  return (
    <div className="space-y-6 pl-8 sm:pl-10 relative animate-pulse py-2">
      {/* Spine */}
      <div className="absolute left-3.5 sm:left-4 top-2 bottom-2 w-[2px] bg-[#E3EAE6] -translate-x-1/2" />

      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative space-y-2">
          {/* Node */}
          <div className="absolute -left-8 sm:-left-10 top-3 w-5 h-5 rounded-full bg-[#E3EAE6] ring-4 ring-white" />

          {/* Card Skeleton */}
          <div className="p-4 rounded-2xl bg-white border border-[#E3EAE6] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 bg-[#E3EAE6] rounded-md" />
              <div className="h-3 w-16 bg-[#E3EAE6] rounded-md" />
            </div>
            <div className="h-3 w-3/4 bg-[#FAF8F5] rounded-md" />
            <div className="h-3 w-1/2 bg-[#FAF8F5] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
