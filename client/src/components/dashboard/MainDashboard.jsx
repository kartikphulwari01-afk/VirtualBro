import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import CenterpieceHUD from './CenterpieceHUD';
import SystemDiagnostics from './SystemDiagnostics';
import LivePerformanceGraph from './LivePerformanceGraph';
import NetworkPanel from './NetworkPanel';
import ActionGrid from './ActionGrid';
import NotesPanel from './NotesPanel';
import MusicPanel from './MusicPanel';
import WeatherPanel from './WeatherPanel';
import TodayOverview from './TodayOverview';
import BatteryHUD from './BatteryHUD';
import ConnectivityPanel from './ConnectivityPanel';
import ZoroDevLab from './ZoroDevLab';
import BroSpace from '../brospace/BroSpace';
import { Volume2, VolumeX, Cpu } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainDashboard({ className, activeSection }) {
  const { isMuted, toggleMute, playSFX } = useAudio();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const int = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(int);
  }, []);

  const handleMute = () => {
    playSFX('tap');
    toggleMute();
  };

  return (
    <div className={clsx("flex flex-col gap-4 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar", className)}>
      {/* Premium Header */}
      <div className="flex justify-between items-center px-2 py-1">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white neon-text uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {activeSection === 'commands' ? 'ZoroDev-Lab' : 'VirtualBro'}
          </h1>
          <p className="text-[10px] text-cyber-neon uppercase tracking-[0.3em] font-mono opacity-80 mt-1">
            {activeSection === 'commands' ? 'Developer Operating Environment' : 'System Core OS v5.0'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
          <button onClick={handleMute} className="p-2 glass-panel hover:text-white transition-colors group">
             {isMuted ? <VolumeX className="w-4 h-4 text-red-400 group-hover:drop-shadow-[0_0_8px_#FF3B30]" /> : <Volume2 className="w-4 h-4 text-cyber-cyan group-hover:drop-shadow-[0_0_8px_#00E5FF]" />}
          </button>
          <div className="px-4 py-2 glass-panel border-cyber-cyan/30 text-cyber-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)] transition-colors w-[110px] text-center">
            {time}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSection === 'dashboard' ? (
      <div className="flex-1 min-h-[750px] grid grid-cols-12 grid-rows-16 gap-4 pb-4">
        
        {/* TOP LEFT QUADRANT */}
        <div className="col-span-3 row-span-6 relative">
           <SystemDiagnostics />
        </div>
        <div className="col-span-3 row-span-4 relative">
           <BatteryHUD />
        </div>

        {/* CENTERPIECE CORES */}
        <div className="col-span-6 row-span-12 flex items-center justify-center -mt-8 relative z-10 pointer-events-none">
            <CenterpieceHUD />
        </div>

        {/* TOP RIGHT QUADRANT */}
        <div className="col-span-3 row-span-5 relative">
            <NetworkPanel />
        </div>
        <div className="col-span-3 row-span-5 relative">
            <ConnectivityPanel />
        </div>

        {/* BOTTOM LEFT QUADRANT */}
        <div className="col-span-6 row-span-6 relative">
            <LivePerformanceGraph />
        </div>

        {/* BOTTOM RIGHT QUADRANT (Actions & Notes) */}
        <div className="col-span-6 row-span-6 grid grid-cols-2 gap-4">
            <div className="col-span-1 border border-transparent hover:border-white/5 transition-all rounded-2xl p-1 bg-black/10"><ActionGrid /></div>
            <div className="col-span-1"><NotesPanel /></div>
        </div>
      </div>
      ) : activeSection === 'commands' ? (
        <ZoroDevLab />
      ) : activeSection === 'brospace' ? (
        <BroSpace />
      ) : (
        <div className="flex-1 flex items-center justify-center min-h-[500px]">
          <motion.div 
            key={activeSection}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center gap-6 glass-panel p-16 border border-cyber-cyan/20"
          >
            <div className="w-20 h-20 rounded-full bg-cyber-cyan/10 flex items-center justify-center border border-cyber-cyan/40 shadow-[0_0_30px_rgba(0,229,255,0.2)] animate-pulse-slow">
              <Cpu className="w-10 h-10 text-cyber-cyan drop-shadow-[0_0_10px_#00E5FF]" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white neon-text uppercase tracking-widest mb-2">Module Loading</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">
                {activeSection} section will be activated soon
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
