import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => useContext(AudioContext);

export const AudioProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);

  // Preload UI sound effects (lightweight generic synth sounds)
  // using generic safe blob structures or reliable UI CDN sources.
  // We use data URIs for instant, zero-network load sounds if possible,
  // but for simplicity, we mock URLs to clean UI generic sounds.
  const sounds = {
    click: 'https://actions.google.com/sounds/v1/ui/mechanical_click.ogg',
    tap: 'https://actions.google.com/sounds/v1/ui/dropdown_click.ogg',
    swoosh: 'https://actions.google.com/sounds/v1/science_fiction/whoosh_short.ogg',
    pulse: 'https://actions.google.com/sounds/v1/science_fiction/sci_fi_beep.ogg'
  };

  // Cache Audio objects
  const audioRefs = {};

  useEffect(() => {
    Object.keys(sounds).forEach(key => {
      const a = new Audio(sounds[key]);
      a.volume = 0.15; // Kept very low for premium abstract feel
      audioRefs[key] = a;
    });
  }, []);

  const playSFX = (type) => {
    if (isMuted) return;
    try {
      if (audioRefs[type]) {
        // Reset time to allow rapid overlapping clicks
        audioRefs[type].currentTime = 0;
        audioRefs[type].play().catch(() => {}); // Catch autoplay bans quietly
      }
    } catch(e) {}
  };

  const toggleMute = () => setIsMuted(prev => !prev);

  return (
    <AudioContext.Provider value={{ isMuted, toggleMute, playSFX }}>
      {children}
    </AudioContext.Provider>
  );
};
