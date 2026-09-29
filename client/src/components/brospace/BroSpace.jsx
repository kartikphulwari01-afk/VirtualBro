import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =========================================================================
// FUTURE MODULES STUB (Do not implement yet, keep structure clean)
// =========================================================================
// import MusicSystem from './MusicSystem';
// import AmbientSounds from './AmbientSounds';
// import VoiceMode from './VoiceMode';
// import MiniGames from './MiniGames';
// import NotesPanel from './NotesPanel';

const DIALOGUES = [
  "Good afternoon bro.",
  "Water pi le.",
  "Need help with something?",
  "Keep building.",
  "Aaj productive lag raha hai."
];

export default function BroSpace() {
  const [dialogueIndex, setDialogueIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDialogueIndex((prev) => (prev + 1) % DIALOGUES.length);
    }, 12000); // Rotate every 12 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden rounded-2xl border border-white/5 bg-black shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* 1. FULL ROOM BACKGROUND (Static as requested) */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/zoro_full_body.jpg')" }}
      />
      
      {/* 2. ENERGY RING ANIMATION (Overlay over existing baked ring) */}
      <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[300px] h-[80px] md:w-[600px] md:h-[140px] pointer-events-none perspective-[1000px]">
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
            opacity: [0.3, 0.6, 0.3],
            boxShadow: [
              "0 0 20px rgba(0,255,156,0.1) inset, 0 0 10px rgba(0,255,156,0.2)",
              "0 0 60px rgba(0,255,156,0.4) inset, 0 0 30px rgba(0,255,156,0.5)",
              "0 0 20px rgba(0,255,156,0.1) inset, 0 0 10px rgba(0,255,156,0.2)"
            ]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full rounded-[50%] border-2 border-cyber-neon/40"
          style={{ transform: "rotateX(75deg)" }}
        />
      </div>

      {/* 3. ROOM PARTICLES (Atmospheric Dust) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-50">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: "110%", 
              x: `${Math.random() * 100}%`,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: "-10%",
              opacity: [0, 0.6, 0],
              x: `${Math.random() * 100}%`
            }}
            transition={{ 
              duration: Math.random() * 15 + 15, 
              repeat: Infinity, 
              delay: Math.random() * 20,
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-cyber-neon rounded-full blur-[1px] shadow-[0_0_8px_#00FF9C]"
          />
        ))}
      </div>

      {/* 4. AI ORB & DIALOGUE BUBBLE */}
      {/* Positioned near Zoro's upper-left side based on standard central alignment */}
      <div className="absolute top-[30%] left-[35%] flex flex-col items-center pointer-events-none">
        
        {/* Dialogue Bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={dialogueIndex}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-cyber-cyan/30 rounded-2xl rounded-br-sm shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          >
            <p className="text-xs md:text-sm font-mono text-cyber-cyan tracking-wider drop-shadow-[0_0_5px_#00E5FF] whitespace-nowrap">
              {DIALOGUES[dialogueIndex]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Floating AI Orb (Cyan Companion Core) */}
        <motion.div
          animate={{ y: [-5, 5, -5], rotate: [0, 360] }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="w-5 h-5 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/80 shadow-[0_0_20px_#00E5FF] flex items-center justify-center relative"
        >
          {/* Inner Core */}
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
          
          {/* Outer Pulse */}
          <motion.div 
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-cyber-cyan"
          />
        </motion.div>

      </div>

    </div>
  );
}
