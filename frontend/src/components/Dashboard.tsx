import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalVerified: '---',
    blockHeight: '---',
    network: 'FETCHING...'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats({
          totalVerified: data.totalVerified,
          blockHeight: data.blockHeight,
          network: data.network
        });
      } catch (error) {
        console.error("Dashboard stats fetch failed:", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 cyber-grid">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-widest uppercase">CORE_SYSTEM_INTERFACE</h1>
          <div className="h-[1px] w-24 bg-white opacity-20" />
          <div className="flex items-center gap-4 mt-2">
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest leading-none">{stats.network === 'OFFLINE' ? 'STATUS: NODE_IDLE' : 'Active Node: [STANDBY_MODE]'} • Security Level: ALPHA</p>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'TOTAL_VERIFIED', value: stats.totalVerified, trend: 'STABLE', color: 'text-emerald-500' },
            { label: 'BLOCK_HEIGHT', value: stats.blockHeight, trend: 'LIVE', color: 'text-white' },
            { label: 'NETWORK_NODE', value: stats.network, trend: 'ACTIVE', color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm group hover:bg-zinc-800/80 transition-all duration-300">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600 mb-4">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-mono text-white tracking-tighter">{stat.value}</span>
                <span className={stat.color + " text-[10px] font-mono font-bold"}>[{stat.trend}]</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-800 bg-zinc-900/30 p-12 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden group min-h-[400px] rounded-3xl"
          >
            <div className="absolute inset-0 bg-emerald-500 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-700" />
            
            <div className="relative">
              <div className="w-24 h-24 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-white transition-colors duration-500">
                 <div className="w-12 h-12 border border-zinc-800 rounded-lg animate-spin group-hover:border-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-xl font-semibold text-white tracking-tight uppercase">RELAY_BRIDGE_ACTIVE</h2>
              <p className="text-xs font-mono text-zinc-500 max-w-xs mx-auto uppercase">Encryption protocols established. The local node is successfully bridged to the L1 credential relay.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-zinc-800 bg-zinc-900/30 p-12 flex flex-col items-start gap-8 min-h-[400px] rounded-3xl overflow-hidden"
          >
            <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-zinc-500">Node_Manifest</h2>
            <div className="w-full space-y-4">
              {[
                { label: 'Latency', value: '14ms' },
                { label: 'Peers', value: '8 Active' },
                { label: 'Memory', value: '1.2GB / 4.0GB' },
                { label: 'Uptime', value: '142:12:04' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-4 last:border-0 uppercase font-mono text-[10px]">
                  <span className="text-zinc-600">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto w-full bg-zinc-950/50 p-4 border border-zinc-800 rounded-xl">
               <p className="text-[9px] font-mono text-emerald-500 uppercase animate-pulse">Scanning_relay_buffer...</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
