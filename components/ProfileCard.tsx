'use client';

import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

const DEFAULT_INNER_GRADIENT = 'transparent';

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180
} as const;

const clamp = (v: number, min = 0, max = 100): number => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3): number => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number): number =>
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

interface ProfileCardProps {
  avatarUrl?: string;
  className?: string;
  enableTilt?: boolean;
  name?: string;
  title?: string;
  showUserInfo?: boolean;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl,
  className = '',
  enableTilt = false,
  name = 'Speaker Name',
  title = 'Speaker Title',
  showUserInfo = true
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  const cardRadius = '30px';

  const cardStyle = useMemo(
    () => ({
      '--inner-gradient': DEFAULT_INNER_GRADIENT,
      '--card-radius': cardRadius
    }),
    [cardRadius]
  );

  return (
    <div
      ref={wrapRef}
      className={`relative ${className}`}
      style={{ perspective: '600px', ...cardStyle } as React.CSSProperties}
    >
      <div ref={shellRef} className="relative">
        <section
          className="relative overflow-hidden"
          style={{
            height: '540px',
            aspectRatio: '0.718',
            borderRadius: cardRadius,
            background: 'transparent',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)'
          }}
        >
          {/* IMAGE */}
          <img
            src={avatarUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{
              borderRadius: cardRadius
            }}
          />

          {/* DARK GRADIENT FOR READABILITY */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.75) 10%, rgba(0,0,0,0.2) 45%, transparent 70%)'
            }}
          />

          {/* TEXT */}
          {showUserInfo && (
            <div className="absolute bottom-6 left-6 right-6 z-10">
              <h3 className="text-white text-xl font-bold">{name}</h3>
              <p className="text-white/80 text-sm">{title}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
