import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Send, Mic, Maximize2, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';
import { useZoro } from '../../context/ZoroContext';
import { useDevLab } from '../../context/DevLabContext';
import MicIndicator from './MicIndicator';

const suggestions = ["Ask for code", "Give advice", "Open apps"];

// ============================================================
// HAKI PARTICLES (lightweight canvas)
// ============================================================
function HakiParticles() {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let alive = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const make = () => ({
      x: Math.random() * canvas.offsetWidth,
      y: canvas.offsetHeight * (0.3 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.3 + 0.08),
      r: Math.random() * 1.6 + 0.5,
      a: Math.random() * 0.5 + 0.15,
      life: Math.random() * 250 + 120,
      max: 250,
    });
    const pts = Array.from({ length: 14 }, () => { const p = make(); p.max = p.life; return p; });

    const loop = () => {
      if (!alive) return;
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0 || p.y < -10) { Object.assign(p, make()); p.y = h + 5; p.max = p.life; }
        const fade = Math.min(p.life / (p.max * 0.3), 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,156,${p.a * fade})`;
        ctx.shadowBlur = 5;
        ctx.shadowColor = `rgba(0,255,156,${p.a * fade * 0.4})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { alive = false; cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} />;
}

// ============================================================
// LIGHTNING
// ============================================================
const Lightning = forwardRef(function Lightning(_, ref) {
  const [bolts, setBolts] = useState([]);
  const counter = useRef(0);

  const fire = useCallback(() => {
    const id = ++counter.current;
    setBolts(prev => [...prev, { id, x: 15 + Math.random() * 70, rot: -20 + Math.random() * 40, h: 30 + Math.random() * 40 }]);
    setTimeout(() => setBolts(prev => prev.filter(b => b.id !== id)), 350);
  }, []);

  useImperativeHandle(ref, () => ({ fire }), [fire]);

  useEffect(() => {
    let t;
    const sched = () => { t = setTimeout(() => { fire(); sched(); }, 4000 + Math.random() * 4000); };
    sched();
    return () => clearTimeout(t);
  }, [fire]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 8 }}>
      <AnimatePresence>
        {bolts.map(b => (
          <motion.div key={b.id}
            initial={{ opacity: 0, scaleY: 0.3 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12, exit: { duration: 0.25 } }}
            className="absolute"
            style={{ left: `${b.x}%`, top: '3%', height: `${b.h}%`, width: '2px', transform: `rotate(${b.rot}deg)`, transformOrigin: 'top center' }}>
            <div className="w-full h-full bg-white rounded-full" style={{ filter: 'blur(0.5px)' }} />
            <div className="absolute inset-0 bg-[#00FF9C] rounded-full" style={{ filter: 'blur(5px)', transform: 'scaleX(4)', opacity: 0.5 }} />
            <div className="absolute inset-0 bg-[#00FF9C] rounded-full" style={{ filter: 'blur(12px)', transform: 'scaleX(8)', opacity: 0.2 }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ZoroSidebar({ className, activeSection }) {
  const { messages, sendMessage, typing } = useZoro();
  const devLab = useDevLab();
  const [viewMode, setViewMode] = useState('idle');
  const [isFS, setIsFS] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [spiked, setSpiked] = useState(false);
  const [input, setInput] = useState('');

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const boltRef = useRef(null);
  const { playSFX } = useAudio();

  useEffect(() => {
    if (viewMode === 'chat') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, viewMode]);

  useEffect(() => {
    if (isFS) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isFS]);

  const spike = useCallback(() => { setSpiked(true); setTimeout(() => setSpiked(false), 800); }, []);

  const handleSend = async () => {
    if (!input.trim() || typing) return;
    const msg = input.trim();
    setInput('');
    boltRef.current?.fire(); spike();
    try {
      let devContext = null;
      if (activeSection === 'commands') {
        devContext = {
          workspaceName: devLab.workspaceName,
          activeFileId: devLab.activeFileId,
          fileSystem: devLab.fileSystem.map(f => ({ id: f.id, name: f.name, type: f.type, parentId: f.parentId })),
          activeFileContent: devLab.activeFileId ? devLab.fileContents[devLab.activeFileId] : null
        };
      }
      
      const result = await sendMessage(msg, devContext);
      
      if (result && result.actions && result.actions.length > 0) {
        result.actions.forEach(action => {
          if (action.type === 'updateFileContent' && action.fileId && action.content) {
             devLab.updateFileContent(action.fileId, action.content);
             devLab.addLog(`[ZORO AI] Updated file automatically.`, 'success');
          }
        });
      }

      playSFX('pulse'); boltRef.current?.fire();
    } catch (error) {
      console.error("Sidebar Zoro Error:", error);
    }
  };

  const chipClick = (t) => { playSFX('tap'); boltRef.current?.fire(); setViewMode('chat'); setInput(t); setTimeout(() => inputRef.current?.focus(), 350); };
  const toggleFS = () => { playSFX('click'); setIsFS(p => !p); };
  const goChat = () => { playSFX('click'); boltRef.current?.fire(); spike(); setViewMode('chat'); };

  const aBase = hovered ? 0.22 : 0.12;
  const aPeak = spiked ? 0.45 : (hovered ? 0.32 : 0.2);

  const headerControls = (
    <div className="absolute top-4 right-4 flex gap-2 items-center" style={{ zIndex: 50 }}>
      <MicIndicator />
      {viewMode === 'chat' && (
        <button onClick={() => { playSFX('tap'); setViewMode('idle'); }}
          className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg hover:text-cyber-cyan hover:border-cyber-cyan/40 transition-all text-gray-400">
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      <button onClick={toggleFS}
        className="p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg hover:text-cyber-neon hover:border-cyber-neon/40 transition-all text-gray-400">
        {isFS ? <X className="w-5 h-5" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  );

  const idleView = (
    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex flex-col items-center justify-end pb-8" style={{ zIndex: 20 }}>
      <motion.div className="absolute inset-0" style={{ zIndex: 1 }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: "url('/zoro_user_avatar.jpg')" }} />
      </motion.div>
      <motion.div animate={{ opacity: [aBase, aPeak, aBase] }} transition={{ duration: spiked ? 0.8 : 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'radial-gradient(ellipse 65% 55% at 50% 35%, rgba(0,255,156,0.4) 0%, transparent 70%)' }} />
      <HakiParticles />
      <Lightning ref={boltRef} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-black/65 to-transparent" style={{ zIndex: 9 }} />
      <div className="relative flex flex-col items-center text-center px-6 w-full" style={{ zIndex: 10, maxWidth: isFS ? '480px' : '100%' }}>
        <h1 className="text-6xl font-black text-white tracking-[0.3em] uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] mb-1" style={{ textShadow: '0 0 12px rgba(0,255,156,0.5), 0 0 30px rgba(0,255,156,0.3)' }}>Zoro</h1>
        <p className="text-[10px] text-cyber-neon tracking-[0.4em] uppercase font-mono mb-6 bg-black/50 px-4 py-1.5 rounded-md w-max border border-cyber-neon/25 backdrop-blur-sm">AI — Virtual Bro</p>
        <motion.button onClick={goChat} className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyber-neon to-cyber-cyan text-black font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_25px_rgba(0,255,156,0.2)] mb-7">Chat with Zoro</motion.button>
        <div className="flex flex-wrap justify-center gap-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => chipClick(s)} className="px-4 py-2 rounded-xl text-[11px] font-mono text-gray-400 bg-black/50 border border-white/10 hover:border-cyber-cyan/40 hover:text-white transition-all backdrop-blur-md">{s}</button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const chatView = (
    <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="absolute inset-0 flex flex-col bg-black/70 backdrop-blur-sm" style={{ zIndex: 20 }}>
      <div className="flex items-center gap-4 p-5 border-b border-white/10 flex-shrink-0 relative">
        <div className="relative group w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-cyber-neon/40 overflow-hidden shadow-[0_0_15px_rgba(0,255,156,0.3)]">
          <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/zoro_user_avatar.jpg')" }} />
        </div>
        <div>
          <h2 className="text-base font-black text-white tracking-widest uppercase">Zoro AI</h2>
        </div>
      </div>
      <div className={clsx("chat-container flex-1 overflow-y-auto p-5 flex flex-col gap-5 scroll-smooth", isFS && "px-6")}>
        <AnimatePresence>
          {messages.map(m => (
            <motion.div layout key={m.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={clsx('p-4 rounded-3xl text-[13px] leading-relaxed', m.sender === 'user' ? 'bg-white/10 text-gray-100 self-end rounded-tr-md border border-white/15' : 'bg-cyber-neon/10 text-cyber-neon self-start rounded-tl-md border border-cyber-neon/30')}>{m.text}</motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-cyber-neon/10 border border-cyber-neon/25 p-4 rounded-3xl self-start flex gap-2">
              {[0, 0.2, 0.4].map((d, i) => <motion.div key={i} className="w-1.5 h-1.5 bg-cyber-neon rounded-full" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 0.8, delay: d }} />)}
            </motion.div>
          )}
          <div ref={bottomRef} className="h-1" />
        </AnimatePresence>
      </div>
      <div className="p-4 border-t border-white/5 pt-5 flex-shrink-0">
        <div className="relative group">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Initialize protocol..." className="w-full bg-black/80 border border-white/10 rounded-2xl py-4 pl-5 pr-28 text-sm text-white focus:outline-none focus:border-cyber-neon/60 transition-all font-mono" />
          <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-cyber-neon/10 text-cyber-neon hover:bg-cyber-neon hover:text-black rounded-xl transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const panelInner = (
    <>
      {headerControls}
      <AnimatePresence mode="wait">
        {viewMode === 'idle' ? idleView : chatView}
      </AnimatePresence>
    </>
  );

  return (
    <>
      {!isFS && (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={clsx("flex flex-col relative overflow-hidden border border-white/10 bg-cyber-panel/60 backdrop-blur-xl rounded-2xl shadow-lg", className)} style={{ animationDelay: '200ms' }}>
          {panelInner}
        </div>
      )}
      {isFS && createPortal(
        <AnimatePresence>
          <motion.div key="zoro-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleFS} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }} />
          <motion.div key="zoro-panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
            <div className="flex flex-col relative overflow-hidden" style={{ width: '600px', maxWidth: '90%', height: '90vh', pointerEvents: 'auto', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,8,8,0.92)' }}>
              {panelInner}
            </div>
          </motion.div>
        </AnimatePresence>, document.body
      )}
    </>
  );
}
