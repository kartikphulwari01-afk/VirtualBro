import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader, Volume2 } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext';

export default function MicIndicator({ className }) {
    const { status, isPaused, isActive, startListening, stopListening } = useVoice();

    const getStatusConfig = () => {
        if (!isActive) return { icon: MicOff, color: 'text-gray-500', bg: 'bg-gray-500/10', glow: '', label: 'Voice Off' };
        if (isPaused) return { icon: MicOff, color: 'text-orange-400', bg: 'bg-orange-400/10', glow: 'shadow-[0_0_10px_rgba(251,146,60,0.5)]', label: 'Paused' };
        
        switch (status) {
            case 'listening': return { icon: Mic, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/10', glow: 'shadow-[0_0_15px_rgba(0,229,255,0.6)] animate-pulse-slow', label: 'Listening' };
            case 'processing': return { icon: Loader, color: 'text-cyber-neon', bg: 'bg-cyber-neon/10', glow: 'shadow-[0_0_15px_rgba(0,255,156,0.6)] animate-spin-slow', label: 'Processing' };
            case 'speaking': return { icon: Volume2, color: 'text-cyber-purple', bg: 'bg-cyber-purple/10', glow: 'shadow-[0_0_15px_rgba(176,38,255,0.6)]', label: 'Speaking' };
            case 'idle':
            default:
                return { icon: Mic, color: 'text-gray-400', bg: 'bg-gray-400/10', glow: '', label: 'Idle' };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    const toggleVoice = () => {
        if (isActive) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <AnimatePresence mode="wait">
                <motion.span 
                    key={config.label}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="text-[10px] uppercase tracking-widest font-mono text-gray-500 hidden md:block"
                >
                    {config.label}
                </motion.span>
            </AnimatePresence>

            <button 
                onClick={toggleVoice}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 ${config.bg} ${config.glow}`}
                title={isActive ? "Stop Voice Mode" : "Start Voice Mode"}
            >
                <Icon className={`w-4 h-4 ${config.color}`} />
                {isActive && status === 'listening' && !isPaused && (
                    <motion.div 
                        className="absolute inset-0 rounded-full border border-cyber-cyan"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </button>
        </div>
    );
}
