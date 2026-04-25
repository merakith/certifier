import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IssueCertificate } from './IssueCertificate';
import { VerifyCertificate } from './VerifyCertificate';

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
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-white tracking-tight">System Overview</h1>
          <div className="flex items-center gap-4">
            <p className="text-zinc-500 text-xs font-medium">{stats.network === 'OFFLINE' ? 'Status: Idle' : 'Network Synchronized'} • Verification Alpha</p>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Verified', value: stats.totalVerified, trend: 'Stable', color: 'text-emerald-500' },
            { label: 'Current Block', value: stats.blockHeight, trend: 'Live', color: 'text-white' },
            { label: 'Node Status', value: stats.network, trend: 'Active', color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="p-8 rounded-3xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm group hover:bg-zinc-800/80 transition-all duration-300">
              <p className="text-xs font-medium text-zinc-500 mb-4">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-mono text-white tracking-tighter">{stat.value}</span>
                <span className={stat.color + " text-[10px] font-mono font-bold"}>[{stat.trend}]</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <IssueCertificate />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <VerifyCertificate />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-800 bg-zinc-900/30 p-12 flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden group min-h-[400px] rounded-3xl"
          >
            <div className="absolute inset-0 bg-emerald-500 opacity-[0.01] group-hover:opacity-[0.03] transition-opacity duration-700" />
            
            <div className="relative">
              <div className="w-24 h-24 border border-zinc-800 rounded-3xl flex items-center justify-center group-hover:border-white transition-colors duration-500">
                 <div className="w-12 h-12 border border-zinc-800 rounded-xl animate-spin group-hover:border-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-xl font-semibold text-white tracking-tight">Relay Bridge Active</h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">Encryption protocols established. The local node is successfully bridged to the L1 credential relay.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-zinc-800 bg-zinc-900/30 p-12 flex flex-col items-start gap-8 min-h-[400px] rounded-3xl overflow-hidden"
          >
            <h2 className="text-xs font-semibold text-white">Node Manifest</h2>
            <div className="w-full space-y-4">
              {[
                { label: 'Latency', value: '14ms' },
                { label: 'Active Peers', value: '8 Nodes' },
                { label: 'Memory Usage', value: '1.2GB / 4.0GB' },
                { label: 'System Uptime', value: '12:04:42' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-zinc-800/50 pb-4 last:border-0 text-xs">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="text-white font-mono">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto w-full bg-zinc-950/50 p-4 border border-zinc-800 rounded-xl">
               <p className="text-[10px] font-mono text-emerald-500 animate-pulse">Syncing relay buffer...</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
