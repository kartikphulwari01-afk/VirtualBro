import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CenterpieceHUD() {
  const [displayLoad, setDisplayLoad] = useState(0);
  const targetRef = useRef(0);
  const displayRef = useRef(0);
  const rafRef = useRef(null);

  // Fetch real CPU every 1 second
  useEffect(() => {
    const fetchCPU = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/system');
        const data = await res.json();
        targetRef.current = data.cpu;
      } catch (e) {}
    };
    fetchCPU();
    const intv = setInterval(fetchCPU, 1000);
    return () => clearInterval(intv);
  }, []);

  // Smooth interpolation loop — lerp toward target at 60fps
  useEffect(() => {
    const animate = () => {
      const diff = targetRef.current - displayRef.current;
      // Lerp: move 15% of the remaining distance each frame (smooth, no jumps)
      displayRef.current += diff * 0.15;
      const rounded = Math.round(displayRef.current);
      setDisplayLoad(prev => prev !== rounded ? rounded : prev);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const load = displayLoad;

  return (
    <div className="relative w-[28rem] h-[28rem] flex items-center justify-center animate-float pointer-events-none">
      <motion.div 
        className="absolute inset-10 rounded-full mix-blend-screen"
        animate={{ 
           background: `radial-gradient(circle, rgba(0,255,156,${(load/100)*0.4}) 0%, rgba(0,255,156,0) 70%)`,
           boxShadow: `0 0 ${load}px rgba(0,255,156,${(load/100)*0.3})` 
        }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-8 rounded-full border border-cyber-neon/5 glow-pulse"></div>

      <svg viewBox="0 0 500 500" className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(0,255,156,0.6)]">
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FF9C" />
            <stop offset="50%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#B026FF" />
          </linearGradient>
        </defs>

        <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }}>
          <circle cx="250" cy="250" r="230" fill="none" stroke="rgba(0,255,156,0.15)" strokeWidth="1" strokeDasharray="2 8" />
          <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(176,38,255,0.3)" strokeWidth="3" strokeDasharray="15 40" strokeLinecap="round" />
        </motion.g>

        <motion.g animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }}>
          <circle cx="250" cy="250" r="180" fill="none" stroke="url(#neonGradient)" strokeWidth="6" strokeDasharray="60 150 300 50" strokeLinecap="round" />
          <circle cx="250" cy="250" r="170" fill="none" stroke="#00E5FF" strokeWidth="2" opacity="0.6" strokeDasharray="4 12" />
        </motion.g>

        <motion.g animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "250px 250px" }}>
          <circle cx="250" cy="250" r="140" fill="none" stroke="#00FF9C" strokeWidth="4" strokeDasharray="600 200" strokeLinecap="round" />
          <path d="M 250 100 L 250 120" stroke="#00FF9C" strokeWidth="5" />
          <path d="M 250 380 L 250 400" stroke="#00FF9C" strokeWidth="5" />
          <path d="M 100 250 L 120 250" stroke="#00FF9C" strokeWidth="5" />
          <path d="M 380 250 L 400 250" stroke="#00FF9C" strokeWidth="5" />
        </motion.g>

        <circle cx="250" cy="250" r="150" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        <circle 
          cx="250" cy="250" r="150" 
          fill="none" 
          stroke="url(#neonGradient)" 
          strokeWidth="10" 
          strokeDasharray="942"
          strokeDashoffset={942 - (942 * load / 100)}
          strokeLinecap="round"
          style={{ 
            transformOrigin: "250px 250px", 
            transform: "rotate(-90deg)",
            transition: "stroke-dashoffset 0.3s ease-out",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <span className="text-7xl font-black text-white neon-text tracking-tighter tabular-nums"
          style={{ transition: 'all 0.2s ease-out' }}>
          {load}%
        </span>
        <span className="text-sm text-cyber-neon uppercase tracking-[0.4em] mt-2 opacity-90 font-mono font-bold drop-shadow-lg">CPU Core</span>
      </div>
    </div>
  );
}
