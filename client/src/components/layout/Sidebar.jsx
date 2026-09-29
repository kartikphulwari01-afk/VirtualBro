import React, { useState } from 'react';
import { LayoutDashboard, Terminal, BrainCircuit, NotebookPen, Cpu, PlaySquare, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'commands', icon: Terminal, label: 'Commands' },
  { id: 'zoro', icon: BrainCircuit, label: 'Zoro AI' },
  { id: 'brospace', icon: NotebookPen, label: 'BroSpace' },
  { id: 'automation', icon: Cpu, label: 'Automation' },
  { id: 'media', icon: PlaySquare, label: 'Media' },
];

export default function Sidebar({ className, active, setActive }) {

  return (
    <div className={clsx("glass-panel flex flex-col items-center py-6 justify-between neon-border", className)}>
      <div className="flex flex-col items-center gap-8 w-full">
        {/* Brand Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-neon/40 to-cyber-cyan/10 flex items-center justify-center border border-cyber-neon/50 shadow-[0_0_15px_rgba(0,255,156,0.3)]">
          <BrainCircuit className="w-7 h-7 text-cyber-neon" />
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-4 w-full px-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="relative group w-full aspect-square flex items-center justify-center rounded-xl transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-cyber-neon/20 rounded-xl border border-cyber-neon/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon 
                  className={clsx(
                    "w-6 h-6 transition-all duration-300 relative z-10",
                    isActive ? "text-cyber-neon drop-shadow-[0_0_8px_rgba(0,255,156,0.8)]" : "text-gray-500 group-hover:text-gray-300"
                  )} 
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button className="p-3 text-gray-500 hover:text-cyber-cyan transition-colors group">
          <Settings className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
        </button>
        <div className="w-10 h-10 rounded-full border border-cyber-purple/50 bg-cyber-purple/10 flex items-center justify-center shadow-[0_0_10px_rgba(176,38,255,0.2)]">
          <User className="w-5 h-5 text-cyber-purple drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]" />
        </div>
      </div>
    </div>
  );
}
