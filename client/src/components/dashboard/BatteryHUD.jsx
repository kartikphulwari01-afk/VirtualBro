import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, BatteryCharging } from 'lucide-react';

export default function BatteryHUD() {
  const [battery, setBattery] = useState(100);
  const [charging, setCharging] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [health, setHealth] = useState(100);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/system');
        const d = await res.json();
        setBattery(d.battery || 100);
        setCharging(d.charging || false);
        setTimeLeft(d.batteryTimeRemaining || 0);
        setHealth(d.batteryHealth || 100);
      } catch {}
    };
    fetch_();
    const int = setInterval(fetch_, 3000);
    return () => clearInterval(int);
  }, []);

  const getPowerColor = (lvl) => {
    if (lvl > 50) return '#00FF9C';
    if (lvl > 20) return '#FFD700';
    return '#FF3B30';
  };
  const pColor = getPowerColor(battery);

  const formatTime = (mins) => {
    if (!mins || mins < 0) return null;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };
  const timeStr = formatTime(timeLeft);

  return (
    <div className="h-full glass-panel border border-white/5 p-3 flex flex-col justify-center items-center relative overflow-hidden group">
      <motion.div 
         animate={{ opacity: [0.05, 0.1, 0.05] }} 
         transition={{ repeat: Infinity, duration: 4 }}
         className="absolute inset-0 blur-[30px]"
         style={{ backgroundColor: pColor }}
      />
      
      <div className="absolute top-3 left-3 text-[10px] uppercase font-mono font-bold tracking-widest text-gray-500 flex items-center gap-1">
         {charging ? <BatteryCharging className="w-3 h-3 text-cyber-neon" /> : <Zap className="w-3 h-3" style={{ color: pColor }} />}
         Power Module
      </div>

      <div className="relative w-32 h-32 flex items-center justify-center mt-4">
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md">
           <motion.circle 
             cx="50" cy="50" r="45" fill="none" stroke={pColor} strokeWidth="1.5" strokeDasharray="4 8" opacity="0.5"
             animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
             style={{ transformOrigin: '50px 50px' }}
           />
           <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
           <motion.circle 
             cx="50" cy="50" r="38" fill="none" stroke={pColor} strokeWidth="4" strokeDasharray="239"
             animate={{ strokeDashoffset: 239 - (239 * battery / 100) }}
             transition={{ duration: 1 }}
             strokeLinecap="round"
             style={{ transformOrigin: "50px 50px", transform: "rotate(-90deg)" }}
           />
        </motion.svg>

        <div className="flex flex-col items-center justify-center z-10 font-mono">
           <span className="text-2xl font-black text-white transition-all duration-700" style={{ textShadow: `0 0 10px ${pColor}80` }}>{battery}%</span>
           <span className="text-[8px] tracking-widest text-gray-400 mt-1">{charging ? 'CHARGING ⚡' : 'DISCHARGING'}</span>
        </div>
      </div>
      
      <div className="mt-auto text-[9px] font-mono text-gray-500 w-full flex justify-between px-2 pt-2 border-t border-white/5">
         <span>{timeStr ? `EST: ${timeStr}` : ''}</span>
         <span>HEALTH: {health}%</span>
      </div>
    </div>
  );
}
