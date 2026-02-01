"use client";

import { useRef, useMemo, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

// --- [STOCK CHART COMPONENT] ---
// (Unchanged, but now it won't be forced to re-render constantly)
function StockChart({ color }: { color: "green" | "red" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    
    // Optimization: Handle High DPI displays without heavy processing
    const dpr = window.devicePixelRatio || 1;
    const width = 4000;
    const height = 800;
    
    canvas.width = width * dpr; 
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Generate static data once to save CPU
    const generateData = () => {
      const p = []; let v = 200;
      for (let i=0; i<200; i++) { 
          v += (Math.random()-0.5)*40; 
          v=Math.max(50, Math.min(350,v)); 
          p.push(v); 
      }
      return p;
    };
    
    let dataPoints = generateData(); 
    let offset = 0;
    let animationFrameId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Limit to 30fps for performance style

    const draw = (time: number) => {
      animationFrameId = requestAnimationFrame(draw);
      
      const elapsed = time - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = time - (elapsed % fpsInterval);

      offset += 0.2; 
      if (offset > dataPoints.length) {
          // Recycle data instead of regenerating to save GC
          offset = 0;
      }

      ctx.clearRect(0, 0, width, height); 
      ctx.lineWidth = 2;
      ctx.strokeStyle = color==="green"?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)";
      
      // Draw Grid
      for(let y=0; y<height; y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();}
      for(let x=0; x<width; x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}
      
      // Draw Candles
      const candleW=20; const spacing=24;
      for(let i=0; i<180; i++){
        const idx = Math.floor((i+offset)%dataPoints.length);
        const x=i*spacing; 
        const o=dataPoints[idx]; 
        const c=dataPoints[(idx+1)%dataPoints.length];
        
        // Simple random movement for "live" feel
        const h=Math.max(o,c)+ (Math.sin(i + offset) * 10); 
        const l=Math.min(o,c)- (Math.cos(i + offset) * 10);
        
        const isG=c>o;
        ctx.fillStyle=color==="green"?(isG?"rgba(34,197,94,1)":"rgba(34,197,94,0.6)"):(isG?"rgba(239,68,68,0.6)":"rgba(239,68,68,1)");
        ctx.strokeStyle=ctx.fillStyle;
        ctx.beginPath();ctx.moveTo(x+candleW/2,h);ctx.lineTo(x+candleW/2,l);ctx.stroke();
        ctx.fillRect(x,Math.min(o,c),candleW,Math.abs(c-o));
      }
    };
    
    draw(0);
    return () => cancelAnimationFrame(animationFrameId);
  }, [color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" style={{mixBlendMode:"screen"}}/>;
}

// --- [OPTIMIZED HELPER: 3D TEXT] ---
// Now accepts MotionValue instead of raw number to avoid React Renders
const TunnelText = ({ 
  text, 
  zOffset, 
  tunnelZ, 
  color = "white" 
}: { 
  text: string, 
  zOffset: number, 
  tunnelZ: MotionValue<number>, 
  color?: string 
}) => {
  
  // Calculate opacity purely via Framer Motion transforms (GPU based)
  // Logic: RelativePos = zOffset + currentTunnelZ
  // We want it visible when RelativePos is between -100 and 200
  
  // Math: 
  // If we want Opacity 1 at RelativePos -100...
  // -100 = zOffset + tunnelZ  ->  tunnelZ = -100 - zOffset
  
  const inStart = -600 - zOffset;
  const inFull = -100 - zOffset;
  const outStart = 200 - zOffset;
  const outEnd = 400 - zOffset;

  const opacity = useTransform(
    tunnelZ,
    [inStart, inFull, outStart, outEnd],
    [0, 1, 1, 0]
  );

  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 flex items-center justify-center pointer-events-none"
      style={{
        // Use translateZ directly in style to keep it performant
        transform: `translate(-50%, -50%) translateZ(${zOffset}px)`,
        width: '100%',
        opacity: opacity, 
      }}
    >
      <h2 
        className={`text-6xl md:text-8xl font-serif-display italic font-black text-center whitespace-nowrap`}
        style={{ 
          color: color,
          textShadow: `0 0 30px ${color}, 0 0 60px ${color}`
        }}
      >
        {text}
      </h2>
    </motion.div>
  );
};

// --- MAIN ORCHESTRATOR ---
const TUNNEL_DEPTH_PX = 4000;
const GRID_ROWS = 10;
const GRID_COLS = 80;
const SCROLL_HEIGHT = 4500; 

export default function Tunnel() {
  const tunnelRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: tunnelRef,
    offset: ["start start", "end end"]
  });

  // Map scroll progress to Z depth
  const z = useTransform(scrollYProgress, [0, 0.9], [-50, 4500]);
  
  // Flash effect at the end
  const flash = useTransform(scrollYProgress, [0.85, 0.95, 1], [0, 1, 1]);
  const tunnelOpacity = useTransform(flash, (v) => 1 - v);

  // Memoize static arrays to prevent garbage collection on re-renders
  const walls = useMemo(() => [
    { origin: "left center", transform: "rotateY(90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", left: "0px", top: "0px", type: "side", side: "left" },
    { origin: "right center", transform: "rotateY(-90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", right: "0px", top: "0px", type: "side", side: "right" },
    { origin: "top center", transform: "rotateX(-90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", top: "0px", left: "0px", type: "flat", side: "top" },
    { origin: "bottom center", transform: "rotateX(90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", bottom: "0px", left: "0px", type: "flat", side: "bottom" },  ], []);

  const gridSquares = useMemo(() => Array.from({ length: GRID_ROWS * GRID_COLS }), []);

  return (
    <div ref={tunnelRef} className="relative bg-black" style={{ height: `${SCROLL_HEIGHT}px` }}>
      
      <div className="w-full h-screen sticky top-0 overflow-hidden" 
           style={{ perspective: "400px", transformStyle: "preserve-3d" }}>
        
        <motion.div
          className="w-full h-full absolute top-0 left-0"
          style={{
            transformStyle: "preserve-3d",
            z: z, // Direct hardware accelerated animation
            opacity: tunnelOpacity, 
          }}
        >
          {/* TEXT - PASSING THE RAW MOTION VALUE */}
          <TunnelText text="WELCOME TO" zOffset={-400} tunnelZ={z} /> 
          <TunnelText text="MES 2026" zOffset={-1500} tunnelZ={z} /> 
          <TunnelText text="EXPECT THE UNEXPECTED" zOffset={-2800} tunnelZ={z} />

          {/* WALLS */}
          {walls.map((wall, i) => (
            <div key={i} className="absolute grid"
              style={{
                transform: wall.transform, 
                transformOrigin: wall.origin,
                width: wall.width, 
                height: wall.height,
                left: wall.left, 
                right: wall.right, 
                top: wall.top, 
                bottom: wall.bottom,
                gridTemplateColumns: wall.type === "side" ? `repeat(${GRID_COLS}, 1fr)` : `repeat(${GRID_ROWS}, 1fr)`,
                gridTemplateRows: wall.type === "side" ? `repeat(${GRID_ROWS}, 1fr)` : `repeat(${GRID_COLS}, 1fr)`,
                backfaceVisibility: "hidden" 
              }}
            >
              {/* Only render Chart on sides */}
              {(wall.side === "left" || wall.side === "right") && (
                <div className="absolute inset-0 pointer-events-none transform-gpu">
                  <StockChart color={wall.side === "left" ? "green" : "red"} />
                </div>
              )}
              
              {/* Grid Lines */}
              {gridSquares.map((_, j) => (
                <div key={j} className={`bg-black/90 border ${
                  wall.side === "left" ? "border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]" :
                  wall.side === "right" ? "border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]" :
                  "border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                }`} />
              ))}
            </div>
          ))}
        </motion.div>

        {/* WHITE FLASH OVERLAY */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-50 bg-white"
          style={{ opacity: flash }}
        />
      </div>
    </div>
  );
}