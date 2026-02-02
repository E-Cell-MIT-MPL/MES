"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// --- [ADAPTIVE STOCK CHART] ---
function StockChart({ color, isMobile }: { color: "green" | "red", isMobile: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    
    // Low Res for Mobile to prevent GPU lag
    const dpr = window.devicePixelRatio || 1;
    const width = isMobile ? 800 : 4000; 
    const height = 800;
    
    canvas.width = width * dpr; 
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Only enable expensive glow on PC
    // if (!isMobile) {
    //     ctx.shadowBlur = 20;
    //     ctx.shadowColor = color === "green" ? "#4ade80" : "#f87171";
    // }

    const generateData = () => {
      const p = []; let v = 200;
      const points = isMobile ? 40 : 200;
      for (let i=0; i<points; i++) { 
          v += (Math.random()-0.5)*40; 
          v=Math.max(50, Math.min(350,v)); 
          p.push(v); 
      }
      return p;
    };
    
    let dataPoints = generateData(); 
    let offset = 0;
    let lastTime = 0;
    const fpsInterval = 1000 / 30;

    const draw = (time: number) => {
      const animationFrameId = requestAnimationFrame(draw);
      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      offset += isMobile ? 0.1 : 0.2; 
      if (offset > dataPoints.length) offset = 0;

      ctx.clearRect(0, 0, width, height); 
      ctx.lineWidth = 2;
      ctx.strokeStyle = color === "green" ? "rgba(74, 222, 128, 0.4)" : "rgba(248, 113, 113, 0.4)";
      
      for(let y=0; y<height; y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
      
      if (!isMobile) ctx.shadowBlur = 20;
      const candleW = isMobile ? 30 : 20; 
      const spacing = isMobile ? 40 : 24;
      const loopCount = isMobile ? 30 : 180;

      for(let i=0; i<loopCount; i++){
        const idx = Math.floor((i+offset)%dataPoints.length);
        const x=i*spacing; 
        const o=dataPoints[idx]; 
        const c=dataPoints[(idx+1)%dataPoints.length];
        const h=Math.max(o,c)+ (Math.sin(i + offset) * 10); 
        const l=Math.min(o,c)- (Math.cos(i + offset) * 10);
        const isG=c>o;
        ctx.fillStyle = color === "green" ? (isG ? "#22c55e" : "#166534") : (isG ? "#991b1b" : "#ef4444");
        ctx.beginPath();ctx.moveTo(x+candleW/2,h);ctx.lineTo(x+candleW/2,l);ctx.stroke();
        ctx.fillRect(x,Math.min(o,c),candleW,Math.abs(c-o));
      }
    };
    
    const frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [color, isMobile]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" style={{mixBlendMode:"screen"}}/>;
}

// --- [FIXED MULTI-LINE TEXT HELPER] ---
const TunnelText = ({ text, zOffset, tunnelZ, color = "white", multiLine = false }: { text: string | React.ReactNode, zOffset: number, tunnelZ: MotionValue<number>, color?: string, multiLine?: boolean }) => {
  const inStart = -800 - zOffset;
  const inFull = -200 - zOffset;
  const outStart = 200 - zOffset;
  const outEnd = 600 - zOffset;

  const opacity = useTransform(tunnelZ, [inStart, inFull, outStart, outEnd], [0, 1, 1, 0]);
  const scale = useTransform(tunnelZ, [inStart, inFull], [0.4, 1]); 

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
      <motion.div 
        style={{
          transform: useTransform(tunnelZ, (v) => `translateZ(${zOffset}px)`),
          opacity: opacity, 
          scale: scale,
          zIndex: 50
        }}
        className="flex items-center justify-center"
      >
        <h2 
          className="font-serif-display italic font-black text-center px-4"
          style={{ 
            color: color,
            fontSize: multiLine ? 'clamp(1.5rem, 10vw, 6rem)' : 'clamp(2rem, 12vw, 8rem)',
            textShadow: `0 0 20px ${color}, 0 0 40px ${color}`,
            lineHeight: multiLine ? 1.1 : 1,
            whiteSpace: 'normal'
          }}
        >
          {text}
        </h2>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const TUNNEL_DEPTH_PX = 4000;
const SCROLL_HEIGHT = 5000; 

export default function Tunnel() {
  const tunnelRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Performance: Fewer DOM elements on mobile
  const GRID_ROWS = isMobile ? 6 : 10;
  const GRID_COLS = isMobile ? 25 : 80;

  const { scrollYProgress } = useScroll({
    target: tunnelRef,
    offset: ["start start", "end end"]
  });

  const z = useTransform(scrollYProgress, [0, 0.95], [0, 4200]);
  const flash = useTransform(scrollYProgress, [0.88, 0.98, 1], [0, 1, 1]);
  const tunnelOpacity = useTransform(flash, (v) => 1 - v);

  const walls = useMemo(() => [
    { origin: "left center", transform: "rotateY(90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", left: "0px", top: "0px", side: "left" },
    { origin: "right center", transform: "rotateY(-90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", right: "0px", top: "0px", side: "right" },
    { origin: "top center", transform: "rotateX(-90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", top: "0px", left: "0px", side: "top" },
    { origin: "bottom center", transform: "rotateX(90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", bottom: "0px", left: "0px", side: "bottom" },
  ], []);

  const gridSquares = useMemo(() => Array.from({ length: GRID_ROWS * GRID_COLS }), [GRID_ROWS, GRID_COLS]);

  return (
    <div ref={tunnelRef} className="relative bg-black" style={{ height: `${SCROLL_HEIGHT}px` }}>
      <div className="w-full h-screen sticky top-0 overflow-hidden bg-black" 
           style={{ perspective: "600px", transformStyle: "preserve-3d" }}>
        
        <motion.div
          className="w-full h-full absolute top-0 left-0"
          style={{
            transformStyle: "preserve-3d",
            z: z,
            opacity: tunnelOpacity, 
          }}
        >
          {/* TEXT CONTENT */}
          <TunnelText text="WELCOME TO" zOffset={-500} tunnelZ={z} color="#ffffff" /> 
          <TunnelText text="MES 2026" zOffset={-1800} tunnelZ={z} color="#ffffff" /> 
          
          <TunnelText 
            text={<>EXPECT<br/>THE<br/>UNEXPECTED</>} 
            zOffset={-3200} 
            tunnelZ={z} 
            color="#ffffff" 
            multiLine={true} 
          />

          {/* WALLS */}
          {walls.map((wall, i) => (
            <div key={i} className="absolute grid"
              style={{
                transform: wall.transform, 
                transformOrigin: wall.origin,
                width: wall.width, 
                height: wall.height,
                left: wall.left || 'auto', 
                right: wall.right || 'auto', 
                top: wall.top || 'auto', 
                bottom: wall.bottom || 'auto',
                gridTemplateColumns: (wall.side === "left" || wall.side === "right") ? `repeat(${GRID_COLS}, 1fr)` : `repeat(${GRID_ROWS}, 1fr)`,
                gridTemplateRows: (wall.side === "left" || wall.side === "right") ? `repeat(${GRID_ROWS}, 1fr)` : `repeat(${GRID_COLS}, 1fr)`,
                backfaceVisibility: "hidden" 
              }}
            >
              {(wall.side === "left" || wall.side === "right") && (
                <div className="absolute inset-0 pointer-events-none transform-gpu z-10">
                  <StockChart color={wall.side === "left" ? "green" : "red"} isMobile={isMobile} />
                </div>
              )}
              
              {gridSquares.map((_, j) => (
                <div key={j} className={`
                    bg-black/90 border-[0.5px]
                    ${isMobile 
                        ? (wall.side === "left" ? "border-green-500/20" : wall.side === "right" ? "border-red-500/20" : "border-white/10")
                        : (wall.side === "left" ? "border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]" :
                           wall.side === "right" ? "border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]" :
                           "border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]")
                    }
                `} />
              ))}
            </div>
          ))}
        </motion.div>

        <motion.div className="absolute inset-0 pointer-events-none z-[100] bg-white" style={{ opacity: flash }} />
      </div>
    </div>
  );
}