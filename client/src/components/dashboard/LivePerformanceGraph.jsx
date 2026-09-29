import React, { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-2 border-cyber-neon/50 text-xs font-mono">
        {payload.map((entry, index) => (
          <div key={index} style={{ color: entry.color }} className="flex gap-2 justify-between">
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function LivePerformanceGraph() {
  const [data, setData] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      time: i,
      CPU: Math.floor(Math.random() * 60) + 20,
      RAM: Math.floor(Math.random() * 50) + 30,
      NET: Math.floor(Math.random() * 40) + 10,
    }))
  );

  useEffect(() => {
    const int = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: prev[prev.length - 1].time + 1,
          CPU: Math.floor(Math.random() * 60) + 20,
          RAM: Math.floor(Math.random() * 50) + 30,
          NET: Math.floor(Math.random() * 40) + 10,
        });
        return newData;
      });
    }, 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="h-full w-full glass-panel flex flex-col p-3 relative neon-border border-cyber-purple/30">
      <div className="text-xs text-cyber-purple uppercase tracking-widest font-mono flex items-center justify-between mb-2">
         <span>Live Performance</span>
         <span className="flex gap-3 text-[9px]">
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00FF9C] shadow-[0_0_5px_#00FF9C]"></span> CPU</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_5px_#00E5FF]"></span> RAM</span>
           <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B026FF] shadow-[0_0_5px_#B026FF]"></span> NET</span>
         </span>
      </div>
      <div className="w-full h-[200px] min-h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            <Line type="monotone" dataKey="CPU" stroke="#00FF9C" strokeWidth={2} dot={{ r: 2, fill: "#00FF9C" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="RAM" stroke="#00E5FF" strokeWidth={2} dot={{ r: 2, fill: "#00E5FF" }} isAnimationActive={false} />
            <Line type="monotone" dataKey="NET" stroke="#B026FF" strokeWidth={2} dot={{ r: 2, fill: "#B026FF" }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
