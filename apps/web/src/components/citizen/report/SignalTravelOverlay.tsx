import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SignalTravelOverlayProps {
  originRect: DOMRect | null;
  targetRect: DOMRect | null;
  onArrive?: () => void;
}

export function SignalTravelOverlay({
  originRect,
  targetRect,
  onArrive,
}: SignalTravelOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!originRect || !targetRect) return;

    if (shouldReduceMotion) {
      if (onArrive) onArrive();
      return;
    }

    setIsActive(true);
    const timer = setTimeout(() => {
      setIsActive(false);
      if (onArrive) onArrive();
    }, 450);

    return () => clearTimeout(timer);
  }, [originRect, targetRect, shouldReduceMotion, onArrive]);

  if (!isActive || !originRect || !targetRect || shouldReduceMotion) {
    return null;
  }

  // Calculate start (center right of selected card) and end (center of Intake node)
  const startX = originRect.right - 20;
  const startY = originRect.top + originRect.height / 2;

  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + 50;

  // Control points for a smooth curved trajectory
  const controlX = (startX + endX) / 2 + 30;
  const controlY = Math.min(startY, endY) - 40;

  if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <svg className="w-full h-full">
        {/* Soft glowing trail path */}
        <motion.path
          d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
          fill="none"
          stroke="url(#signalGrad)"
          strokeWidth="2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0.8 }}
          animate={{ pathLength: 1, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />

        <defs>
          <linearGradient id="signalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#159A68" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2878E5" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Traveling Signal Pulse Head */}
        <motion.circle
          cx={startX}
          cy={startY}
          r="5"
          fill="#36B37E"
          filter="url(#glow)"
          initial={{ cx: startX, cy: startY, scale: 0.6, opacity: 1 }}
          animate={{
            cx: [startX, controlX, endX],
            cy: [startY, controlY, endY],
            scale: [0.8, 1.4, 1],
            opacity: [1, 1, 0.2],
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </div>
  );
}

export default SignalTravelOverlay;
