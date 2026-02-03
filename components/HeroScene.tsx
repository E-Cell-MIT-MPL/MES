"use client";

import { Sparkles, Html } from "@react-three/drei";

export function HeroScene() {
  return (
    <>
      {/* 1. THE MOVING HEADING (FORCED TO TOP) */}
      <Html fullscreen style={{ pointerEvents: 'none', zIndex: 1000 }}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          backgroundColor: '#b91c1c', // A professional deep red
          color: 'white',
          padding: '12px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
          fontSize: '14px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          pointerEvents: 'auto', // Allows clicks if you add a link later
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'inline-block',
            paddingLeft: '100%',
            animation: 'marquee 15s linear infinite'
          }}>
            TICKET SALES WILL BE LIVE SOON • TICKET SALES WILL BE LIVE SOON • TICKET SALES WILL BE LIVE SOON • TICKET SALES WILL BE LIVE SOON
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      </Html>

      {/* 2. YOUR ORIGINAL SPARKLES */}
      <Sparkles
        count={200}
        scale={[40, 40, 20]}
        size={2}
        speed={0.3}
        opacity={0.6}
        color="#ffffff"
      />
    </>
  );
}