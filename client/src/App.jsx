import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from './components/layout/Sidebar';
import MainDashboard from './components/dashboard/MainDashboard';
import ZoroSidebar from './components/ai/ZoroSidebar';
import ZoroOS from './components/ai/ZoroOS';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { AudioProvider } from './context/AudioContext';
import { ZoroProvider } from './context/ZoroContext';
import { DevLabProvider } from './context/DevLabContext';
import { VoiceProvider } from './context/VoiceContext';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for parallax
  const springConfig = { damping: 40, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 50; 
    const y = (e.clientY / window.innerHeight - 0.5) * 50;
    mouseX.set(x);
    mouseY.set(y);
  };

  // Convert smooth mouse to parallax offsets
  const bgX = useTransform(smoothX, [ -25, 25 ], [ 10, -10 ]);
  const bgY = useTransform(smoothY, [ -25, 25 ], [ 10, -10 ]);
  
  const fgX = useTransform(smoothX, [ -25, 25 ], [ -10, 10 ]);
  const fgY = useTransform(smoothY, [ -25, 25 ], [ -10, 10 ]);
  
  // STRICT: Disable body scroll to prevent screen jump bugs
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <AudioProvider>
      <ZoroProvider>
        <DevLabProvider>
          <VoiceProvider setActiveSection={setActiveSection}>
            <div 
              className="flex h-screen w-screen overflow-hidden bg-cyber-bg text-gray-200 relative perspective-[1000px]"
              onMouseMove={handleMouseMove}
            >
            {/* Background Particles & Parallax */}
            <motion.div 
              className="absolute inset-0 z-0 pointer-events-none overflow-hidden origin-center scale-110"
              style={{ x: bgX, y: bgY }}
            >
              <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-cyber-neon/15 rounded-full blur-[140px] mix-blend-screen" />
              <div className="absolute bottom-[20%] right-[30%] w-[30rem] h-[30rem] bg-cyber-purple/15 rounded-full blur-[160px] mix-blend-screen" />
              <div className="absolute top-[50%] right-[10%] w-64 h-64 bg-cyber-cyan/15 rounded-full blur-[120px] mix-blend-screen" />
              
              {/* Particle Dots Mock */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay animate-pulse-slow"></div>
              {/* Scanlines Effect */}
              <div className="absolute inset-0 scanlines opacity-10 mix-blend-overlay"></div>
            </motion.div>

            {/* Foreground Content */}
            <motion.div 
               className="relative z-10 flex w-full h-full p-4 gap-4 transform-gpu"
               style={{ x: fgX, y: fgY }}
            >
              <Sidebar className="w-[80px] shrink-0" active={activeSection} setActive={setActiveSection} />
              
              <AnimatePresence mode="wait">
                {activeSection !== 'zoro' ? (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="flex-grow shrink min-w-0 flex"
                  >
                    <MainDashboard className="flex-grow shrink min-w-0" activeSection={activeSection} />
                    <ZoroSidebar className="w-[380px] shrink-0 ml-4" activeSection={activeSection} />
                  </motion.div>
                ) : (
                  <ZoroOS key="zoro" onClose={() => setActiveSection('dashboard')} />
                )}
              </AnimatePresence>

            </motion.div>
          </div>
          </VoiceProvider>
        </DevLabProvider>
      </ZoroProvider>
    </AudioProvider>
  );
}
