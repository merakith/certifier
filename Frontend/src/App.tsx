import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from './components/Web3Provider';
import { Layout } from './components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { VerifyCertificate } from './components/VerifyCertificate';
import { IssueCertificate } from './components/IssueCertificate';
import { PublicVerify } from './components/PublicVerify';

// Placeholder Pages
const Dashboard = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="space-y-12"
  >
    <div className="flex flex-col gap-2 items-center text-center">
      <h1 className="text-4xl font-bold tracking-tight text-white uppercase tracking-[0.2em]">CORE_SYSTEM_INTERFACE</h1>
      <div className="h-[1px] w-24 bg-white opacity-20" />
      <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2">Active Node: [8421-PRX] • Security Level: ALPHA</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-800">
      {[
        { label: 'TOTAL_VERIFIED', value: '12,842', trend: 'STABLE', color: 'text-emerald-500' },
        { label: 'BLOCK_HEIGHT', value: '18,242,901', trend: '+12.4s', color: 'text-white' },
        { label: 'NETWORK_NODES', value: '1,024', trend: 'ACTIVE', color: 'text-emerald-500' },
      ].map((stat, i) => (
        <div key={i} className="p-8 border-r last:border-r-0 border-zinc-800 bg-zinc-900 group hover:bg-zinc-800 transition-colors">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600 mb-4">{stat.label}</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-mono text-white tracking-tighter">{stat.value}</span>
            <span className={stat.color + " text-[10px] font-mono font-bold"}>[{stat.trend}]</span>
          </div>
        </div>
      ))}
    </div>

    <div className="border border-zinc-800 bg-zinc-900 p-20 flex flex-col items-center justify-center text-center gap-8 group">
      <div className="relative">
        <div className="w-20 h-20 border border-zinc-800 flex items-center justify-center group-hover:border-white transition-colors duration-500">
           <div className="w-10 h-10 border border-zinc-800 animate-spin group-hover:border-emerald-500" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white uppercase tracking-widest">AWAITING_INPUT</h2>
        <p className="text-[11px] font-mono text-zinc-500 max-w-xs mx-auto uppercase">Stream cryptographic data or manually input certificate hashes for node consensus.</p>
      </div>

      <button className="bg-white text-zinc-950 hover:bg-zinc-200 px-10 py-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all">
        EXECUTE_VERIFICATION_v1.0
      </button>
    </div>
  </motion.div>
);

export default function App() {
  return (
    <Web3Provider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/public-verify" element={<PublicVerify />} />
            <Route path="/issue" element={<IssueCertificate />} />
            {/* Additional routes would go here */}
          </Routes>
        </AnimatePresence>
      </Layout>
    </Web3Provider>
  );
}

