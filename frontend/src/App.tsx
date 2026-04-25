import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Web3Provider } from './components/Web3Provider';
import { Layout } from './components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { VerifyCertificate } from './components/VerifyCertificate';
import { IssueCertificate } from './components/IssueCertificate';
import { PublicVerify } from './components/PublicVerify';
import { getCertificates } from './services/api';

// Dashboard component
const Dashboard = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const data = await getCertificates();
        setCertificates(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown connection error';
        console.error('Failed to fetch certificates:', error);
        toast.error(message, {
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid #27272a', // zinc-800
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: '0px',
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
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
          { label: 'TOTAL_VERIFIED', value: Array.isArray(certificates) ? certificates.length.toLocaleString() : '0', trend: 'LIVE', color: 'text-emerald-500' },
          { label: 'RECENT_SYNC', value: Array.isArray(certificates) && certificates.length > 0 ? 'SUCCESS' : 'IDLE', trend: 'ACTIVE', color: 'text-white' },
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

      <div className="space-y-4">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 px-2">RECENT_ISSUANCE_LEDGER</h3>
        
        <div className="border border-zinc-800 bg-zinc-900 overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border border-zinc-800 border-t-white animate-spin" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">QUERYING_API_RESOURCES...</p>
            </div>
          ) : !Array.isArray(certificates) || certificates.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center">
                 <div className="w-6 h-[1px] bg-zinc-800" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-white uppercase tracking-widest">NO_CERTIFICATES_DETECTED</p>
                <p className="text-[10px] font-mono text-zinc-600 uppercase">The distributed ledger currently contains zero issuance records.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950">
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">RECIPIENT_ADDRESS</th>
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">ASSET_HASH</th>
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">TIMESTAMP</th>
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {certificates.map((cert, i) => (
                    <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-mono text-[12px] text-white tracking-widest">
                        {cert.recipientAddress?.slice(0, 8)}...{cert.recipientAddress?.slice(-6)}
                      </td>
                      <td className="p-4 font-mono text-[12px] text-zinc-400">
                        {cert.fileHash?.slice(0, 16)}...
                      </td>
                      <td className="p-4 font-mono text-[10px] text-zinc-500 uppercase">
                        {new Date(cert.timestamp || Date.now()).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-[9px] font-mono font-bold text-emerald-500 border border-emerald-500/30 px-2 py-0.5 uppercase">
                          CONFIRMED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  return (
    <Web3Provider>
      <Layout>
        <Toaster position="top-right" />
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

