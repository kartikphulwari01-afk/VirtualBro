import React from 'react';

const StatBox = ({ value, label, subtext, color }) => (
  <div className={`glass-panel border-white/5 flex flex-col justify-center items-center py-2 px-1 relative overflow-hidden group hover:border-${color}/40 transition-colors`}>
     <div className={`absolute bottom-0 w-full h-[2px] bg-${color} shadow-[0_0_8px_currentColor]`} />
     <span className="text-2xl font-black text-white group-hover:neon-text transition-all">{value}</span>
     <span className="text-[10px] text-gray-400 tracking-wider uppercase mt-1">{label}</span>
     <span className={`text-[8px] text-${color} mt-0.5`}>{subtext}</span>
  </div>
);

export default function TodayOverview() {
  return (
    <div className="h-full flex flex-col">
      <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold font-mono">Today's Overview</div>
      <div className="flex-1 grid grid-cols-4 gap-2">
         <StatBox value="12" label="Tasks" subtext="3 pending" color="cyber-cyan" />
         <StatBox value="7" label="Notes" subtext="2 pinned" color="cyber-neon" />
         <StatBox value="23" label="Commands" subtext="5 today" color="cyber-purple" />
         <StatBox value="8h 42m" label="Uptime" subtext="Active" color="cyber-blue" />
      </div>
    </div>
  );
}
