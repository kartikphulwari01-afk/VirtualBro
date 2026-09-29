import React, { useEffect, useState, useRef } from 'react';
import { Cpu, MemoryStick, MonitorPlay, Thermometer } from 'lucide-react';

const DiagCard = ({ title, value, displayValue, unit, icon: Icon, colorClass, borderClass, barPercent }) => (
  <div className={`glass-panel p-3 flex flex-col justify-between ${borderClass} relative overflow-hidden group`}>
     <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Icon className="w-16 h-16" />
     </div>
     <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">{title}</div>
     <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black text-white ${colorClass} transition-all duration-500 tabular-nums`}>{displayValue ?? value}</span>
        <span className={`text-xs ${colorClass} opacity-70`}>{unit}</span>
     </div>
     <div className="w-full h-1 bg-black/50 mt-2 rounded-full overflow-hidden">
        <div 
           className="h-full bg-current rounded-full transition-all duration-700 ease-out" 
           style={{ width: `${Math.min(barPercent ?? (typeof value === 'number' ? value : parseInt(value) || 0), 100)}%` }}
        />
     </div>
  </div>
);

// Smooth interpolation helper
function useSmoothValue(target, speed = 0.15) {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);
  const targetRef = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => { targetRef.current = target; }, [target]);

  useEffect(() => {
    const animate = () => {
      const diff = targetRef.current - currentRef.current;
      currentRef.current += diff * speed;
      const rounded = Math.round(currentRef.current);
      setDisplay(prev => prev !== rounded ? rounded : prev);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  return display;
}

export default function SystemDiagnostics() {
  const [raw, setRaw] = useState({ cpu: 0, memory: 0, gpu: 0, temperature: null });

  useEffect(() => {
    const fetchSys = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/system');
        const json = await res.json();
        setRaw({ cpu: json.cpu, memory: json.memory, gpu: json.gpu, temperature: json.temperature });
      } catch(e) {}
    };
    fetchSys();
    const int = setInterval(fetchSys, 1000);
    return () => clearInterval(int);
  }, []);

  const cpu = useSmoothValue(raw.cpu);
  const memory = useSmoothValue(raw.memory);
  const gpu = useSmoothValue(raw.gpu);
  const temp = raw.temperature !== null ? useSmoothValue(raw.temperature) : null;

  // Temperature color logic
  const getTempColor = (t) => {
    if (t === null) return { text: 'text-gray-500', shadow: '', border: 'border-gray-600/30 hover:border-gray-500/50' };
    if (t < 50) return { text: 'text-cyber-neon drop-shadow-[0_0_5px_#00FF9C]', shadow: '#00FF9C', border: 'border-cyber-neon/30 hover:border-cyber-neon/50' };
    if (t < 75) return { text: 'text-yellow-400 drop-shadow-[0_0_5px_#FACC15]', shadow: '#FACC15', border: 'border-yellow-500/30 hover:border-yellow-500/50' };
    return { text: 'text-red-400 drop-shadow-[0_0_5px_#F87171]', shadow: '#F87171', border: 'border-red-500/30 hover:border-red-500/50' };
  };
  const tc = getTempColor(temp);

  return (
    <div className="h-full flex flex-col gap-3 relative">
       <div className="text-xs text-cyber-neon uppercase tracking-widest font-mono flex items-center gap-2">
         <div className="w-1.5 h-1.5 bg-cyber-neon rounded-full animate-ping" />
         System Diagnostics
       </div>
       <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1">
          <DiagCard title="CPU" value={cpu} unit="%" icon={Cpu} colorClass="text-cyber-neon drop-shadow-[0_0_5px_#00FF9C]" borderClass="border-cyber-neon/30 hover:border-cyber-neon/50" />
          <DiagCard title="Memory" value={memory} unit="%" icon={MemoryStick} colorClass="text-cyber-cyan drop-shadow-[0_0_5px_#00E5FF]" borderClass="border-cyber-cyan/30 hover:border-cyber-cyan/50" />
          <DiagCard title="GPU" value={gpu} unit="%" icon={MonitorPlay} colorClass="text-cyber-blue drop-shadow-[0_0_5px_#1E90FF]" borderClass="border-cyber-blue/30 hover:border-cyber-blue/50" />
          <DiagCard 
            title="Temp" 
            value={temp ?? 0}
            displayValue={temp === null ? 'N/A' : temp}
            unit={temp === null ? '' : '°C'} 
            icon={Thermometer} 
            colorClass={tc.text}
            borderClass={tc.border}
            barPercent={temp === null ? 0 : Math.min(temp, 100)}
          />
       </div>
    </div>
  );
}
