import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { VoiceRecognitionService } from '../services/voice/VoiceRecognitionService';
import { VoiceResponseService } from '../services/voice/VoiceResponseService';
import { CommandParser } from '../services/voice/CommandParser';
import { useAudio } from './AudioContext';

const VoiceContext = createContext();

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children, setActiveSection }) => {
    const { toggleMute } = useAudio();
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [isPaused, setIsPaused] = useState(false);
    const [history, setHistory] = useState([]);
    const [isActive, setIsActive] = useState(false); // Global toggle flag

    const recognitionRef = useRef(null);
    const responseRef = useRef(null);
    const parserRef = useRef(null);

    useEffect(() => {
        responseRef.current = new VoiceResponseService(
            () => setStatus('speaking'),
            () => setStatus(isActive && !isPaused ? 'listening' : 'idle')
        );

        parserRef.current = new CommandParser({
            speak: (text) => responseRef.current.speak(text),
            setActiveSection,
            toggleMute,
            isPaused,
            setIsPaused: (val) => {
                setIsPaused(val);
                if (!val) setStatus('listening');
            }
        });

    }, [setActiveSection, toggleMute, isPaused, isActive]);

    useEffect(() => {
        if (!recognitionRef.current) {
            recognitionRef.current = new VoiceRecognitionService(
                (transcript) => {
                    if (!parserRef.current.context.isPaused) {
                        setStatus('processing');
                    }
                    const result = parserRef.current.parse(transcript);
                    if (result) {
                        setHistory(prev => [{
                            timestamp: new Date().toISOString(),
                            command: transcript,
                            action: result.action
                        }, ...prev]);
                    } else {
                        // Revert back if no command was matched
                        setStatus(recognitionRef.current.isActive && !parserRef.current.context.isPaused ? 'listening' : 'idle');
                    }
                },
                (newStatus) => {
                    if (responseRef.current && responseRef.current.synth.speaking) {
                        return;
                    }
                    setStatus(newStatus);
                }
            );
        }

        return () => {
            // Unmount cleanup if needed (leaving it active unless completely unmounted)
        };
    }, []);

    // A better approach is to not recreate VoiceRecognitionService on every render.
    // Instead, just update parserRef's context dynamically.
    useEffect(() => {
        if (parserRef.current) {
            parserRef.current.context.isPaused = isPaused;
        }
    }, [isPaused]);

    const startListening = () => {
        setIsActive(true);
        setIsPaused(false);
        if (recognitionRef.current) {
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        setIsActive(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    return (
        <VoiceContext.Provider value={{
            status,
            isPaused,
            history,
            isActive,
            startListening,
            stopListening
        }}>
            {children}
        </VoiceContext.Provider>
    );
};
