import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sendMessage as apiSendMessage } from '../services/chatService';
import { useAudio } from './AudioContext';

const ZoroContext = createContext();

export const useZoro = () => {
    const context = useContext(ZoroContext);
    if (!context) throw new Error('useZoro must be used within a ZoroProvider');
    return context;
};

const generateSessionId = () => 'session_' + Date.now();
const initialMessages = [{ id: 1, text: "Hey! Ready to initialize protocols. How can I assist?", sender: "zoro" }];

export const ZoroProvider = ({ children }) => {
    const { playSFX } = useAudio();
    
    // ----- Chat Sessions State -----
    const [sessions, setSessions] = useState(() => {
        try {
            const stored = localStorage.getItem('zoro_sessions');
            if (stored) return JSON.parse(stored);
        } catch {}
        
        // Default fallback if no sessions
        const defaultId = generateSessionId();
        return [{ id: defaultId, title: 'Initialization Log', messages: initialMessages, pinned: false, updatedAt: Date.now() }];
    });

    const [currentSessionId, setCurrentSessionId] = useState(() => {
        try {
            const stored = localStorage.getItem('zoro_current_session_id');
            if (stored) return stored;
        } catch {}
        return sessions.length > 0 ? sessions[0].id : null;
    });

    // Ensure we always have an active session
    const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
    const messages = currentSession ? currentSession.messages : initialMessages;

    // ----- Brain / Memory State -----
    const [brainState, setBrainState] = useState(() => {
        const defaultState = { goals: [], memory: { important: [] }, lastUpdated: Date.now() };
        try {
            const stored = localStorage.getItem('zoro_brain_state');
            return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
        } catch {
            return defaultState;
        }
    });

    const [typing, setTyping] = useState(false);

    // Persist
    useEffect(() => {
        localStorage.setItem('zoro_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        if (currentSessionId) {
            localStorage.setItem('zoro_current_session_id', currentSessionId);
        }
    }, [currentSessionId]);

    useEffect(() => {
        localStorage.setItem('zoro_brain_state', JSON.stringify(brainState));
    }, [brainState]);

    const updateCurrentSession = useCallback((updater) => {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? updater(s) : s));
    }, [currentSessionId]);

    const sendMessage = useCallback(async (input, devLabContext = null) => {
        const trimmed = input.trim();
        if (!trimmed || typing) return;

        playSFX('swoosh');
        const userMsg = { id: Date.now(), text: trimmed, sender: 'user' };
        
        updateCurrentSession(s => ({
            ...s,
            title: s.title === 'New Chat' || s.title === 'Initialization Log' ? trimmed.slice(0, 25) + (trimmed.length > 25 ? '...' : '') : s.title,
            messages: [...s.messages, userMsg],
            updatedAt: Date.now()
        }));

        setTyping(true);

        try {
            const replyText = await apiSendMessage(trimmed, devLabContext);
            
            let finalReply = replyText;
            let actions = [];
            
            if (devLabContext) {
                try {
                    const parsed = JSON.parse(replyText);
                    finalReply = parsed.reply || replyText;
                    actions = parsed.actions || [];
                } catch (e) {
                    console.error("Failed to parse AI DevLab response:", e);
                }
            }

            playSFX('pop');
            const aiMsg = { id: Date.now() + 1, text: finalReply, sender: 'zoro' };
            
            updateCurrentSession(s => ({
                ...s,
                messages: [...s.messages, aiMsg],
                updatedAt: Date.now()
            }));
            
            return devLabContext ? { reply: finalReply, actions } : finalReply;
        } catch (error) {
            console.error("Zoro Context Error:", error);
            updateCurrentSession(s => ({
                ...s,
                messages: [...s.messages, { id: Date.now() + 1, text: "System error. Link failed.", sender: "zoro" }],
                updatedAt: Date.now()
            }));
        } finally {
            setTyping(false);
        }
    }, [typing, playSFX, currentSessionId, updateCurrentSession]);

    const resetBackend = async () => {
        try {
            await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset: true }),
            });
        } catch {}
    };

    const resetZoro = useCallback(async () => {
        playSFX('click');
        resetBackend();
        updateCurrentSession(s => ({ ...s, messages: [{ id: Date.now(), text: "System reset, bro. Locked and loaded.", sender: "zoro" }], updatedAt: Date.now() }));
    }, [playSFX, updateCurrentSession]);

    const createNewSession = useCallback(async () => {
        playSFX('click');
        resetBackend();
        const newId = generateSessionId();
        const newSession = {
            id: newId,
            title: 'New Chat',
            messages: initialMessages,
            pinned: false,
            updatedAt: Date.now()
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
    }, [playSFX]);

    const switchSession = useCallback(async (id) => {
        if (id === currentSessionId) return;
        playSFX('tap');
        setCurrentSessionId(id);
        resetBackend();
    }, [currentSessionId, playSFX]);

    const deleteSession = useCallback((id) => {
        playSFX('click');
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== id);
            if (filtered.length === 0) {
                // Cannot be empty, create default
                const newId = generateSessionId();
                setCurrentSessionId(newId);
                resetBackend();
                return [{ id: newId, title: 'New Chat', messages: initialMessages, pinned: false, updatedAt: Date.now() }];
            }
            if (id === currentSessionId) {
                // Switch to the most recently updated session
                const nextSessionId = filtered.sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
                setCurrentSessionId(nextSessionId);
                resetBackend();
            }
            return filtered;
        });
    }, [currentSessionId, playSFX]);

    const togglePinSession = useCallback((id) => {
        playSFX('tap');
        setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
    }, [playSFX]);

    const clearHistory = useCallback(() => {
        playSFX('click');
        setSessions(() => {
            const newId = generateSessionId();
            setCurrentSessionId(newId);
            return [{ id: newId, title: 'New Chat', messages: initialMessages, pinned: false, updatedAt: Date.now() }];
        });
        resetBackend();
    }, [playSFX]);

    return (
        <ZoroContext.Provider value={{ 
            messages, 
            typing, 
            brainState, 
            sessions,
            currentSessionId,
            sendMessage, 
            resetZoro,
            createNewSession,
            switchSession,
            deleteSession,
            togglePinSession,
            clearHistory,
            // Helper setMessages wrapper to maintain backwards compatibility
            setMessages: (updater) => {
                updateCurrentSession(s => ({ ...s, messages: typeof updater === 'function' ? updater(s.messages) : updater }));
            }
        }}>
            {children}
        </ZoroContext.Provider>
    );
};
