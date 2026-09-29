import React, { useState } from 'react';
import { PencilLine, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotesPanel() {
  const [notes, setNotes] = useState([
    { id: 1, text: "Configure quantum routing protocols." }
  ]);
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, { id: Date.now(), text: newNote }]);
    setNewNote('');
  };

  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="h-full glass-panel neon-border border-cyber-neon/30 flex flex-col p-3 relative z-20 group transition-all">
      <div className="text-[10px] uppercase tracking-widest text-cyber-neon/80 font-bold mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2"><PencilLine className="w-3 h-3 group-hover:text-cyber-neon transition-colors" /> Local Logic Blocks</span>
        <span className="bg-cyber-neon/10 px-1.5 py-0.5 rounded text-cyber-neon border border-cyber-neon/40 shadow-[0_0_8px_rgba(0,255,156,0.2)]">SECURE</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 mb-2 pr-1">
         <AnimatePresence>
            {notes.map(note => (
               <motion.div 
                 key={note.id}
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="bg-black/40 border border-white/5 hover:border-cyber-cyan/30 rounded-lg p-2 text-xs text-gray-300 font-mono tracking-tight flex justify-between group/note transition-all"
               >
                 <span className="truncate">{note.text}</span>
                 <button onClick={() => handleDelete(note.id)} className="opacity-0 group-hover/note:opacity-100 text-red-400 hover:text-red-300 transition-all scale-75">
                    <Trash2 className="w-4 h-4" />
                 </button>
               </motion.div>
            ))}
         </AnimatePresence>
      </div>

      <div className="mt-auto relative flex items-center">
         <input 
            type="text" 
            placeholder="Add note..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full bg-black/60 border border-white/10 hover:border-cyber-cyan/30 focus:border-cyber-cyan/60 rounded-xl py-2 pl-3 pr-10 text-xs text-white placeholder-gray-600 focus:outline-none transition-all font-mono"
         />
         <button onClick={handleAdd} className="absolute right-1 w-7 h-7 flex items-center justify-center text-cyber-cyan hover:bg-cyber-cyan/20 hover:shadow-[0_0_8px_rgba(0,229,255,0.4)] rounded-lg transition-all">
            <Plus className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}
