"use client";
import { useState, useEffect, useRef } from "react";

const TUNNEL_DEPTH_PX = 1650;
const GRID_ROWS = 10;
const GRID_COLS = 20;

const gridSquares = Array.from({ length: GRID_ROWS * GRID_COLS });

// 4x4 Glass Shards for the end effect
const glassShards = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  xDir: (Math.random() - 0.5) * 800,
  yDir: (Math.random() - 0.5) * 800,
  rotX: (Math.random() - 0.5) * 1000,
  rotY: (Math.random() - 0.5) * 1000,
}));

const walls = [
  { origin: "left center", transform: "rotateY(90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", left: "0px", top: "0px", type: "side", side: "left" },
  { origin: "right center", transform: "rotateY(-90deg)", width: `${TUNNEL_DEPTH_PX}px`, height: "100%", right: "0px", top: "0px", type: "side", side: "right" },
  { origin: "top center", transform: "rotateX(-90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", top: "0px", left: "0px", type: "flat", side: "top" },
  { origin: "bottom center", transform: "rotateX(90deg)", height: `${TUNNEL_DEPTH_PX}px`, width: "100%", bottom: "0px", left: "0px", type: "flat", side: "bottom" },
];

function StockChart({ color }: { color: "green" | "red" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const scale = window.devicePixelRatio || 2;
    canvas.width = 1200 * scale;
    canvas.height = 800 * scale;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.scale(scale, scale);

    const generateData = () => {
      const points: number[] = [];
      let value = 200;
      for (let i = 0; i < 50; i++) {
        value += (Math.random() - 0.5) * 40;
        value = Math.max(50, Math.min(350, value));
        points.push(value);
      }
      return points;
    };
    let dataPoints = generateData();
    let offset = 0;
    const draw = () => {
      ctx.clearRect(0, 0, 1200, 800);
      ctx.imageSmoothingEnabled = true;
      ctx.lineWidth = 2;
      // Grid
      ctx.strokeStyle = color === "green" ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)";
      for (let y = 0; y < 800; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1200, y); ctx.stroke(); }
      for (let x = 0; x < 1200; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 800); ctx.stroke(); }
      // Candles
      const candleWidth = 20;
      const spacing = 24;
      for (let i = 0; i < 45; i++) {
        const idx = Math.floor((i + offset) % dataPoints.length);
        const open = dataPoints[idx];
        const close = dataPoints[(idx + 1) % dataPoints.length];
        const high = Math.max(open, close) + Math.random() * 20;
        const low = Math.min(open, close) - Math.random() * 20;
        const isGreen = close > open;
        ctx.fillStyle = color === "green" 
            ? (isGreen ? "rgba(34, 197, 94, 1)" : "rgba(34, 197, 94, 0.6)") 
            : (isGreen ? "rgba(239, 68, 68, 0.6)" : "rgba(239, 68, 68, 1)");
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(i * spacing + candleWidth / 2, high); ctx.lineTo(i * spacing + candleWidth / 2, low); ctx.stroke();
        ctx.fillRect(i * spacing, Math.min(open, close), candleWidth, Math.abs(close - open));
      }
    };
    let animationId: number;
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 100) { offset += 0.2; draw(); lastTime = time; }
      animationId = requestAnimationFrame(animate);
    };
    animate(0);
    return () => cancelAnimationFrame(animationId);
  }, [color]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" style={{ mixBlendMode: "screen" }} />;
}

export default function Tunnel() {
  const [transform, setTransform] = useState({ z: 0, y: 0 });
  const [whiteFlash, setWhiteFlash] = useState(0);
  const [shatterProgress, setShatterProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the tunnel we have scrolled through
      // Start counting when the top of the container hits the top of the viewport
      // We want to track this over the full height of the container
      const totalScrollHeight = rect.height - windowHeight;
      const scrolled = Math.abs(Math.min(0, rect.top)); // Positive value of pixels scrolled
      
      // Normalized Progress (0.0 to 1.0)
      const p = Math.max(0, Math.min(1, scrolled / totalScrollHeight));

      // PHASE 1: ENTERING THE TUNNEL (0% - 50%)
      if (p < 0.5) {
        // Map p (0 -> 0.5) to local (0 -> 1)
        const localP = p * 2; 
        
        // Move Forward: Start at z=200, Go deep to z=1500
        const zValue = 200 + (localP * 1300); 
        // Move Camera Y: Start high (400), go to center (0)
        const yValue = 400 - (localP * 400);
        
        setTransform({ z: zValue, y: yValue });

        // Flash Logic: Starts fading in ONLY after 80% of Phase 1 (i.e., total progress 0.4)
        if (localP > 0.8) {
            const flashOpacity = (localP - 0.8) / 0.2; // 0 to 1
            setWhiteFlash(flashOpacity);
        } else {
            setWhiteFlash(0);
        }
        setShatterProgress(0); // Ensure glass is intact
      } 
      
      // PHASE 2: REVERSE & SHATTER (50% - 100%)
      else {
        // Map p (0.5 -> 1.0) to local (0 -> 1)
        const localP = (p - 0.5) * 2;

        // Flash Fade Out: Rapidly fade out in the first 20% of Phase 2
        if (localP < 0.2) {
            setWhiteFlash(1 - (localP / 0.2));
        } else {
            setWhiteFlash(0);
        }

        // Reverse Movement: Start from deep (z=1500) and pull back rapidly to 0
        const zValue = 1500 - (localP * 1500);
        setTransform({ z: zValue, y: 0 }); // Stay centered Y

        // Shatter Logic: Trigger in the last 15% of the scroll
        if (localP > 0.85) {
            const shatter = (localP - 0.85) / 0.15;
            setShatterProgress(shatter);
        } else {
            setShatterProgress(0);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // 800vh total height (400vh for entry, 400vh for exit)
    <div ref={containerRef} className="relative h-[800vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden perspective-[100px]" style={{ perspective: "100px" }}>
        
        {/* White Flash Overlay */}
        <div 
            className="absolute inset-0 z-50 pointer-events-none bg-white mix-blend-normal transition-opacity duration-75"
            style={{ opacity: whiteFlash }}
        />

        {/* Glass Shatter Overlay (Visible at end) */}
        <div className="absolute inset-0 z-40 pointer-events-none flex flex-wrap" style={{ perspective: '1000px' }}>
            {glassShards.map((shard) => (
                <div key={shard.id} className="w-1/4 h-1/4 relative"
                    style={{
                        opacity: shatterProgress > 0 ? 1 - shatterProgress : 0, // Fade out as they fly
                        transform: shatterProgress > 0 ? `
                            translate3d(${shard.xDir * shatterProgress}px, ${shard.yDir * shatterProgress}px, ${shatterProgress * 1000}px)
                            rotateX(${shard.rotX * shatterProgress}deg) 
                            rotateY(${shard.rotY * shatterProgress}deg)
                        ` : 'none',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        backdropFilter: 'blur(4px)'
                    }}
                />
            ))}
        </div>

        {/* The Tunnel 3D Container */}
        <div
          className="w-full h-full absolute top-0 left-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate3d(0px, ${transform.y}px, ${transform.z}px)`,
          }}
        >
          {walls.map((wall, i) => (
            <div
              key={i}
              className="absolute grid"
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
              }}
            >
              {/* Charts on Sides */}
              {wall.side === "left" && <div className="absolute inset-0 pointer-events-none"><StockChart color="green" /></div>}
              {wall.side === "right" && <div className="absolute inset-0 pointer-events-none"><StockChart color="red" /></div>}

              {/* Grid Squares */}
              {gridSquares.map((_, j) => {
                let borderColor = "border-fuchsia-500/30";
                let boxShadow = "0 0 15px rgba(168,85,247,0.2)";

                if (wall.side === "left") {
                  borderColor = "border-green-500/40";
                  boxShadow = "0 0 15px rgba(34,197,94,0.2)";
                } else if (wall.side === "right") {
                  borderColor = "border-red-500/40";
                  boxShadow = "0 0 15px rgba(239,68,68,0.2)";
                } else {
                  borderColor = "border-white/10"; // Fainter floor/ceiling
                  boxShadow = "none";
                }

                return (
                  <div
                    key={j}
                    className={`bg-transparent border ${borderColor}`}
                    style={{ boxShadow }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}