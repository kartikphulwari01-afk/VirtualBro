import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BoxSelect, TerminalSquare, Camera, Cpu, ScanLine, Smartphone, Loader2, Check, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';

const API = 'http://localhost:5000';

// ============================================================
// MINI TERMINAL COMPONENT
// ============================================================
function MiniTerminal({ open, onClose }) {
  const { playSFX } = useAudio();
  const [history, setHistory] = useState([
    { type: 'system', text: '╔══════════════════════════════════════╗' },
    { type: 'system', text: '║   VirtualBro Terminal v1.0           ║' },
    { type: 'system', text: '║   Type "help" for commands           ║' },
    { type: 'system', text: '╚══════════════════════════════════════╝' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [history]);

  const HELP_TEXT = `Available commands:
  dir, ls          — List files
  cd <path>        — Show directory
  echo <text>      — Print text
  node -v          — Node.js version
  npm -v           — npm version
  hostname         — Machine name
  whoami           — Current user
  ipconfig         — Network config
  ping <host>      — Ping a host
  nslookup <host>  — DNS lookup
  netstat          — Network connections
  tasklist         — Running processes
  systeminfo       — System details
  ver              — Windows version
  cls / clear      — Clear terminal
  help             — Show this list`;

  const exec = async (cmd) => {
    if (!cmd.trim()) return;
    playSFX('tap');
    setBusy(true);

    setHistory(prev => [...prev, { type: 'input', text: cmd }]);
    setCmdHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput('');

    // Local commands
    if (/^help$/i.test(cmd.trim())) {
      setHistory(prev => [...prev, { type: 'output', text: HELP_TEXT }]);
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const d = await res.json();

      if (d.success) {
        playSFX('pulse');
        if (d.output === '__CLEAR__') {
          setHistory([]);
        } else {
          setHistory(prev => [...prev, { type: 'output', text: d.output || '(no output)' }]);
        }
      } else {
        playSFX('click');
        setHistory(prev => [...prev, { type: 'error', text: d.error || 'Unknown error' }]);
      }
    } catch {
      playSFX('click');
      setHistory(prev => [...prev, { type: 'error', text: 'Connection failed' }]);
    }
    setBusy(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !busy) {
      exec(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const next = Math.min(histIdx + 1, cmdHistory.length - 1);
        setHistIdx(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        const next = histIdx - 1;
        setHistIdx(next);
        setInput(cmdHistory[next]);
      } else {
        setHistIdx(-1);
        setInput('');
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 9994, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9995, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', pointerEvents: 'none' }}
          >
            <div
              className="flex flex-col"
              onClick={e => e.stopPropagation()}
              style={{
                width: '700px', maxWidth: '95%', height: '75vh',
                pointerEvents: 'auto', borderRadius: '20px', overflow: 'hidden',
                border: '1px solid rgba(0,255,156,0.15)',
                background: 'rgba(5,5,5,0.95)',
                boxShadow: '0 0 60px rgba(0,255,156,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {/* Title Bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/60 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono text-cyber-neon/70 uppercase tracking-widest">VirtualBro Terminal</span>
                </div>
                <span className="text-[9px] font-mono text-gray-600">safe mode</span>
              </div>

              {/* Output Area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-[1.7]" onClick={() => inputRef.current?.focus()}>
                {history.map((line, i) => (
                  <div key={i} className={
                    line.type === 'input' ? 'text-cyber-cyan' :
                    line.type === 'error' ? 'text-red-400' :
                    line.type === 'system' ? 'text-cyber-neon/60' :
                    'text-gray-400'
                  }>
                    {line.type === 'input' && (
                      <span className="text-cyber-neon/50 mr-2 select-none">❯</span>
                    )}
                    <pre className="whitespace-pre-wrap inline">{line.text}</pre>
                  </div>
                ))}

                {/* Current Input Line */}
                <div className="flex items-center mt-1 group">
                  <span className="text-cyber-neon mr-2 select-none flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 inline-block group-hover:scale-110 transition-transform" />
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      disabled={busy}
                      className="flex-1 bg-transparent text-cyber-cyan outline-none font-mono text-[12px] caret-transparent placeholder:text-gray-700"
                      placeholder={busy ? 'executing...' : 'type a command...'}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    {/* Visual blinking cursor because we set caret-transparent */}
                    {!busy && inputRef.current === document.activeElement && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="absolute h-4 w-2 bg-cyber-neon/80"
                        style={{ 
                          left: `${input.length * 7.2}px`, // Approximate width for font-mono 12px
                          display: 'inline-block' 
                        }}
                      />
                    )}
                  </div>
                  {busy && <Loader2 className="w-3.5 h-3.5 text-cyber-neon animate-spin flex-shrink-0 ml-2" />}
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-5 py-2 border-t border-white/5 bg-black/40 text-[9px] font-mono text-gray-600 flex-shrink-0">
                <span className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${busy ? 'bg-yellow-500 animate-pulse' : 'bg-cyber-neon'}`} />
                   {busy ? 'BUSY' : 'READY'}
                </span>
                <span>C:\WINDOWS\SYSTEM32</span>
                <span className="text-cyber-neon/40">v1.2.0 • PRO</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ============================================================
// ACTION GRID (main export)
// ============================================================
export default function ActionGrid() {
  const { playSFX } = useAudio();
  const [states, setStates] = useState({});
  const [modal, setModal] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const setState = (key, val) => {
    setStates(prev => ({ ...prev, [key]: val }));
    if (val === 'success' || val === 'error') {
      setTimeout(() => setStates(prev => ({ ...prev, [key]: 'idle' })), 2000);
    }
  };

  const openApp = useCallback(async () => {
    const target = prompt('Enter app name or URL to open:', 'https://google.com');
    if (!target) return;
    playSFX('tap');
    setState('open', 'loading');
    try {
      const res = await fetch(`${API}/api/open-app`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const d = await res.json();
      if (d.success) { setState('open', 'success'); playSFX('pulse'); }
      else { setState('open', 'error'); }
    } catch { setState('open', 'error'); }
  }, [playSFX]);

  const openTerminal = useCallback(() => {
    playSFX('tap');
    setTerminalOpen(true);
  }, [playSFX]);

  const takeScreenshot = useCallback(async () => {
    playSFX('tap');
    setState('ss', 'loading');
    try {
      const res = await fetch(`${API}/api/screenshot`, { method: 'POST' });
      const d = await res.json();
      if (d.success) {
        setState('ss', 'success');
        playSFX('pulse');
        setModal({ type: 'Screenshot Captured', content: `${API}${d.url}`, isImage: true });
      } else { setState('ss', 'error'); }
    } catch { setState('ss', 'error'); }
  }, [playSFX]);

  const netScan = useCallback(async () => {
    playSFX('tap');
    setState('scan', 'loading');
    try {
      const res = await fetch(`${API}/api/run-command`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'netstat' }),
      });
      const d = await res.json();
      if (d.success) {
        setState('scan', 'success'); playSFX('pulse');
        setModal({ type: 'Network Scan', content: d.output });
      } else { setState('scan', 'error'); }
    } catch { setState('scan', 'error'); }
  }, [playSFX]);

  const sysInfo = useCallback(async () => {
    playSFX('tap');
    setState('auto', 'loading');
    try {
      const res = await fetch(`${API}/api/run-command`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'processes' }),
      });
      const d = await res.json();
      if (d.success) {
        setState('auto', 'success'); playSFX('pulse');
        setModal({ type: 'Top Processes', content: d.output });
      } else { setState('auto', 'error'); }
    } catch { setState('auto', 'error'); }
  }, [playSFX]);

  const actions = [
    { key: 'open', label: 'Open App', icon: BoxSelect, color: 'text-cyber-cyan', border: 'border-cyber-cyan/40', bg: 'hover:bg-cyber-cyan/20', handler: openApp },
    { key: 'cmd', label: 'Run Command', icon: TerminalSquare, color: 'text-cyber-neon', border: 'border-cyber-neon/40', bg: 'hover:bg-cyber-neon/20', handler: openTerminal },
    { key: 'scan', label: 'Net Scan', icon: ScanLine, color: 'text-white', border: 'border-white/20', bg: 'hover:bg-white/10', handler: netScan },
    { key: 'ss', label: 'Screenshot', icon: Camera, color: 'text-white', border: 'border-white/20', bg: 'hover:bg-white/10', handler: takeScreenshot },
    { key: 'voice', label: 'Voice Input', icon: Smartphone, color: 'text-cyber-cyan', border: 'border-cyber-cyan/40', bg: 'hover:bg-cyber-cyan/20', handler: () => playSFX('tap') },
    { key: 'auto', label: 'Processes', icon: Cpu, color: 'text-cyber-purple', border: 'border-cyber-purple/40', bg: 'hover:bg-cyber-purple/20', handler: sysInfo },
  ];

  const getIcon = (act) => {
    const s = states[act.key];
    if (s === 'loading') return <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />;
    if (s === 'success') return <Check className="w-6 h-6 text-cyber-neon drop-shadow-[0_0_8px_#00FF9C]" />;
    if (s === 'error') return <AlertCircle className="w-6 h-6 text-red-400" />;
    const Icon = act.icon;
    return <Icon className={`w-6 h-6 ${act.color} group-hover:drop-shadow-[0_0_8px_currentColor]`} />;
  };

  return (
    <>
      <div className="h-full flex flex-col relative z-20">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold text-center">Quick Actions</div>
        <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2">
          {actions.map((act) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={act.handler}
              disabled={states[act.key] === 'loading'}
              key={act.key}
              className={`glass-panel border ${act.border} flex flex-col items-center justify-center gap-1 transition-all group ${act.bg} disabled:opacity-50 disabled:cursor-wait`}
            >
              {getIcon(act)}
              <span className="text-[10px] text-gray-300 font-mono tracking-wider">{act.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mini Terminal Portal */}
      <MiniTerminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />

      {/* Result Modal for screenshots etc */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 9990, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl max-h-[80vh] bg-black/90 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_40px_rgba(0,255,156,0.1)]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-xs font-mono text-cyber-neon uppercase tracking-widest">{modal.type}</span>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white text-sm font-mono">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {modal.isImage ? (
                  <img src={modal.content} alt="Screenshot" className="w-full rounded-lg border border-white/5" />
                ) : (
                  <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">{modal.content}</pre>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
