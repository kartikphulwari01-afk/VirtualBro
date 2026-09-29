import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';

export default function MusicPanel() {
  return (
    <div className="h-full w-full glass-panel flex flex-col p-3 border-cyber-purple/30 bg-gradient-to-tr from-[#050505] to-cyber-purple/10">
      <div className="flex gap-3">
         <div className="w-16 h-16 rounded-lg bg-[url('https://images.unsplash.com/photo-1614613535308-30af563d7f95?q=80&w=200&auto=format&fit=crop')] bg-cover bg-center border border-cyber-purple/50 shadow-[0_0_15px_rgba(176,38,255,0.4)]" />
         <div className="flex flex-col justify-center">
            <h3 className="text-white text-sm font-bold tracking-wide">Cyberpunk Lofi Mix</h3>
            <p className="text-[10px] text-cyber-neon uppercase tracking-widest flex items-center gap-1 mt-1">
               <span className="w-1 h-3 bg-cyber-neon animate-pulse rounded-full" style={{animationDuration: '0.5s'}} />
               <span className="w-1 h-4 bg-cyber-neon animate-pulse rounded-full" style={{animationDuration: '0.8s'}} />
               <span className="w-1 h-2 bg-cyber-neon animate-pulse rounded-full" style={{animationDuration: '0.3s'}} />
               <span className="ml-1 text-gray-400">Now Playing</span>
            </p>
         </div>
      </div>
      
      <div className="mt-auto flex flex-col gap-2">
         {/* Progress */}
         <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-cyber-cyan to-cyber-purple shadow-[0_0_8px_#B026FF]" />
         </div>
         <div className="flex justify-between text-[8px] text-gray-500 font-mono">
            <span>02:18</span>
            <span>24:36</span>
         </div>
         
         {/* Controls */}
         <div className="flex items-center justify-center gap-4 mt-1">
            <button className="text-gray-400 hover:text-white transition-colors"><SkipBack className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded-full bg-cyber-purple/20 border border-cyber-purple flex items-center justify-center text-cyber-purple hover:bg-cyber-purple hover:text-white transition-all shadow-[0_0_10px_rgba(176,38,255,0.3)]">
              <Pause className="w-4 h-4 fill-current" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors"><SkipForward className="w-4 h-4" /></button>
         </div>
      </div>
    </div>
  );
}
