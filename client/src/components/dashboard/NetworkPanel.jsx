import React, { useState, useEffect } from 'react';
import { Wifi, ArrowDown, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NetworkPanel() {
  const [net, setNet] = useState({ download: "0.0", upload: "0.0" });

  useEffect(() => {
    const fetchNet = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/system');
        const json = await res.json();
        setNet(json.network);
      } catch(e) {}
    };
    fetchNet();
    const int = setInterval(fetchNet, 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="h-full glass-panel border border-cyber-cyan/20 p-3 flex flex-col relative overflow-hidden group hover:border-cyber-cyan/40 transition-colors">
      <div className="text-[10px] text-gray-500 uppercase font-bold font-mono flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-cyber-cyan/80">
           <Wifi className="w-3.5 h-3.5" /> NET_TRAFFIC
        </span>
        <span className="text-[8px] text-cyber-neon/60 font-mono">LIVE</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 top-1/2 opacity-20 pointer-events-none flex items-end overflow-hidden">
         <motion.svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-[200%] h-full" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}>
            <path d="M0,50 C100,10 200,90 300,50 C400,10 500,90 600,50 C700,10 800,90 900,50 L900,100 L0,100 Z" fill="url(#waveGrad2)" />
            <defs>
              <linearGradient id="waveGrad2" x1="0" x2="0" y1="0" y2="1">
                 <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4"/>
                 <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
              </linearGradient>
            </defs>
         </motion.svg>
      </div>

      <div className="flex-1 flex flex-col justify-end gap-3 z-10 pb-1">
         <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-white/5 relative shadow-inner">
            <div className="flex items-center gap-2 pl-1">
               <div className="w-5 h-5 rounded-md bg-cyber-neon/10 flex items-center justify-center border border-cyber-neon/30">
                 <ArrowDown className="text-cyber-neon w-3 h-3" />
               </div>
               <span className="text-[9px] text-gray-400 font-mono tracking-widest">DOWNLOAD</span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
               <span className="text-xl font-bold text-white tracking-widest transition-all duration-500">{net.download}</span>
               <span className="text-[9px] text-cyber-neon">Mb/s</span>
            </div>
         </div>

         <div className="flex justify-between items-center bg-black/40 rounded-xl p-2 border border-white/5 relative shadow-inner">
            <div className="flex items-center gap-2 pl-1">
               <div className="w-5 h-5 rounded-md bg-cyber-purple/10 flex items-center justify-center border border-cyber-purple/30">
                 <ArrowUp className="text-cyber-purple w-3 h-3" />
               </div>
               <span className="text-[9px] text-gray-400 font-mono tracking-widest">UPLOAD</span>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
               <span className="text-xl font-bold text-white tracking-widest transition-all duration-500">{net.upload}</span>
               <span className="text-[9px] text-cyber-purple">Mb/s</span>
            </div>
         </div>
      </div>
    </div>
  );
}
