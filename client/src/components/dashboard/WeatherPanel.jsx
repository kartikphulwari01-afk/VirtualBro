import React from 'react';
import { Sun } from 'lucide-react';

export default function WeatherPanel() {
  return (
    <div className="h-full glass-panel p-3 flex flex-col border-yellow-500/20 relative overflow-hidden">
      {/* Background Sun Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 blur-[40px] pointer-events-none" />
      
      <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold font-mono">Weather</div>
      
      <div className="flex items-center justify-between mt-2">
         <div className="flex items-center gap-3 relative z-10">
            <Sun className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] fill-yellow-400/20" />
            <div className="flex flex-col">
               <span className="text-3xl font-black text-white">23°</span>
               <span className="text-[10px] text-gray-400 uppercase tracking-widest">Clear Sky</span>
            </div>
         </div>
      </div>

      <div className="mt-auto flex justify-between text-[10px] font-mono text-gray-500 pt-3 border-t border-white/5">
         <span>H: 27° L: 18°</span>
         <span>Humidity: 41%</span>
      </div>
    </div>
  );
}
