"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// --- [STOCK CHART COMPONENT] ---
function StockChart({ color }: { color: "green" | "red" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const scale = window.devicePixelRatio || 2;
    canvas.width = 4000 * scale; 
    canvas.height = 800 * scale;
    ctx.scale(scale, scale);

    const generateData = () => {
      const p = []; let v = 200;
      for (let i=0; i<200; i++) { 
          v += (Math.random()-0.5)*40; 
          v=Math.max(50, Math.min(350,v)); 
          p.push(v); 
      }
      return p;
    };
    let dataPoints = generateData(); let offset = 0;

    const draw = () => {
      ctx.clearRect(0, 0, 4000, 800); ctx.lineWidth = 2;
      ctx.strokeStyle = color==="green"?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)";
      for(let y=0; y<800; y+=80){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(4000,y);ctx.stroke();}
      for(let x=0; x<4000; x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,800);ctx.stroke();}
      const candleW=20; const spacing=24;
      for(let i=0; i<180; i++){
        const idx = Math.floor((i+offset)%dataPoints.length);
        const x=i*spacing; const o=dataPoints[idx]; const c=dataPoints[(idx+1)%dataPoints.length];
        const h=Math.max(o,c)+Math.random()*20; const l=Math.min(o,c)-Math.random()*20;
        const isG=c>o;
        ctx.fillStyle=color==="green"?(isG?"rgba(34,197,94,1)":"rgba(34,197,94,0.6)"):(isG?"rgba(239,68,68,0.6)":"rgba(239,68,68,1)");
        ctx.strokeStyle=ctx.fillStyle;
        ctx.beginPath();ctx.moveTo(x+candleW/2,h);ctx.lineTo(x+candleW/2,l);ctx.stroke();
        ctx.fillRect(x,Math.min(o,c),candleW,Math.abs(c-o));
      }
    };
    let id:number; let last=0;
    const loop=(t:number)=>{
        if(t-last>100){ offset+=0.2; if(offset>dataPoints.length){dataPoints=generateData();offset=0;} draw(); last=t;}
        id=requestAnimationFrame(loop);
    };
    loop(0);
    return ()=>cancelAnimationFrame(id);
  }, [color]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" style={{mixBlendMode:"screen"}}/>;
}

// --- HELPER: 3D TEXT WITH VISIBILITY LOGIC ---
const TunnelText = ({ 
  text, 
  z, 
  currentZ, 
  color = "white" 
}: { 
  text: string, 
  z: number, 
  currentZ: number, 
  color?: string 
}) => {
  const relativePos = z + currentZ;
  let opacity = 0;

  // VISIBILITY WINDOW
  if (relativePos > -600 && relativePos < -100) {
    opacity = (relativePos + 600) / 500;
  }
  else if (relativePos >= -100 && relativePos < 200) {
    opacity = 1;
  }
  else if (relativePos >= 200 && relativePos < 400) {
    opacity = 1 - ((relativePos - 200) / 200);
  }

  return (
    <div 
      className="absolute top-1/2 left-1/2 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translate(-50%, -50%) translateZ(${z}px)`,
        width: '100%',
        opacity: Math.max(0, Math.min(1, opacity)),
        transition: 'opacity 0.1s linear',
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
    </div>
  );
};

// --- MAIN ORCHESTRATOR ---
const TUNNEL_DEPTH_PX = 4000;
const GRID_ROWS = 10;
const GRID_COLS = 80;
// FIX 1: Define a set scroll distance for the tunnel interaction
const SCROLL_HEIGHT = 4500; 

export default function Tunnel() {
  const tunnelRef = useRef<HTMLDivElement>(null);
  
  // FIX 2: useScroll relative to THIS component
  const { scrollYProgress } = useScroll({
    target: tunnelRef,
    offset: ["start start", "end end"]
  });

  // FIX 3: Map scroll progress (0 to 1) directly to animation values
  // This ensures animation ends EXACTLY when scroll ends
  const z = useTransform(scrollYProgress, [0, 0.9], [-50, 4500]); // Travel 4500px in first 90%
  const flash = useTransform(scrollYProgress, [0.85, 0.95, 1], [0, 1, 1]); // Flash happens in last 15%

  // We need raw values for the TunnelText logic
  const [currentZ, setCurrentZ] = useState(-50);
  
  // Subscribe to motion value to update state for 3D Text logic
  useEffect(() => {
    return z.on("change", (latest) => {
      setCurrentZ(latest);
    });
  }, [z]);

  const walls = [
    { origin: "left center", transform: "rotateY(90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", left: "0px", top: "0px", type: "side", side: "left" },
    { origin: "right center", transform: "rotateY(-90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", right: "0px", top: "0px", type: "side", side: "right" },
    { origin: "top center", transform: "rotateX(-90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", top: "0px", left: "0px", type: "flat", side: "top" },
    { origin: "bottom center", transform: "rotateX(90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", bottom: "0px", left: "0px", type: "flat", side: "bottom" },
  ];

  const gridSquares = Array.from({ length: GRID_ROWS * GRID_COLS });

  return (
    // FIX 4: Set height to our defined scroll duration. 
    // Once user scrolls 4500px, the component ends, sticky breaks, and we move to next section.
    <div ref={tunnelRef} className="relative bg-black" style={{ height: `${SCROLL_HEIGHT}px` }}>
      
      <div className="w-full h-screen sticky top-0 overflow-hidden" 
           style={{ perspective: "400px", transformStyle: "preserve-3d" }}>
        
        <motion.div
          className="w-full h-full absolute top-0 left-0"
          style={{
            transformStyle: "preserve-3d",
            z: z, // Framer Motion handles the transform directly
            opacity: useTransform(flash, (v) => 1 - v), // Fade tunnel out as flash comes in
          }}
        >
          {/* TEXT POSITIONS */}
          <TunnelText text="WELCOME TO" z={-400} currentZ={currentZ} /> 
          <TunnelText text="MES 2026" z={-1500} currentZ={currentZ} /> 
          <TunnelText text="EXPECT THE UNEXPECTED" z={-2800} currentZ={currentZ} />

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
              {(wall.side === "left" || wall.side === "right") && (
                <div className="absolute inset-0 pointer-events-none">
                  <StockChart color={wall.side === "left" ? "green" : "red"} />
                </div>
              )}
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