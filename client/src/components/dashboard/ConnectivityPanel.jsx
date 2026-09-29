import React, { useState, useEffect } from 'react';
import { Wifi, Bluetooth, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudio } from '../../context/AudioContext';

const API = 'http://localhost:5000';

export default function ConnectivityPanel() {
  const { playSFX } = useAudio();
  const [wifi, setWifi] = useState({ connected: false, ssid: '', signalLevel: 0 });
  const [bt, setBt] = useState({ connected: false, devices: [] });
  const [wifiLoading, setWifiLoading] = useState(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/system`);
        const d = await res.json();
        setWifi(d.wifi || { connected: false, ssid: '', signalLevel: 0 });
        setBt(d.bluetooth || { connected: false, devices: [] });
      } catch {}
    };
    poll();
    const int = setInterval(poll, 3000);
    return () => clearInterval(int);
  }, []);

  const toggleWifi = async () => {
    playSFX('click');
    setWifiLoading(true);
    try {
      await fetch(`${API}/api/wifi/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: !wifi.connected }),
      });
      // Wait for system to update then re-fetch
      setTimeout(async () => {
        try {
          const res = await fetch(`${API}/api/system`);
          const d = await res.json();
          setWifi(d.wifi || { connected: false, ssid: '', signalLevel: 0 });
        } catch {}
        setWifiLoading(false);
      }, 3000);
    } catch {
      setWifiLoading(false);
    }
  };

  return (
    <div className="h-full glass-panel border border-white/5 p-3 flex flex-col gap-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono font-bold mb-1 flex items-center justify-between">
        <span>Link Systems</span>
        <span className="text-[8px] text-cyber-neon/50">LIVE</span>
      </div>

      {/* WiFi — toggleable */}
      <div className="flex flex-col gap-1 p-2 bg-black/40 border border-white/5 rounded-xl">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 transition-colors" style={wifi.connected ? { color: '#00E5FF' } : { color: '#444' }} />
            WLAN
          </span>
          {wifiLoading ? (
            <Loader2 className="w-4 h-4 text-cyber-cyan animate-spin" />
          ) : (
            <div
              onClick={toggleWifi}
              className="w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors duration-300 flex"
              style={{
                backgroundColor: wifi.connected ? '#00E5FF' : '#222',
                justifyContent: wifi.connected ? 'flex-end' : 'flex-start',
              }}
            >
              <motion.div
                layout
                className="w-3 h-3 bg-white rounded-full shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          )}
        </div>
        {wifi.connected ? (
          <div className="text-[8px] text-gray-500 font-mono pl-6 mt-1 flex flex-col gap-0.5">
            <span className="text-white drop-shadow-md truncate">{wifi.ssid}</span>
            <span className="text-gray-600">Signal: {wifi.signalLevel}dBm</span>
          </div>
        ) : (
          <div className="text-[8px] text-gray-600 font-mono pl-6 mt-1">Disconnected</div>
        )}
      </div>

      {/* Bluetooth — read-only status */}
      <div className="flex flex-col gap-1 p-2 bg-black/40 border border-white/5 rounded-xl min-h-[85px]">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
            <Bluetooth className="w-3.5 h-3.5 transition-colors" style={bt.connected ? { color: '#1E90FF' } : { color: '#444' }} />
            BT_LINK
          </span>
          <div
            className="w-8 h-4 rounded-full p-0.5 flex"
            style={{
              backgroundColor: bt.connected ? '#1E90FF' : '#222',
              justifyContent: bt.connected ? 'flex-end' : 'flex-start',
            }}
          >
            <motion.div
              layout
              className="w-3 h-3 bg-white rounded-full shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
        {bt.connected && bt.devices && bt.devices.length > 0 ? (
          <div className="text-[8px] text-gray-500 font-mono pl-6 mt-1 flex flex-col gap-0.5">
            <span className="text-white/80 truncate">{bt.devices[0]}</span>
          </div>
        ) : (
          <div className="text-[8px] text-gray-600 font-mono pl-6 mt-1">No device connected</div>
        )}
      </div>
    </div>
  );
}
