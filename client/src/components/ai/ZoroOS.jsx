import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Send, Mic, X, MessageSquarePlus, Trash2, Edit2, Search, BrainCircuit, Settings, Save, Terminal, MessageSquare, Pin, PinOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';
import { useZoro } from '../../context/ZoroContext';
import ReactMarkdown from 'react-markdown';
import MicIndicator from './MicIndicator';

export default function ZoroOS({ onClose }) {
  const { playSFX } = useAudio();
  const { messages, sendMessage, typing, brainState, resetZoro, clearHistory, sessions, currentSessionId, createNewSession, switchSession, deleteSession, togglePinSession } = useZoro();

  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const bottomRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  // Scroll chat to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || typing) return;
    setInput('');
    try {
      await sendMessage(trimmed);
    } catch (error) {
      console.error("OS Zoro Error:", error);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredMessages = messages.filter(m => (m.text || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 left-[80px] w-[calc(100%-80px)] h-screen z-[100] flex flex-col bg-black overflow-y-auto overflow-x-hidden font-sans border-l border-white/5 custom-scrollbar"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-cyber-neon/10 rounded-full blur-[150px]" />
         <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-cyber-cyan/10 rounded-full blur-[120px]" />
      </div>

      {/* TOP BAR */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 glass-panel border-b border-white/5 bg-black/60 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyber-neon/10 border border-cyber-neon/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,156,0.2)]">
             <BrainCircuit className="w-6 h-6 text-cyber-neon" />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Zoro OS</h1>
        </div>

        <div className="flex items-center gap-3">
           <MicIndicator />
           <button onClick={resetZoro} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2">
             <Trash2 className="w-3.5 h-3.5" /> Full Reset
           </button>
           <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20 font-mono text-[10px] uppercase tracking-wider flex items-center gap-2">
             <X className="w-4 h-4" /> Exit OS
           </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 p-4 gap-4 max-w-[1800px] mx-auto w-full min-h-[750px] pb-8">
        
        {/* LEFT PANEL: HISTORY-LIKE FILTER */}
        <aside className="w-[280px] h-full shrink-0 glass-panel border border-white/5 rounded-2xl flex flex-col bg-black/40 overflow-hidden">
          <div className="p-4 border-b border-white/5 space-y-4">
             <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filter logs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[11px] font-mono text-gray-300 outline-none focus:border-cyber-cyan/50"
                />
             </div>
             <button onClick={createNewSession} className="w-full flex items-center justify-center gap-2 p-2.5 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 rounded-xl text-cyber-cyan text-xs font-mono uppercase tracking-wider transition-colors">
                <MessageSquarePlus className="w-4 h-4" /> New Chat
             </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col gap-6">
             <div className="space-y-4">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block font-bold">Brain Goals</label>
                {(brainState.goals || []).length > 0 ? (
                  <ul className="space-y-2">
                    {brainState.goals.map((g, i) => (
                      <li key={`goal-${i}-${g}`} className="text-[11px] text-cyber-neon/80 bg-cyber-neon/5 border border-cyber-neon/10 p-2 rounded-lg font-mono">
                        {'>'} {g}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-gray-600 font-mono italic">No mapped goals yet...</p>
                )}
             </div>

             <div className="space-y-4">
                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block font-bold">Chat History</label>
                <div className="space-y-2">
                   {sortedSessions.map((session) => {
                      const isActive = session.id === currentSessionId;
                      return (
                         <div 
                            key={session.id}
                            onClick={() => switchSession(session.id)}
                            className={clsx(
                               "group text-[11px] font-mono p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between",
                               isActive 
                                  ? "bg-white/10 border border-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
                                  : "bg-transparent border border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            )}
                         >
                            <div className="flex items-center gap-2 overflow-hidden">
                               {session.pinned ? <Pin className="w-3 h-3 text-cyber-neon shrink-0" /> : <MessageSquare className="w-3.5 h-3.5 shrink-0" />}
                               <span className="truncate">{session.title}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); togglePinSession(session.id); }}
                                  className={clsx("p-1 rounded hover:bg-white/20", session.pinned ? "text-cyber-neon" : "text-gray-400 hover:text-white")}
                                  title={session.pinned ? "Unpin Chat" : "Pin Chat"}
                               >
                                  {session.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                               </button>
                               <button 
                                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                  className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-400/20"
                                  title="Delete Chat"
                               >
                                  <Trash2 className="w-3 h-3" />
                               </button>
                            </div>
                            
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyber-neon animate-pulse shadow-[0_0_8px_rgba(0,255,156,0.8)] ml-1 shrink-0 group-hover:hidden"></span>}
                         </div>
                      );
                   })}
                </div>
             </div>
          </div>
        </aside>

        {/* CENTER PANEL: CHAT */}
        <section className="flex-1 h-full min-h-0 glass-panel border border-white/5 rounded-2xl flex flex-col bg-black/60 shadow-2xl relative overflow-hidden">
          <div ref={chatRef} className="flex-1 overflow-y-auto h-full p-6 chat-container">
            <div className="max-w-4xl mx-auto space-y-6">
              {filteredMessages.map((msg) => {
                const isZoro = msg.sender === 'zoro';
                return (
                  <div key={msg.id} className={clsx("flex w-full", isZoro ? "justify-start" : "justify-end")}>
                     {isZoro && (
                        <div className="w-8 h-8 rounded-full bg-cyber-neon/10 border border-cyber-neon/30 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-[0_0_8px_rgba(0,255,156,0.2)]">
                           <BrainCircuit className="w-4 h-4 text-cyber-neon" />
                        </div>
                     )}
                     <div className={clsx(
                       "relative px-5 py-3.5 max-w-[85%] rounded-2xl text-[14px] leading-relaxed shadow-lg",
                       isZoro 
                          ? "bg-black/80 border border-cyber-neon/20 text-gray-200 rounded-tl-sm backdrop-blur-md" 
                          : "bg-gradient-to-br from-cyber-cyan/30 to-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan rounded-tr-sm backdrop-blur-md"
                     )}>
                        {isZoro ? (
                           <div className="markdown-body text-gray-200">
                             <ReactMarkdown>
                               {msg.text || ''}
                             </ReactMarkdown>
                           </div>
                        ) : (
                           <span className="whitespace-pre-wrap">{msg.text}</span>
                        )}
                        <div className={clsx("absolute -bottom-5 text-[9px] font-mono opacity-50", isZoro ? 'left-2' : 'right-2')}>
                          {new Date(msg.id).toLocaleTimeString()}
                        </div>
                     </div>
                  </div>
                );
              })}
              {typing && (
                 <div className="flex w-full justify-start mt-2">
                    <div className="w-8 h-8 rounded-full bg-cyber-neon/10 animate-pulse border border-cyber-neon/30 flex items-center justify-center shrink-0 mr-3">
                       <BrainCircuit className="w-4 h-4 text-cyber-neon" />
                    </div>
                    <div className="px-5 py-4 bg-black/80 border border-cyber-neon/20 rounded-2xl flex gap-1 items-center">
                       <div className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                 </div>
              )}
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-black/40 border-t border-white/5">
            <div className="max-w-4xl mx-auto relative group">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Transmit message to Zoro..."
                  className="w-full bg-transparent text-gray-200 outline-none py-3 px-4 text-sm font-mono"
                />
                <button type="submit" disabled={typing || !input.trim()} className="p-3 bg-cyber-neon/10 border border-cyber-neon/30 text-cyber-neon rounded-xl hover:bg-cyber-neon hover:text-black transition-all disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: SYSTEM STATUS */}
        <aside className="w-[280px] h-full shrink-0 glass-panel border border-white/5 rounded-2xl flex flex-col bg-black/40 overflow-hidden">
          <div className="p-5 border-b border-white/5">
             <h3 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyber-purple">Core Status</h3>
          </div>
          <div className="p-5 space-y-6">
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 font-mono uppercase">Sync</span>
                  <span className="text-[10px] text-cyber-neon font-mono uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center bg-black/50 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 font-mono uppercase">Zoro Ver</span>
                  <span className="text-[10px] text-cyber-cyan font-mono uppercase">1.5 Flash</span>
                </div>
             </div>
             <button onClick={clearHistory} className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono uppercase tracking-widest text-gray-400">
                <MessageSquare className="w-4 h-4" /> Clear History
             </button>
          </div>
        </aside>

      </main>
    </motion.div>
  );
}
