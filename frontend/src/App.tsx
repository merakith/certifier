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
import { GeometricLoader } from './components/GeometricLoader';

// History component
const History = () => {
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mint_history');
    if (stored) {
      try {
        setCertificates(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-6 items-center text-center">
        <GeometricLoader />
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-4xl font-bold tracking-tight text-white uppercase tracking-[0.2em]">CERTIFICATE_LEDGER</h1>
          <div className="h-[1px] w-24 bg-white opacity-20" />
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2">PREVIOUS_ISSUANCE_HISTORY</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="border border-zinc-800 bg-zinc-900 overflow-hidden">
          {certificates.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center gap-6">
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center group-hover:border-white transition-colors duration-500">
                 <div className="w-6 h-[1px] bg-zinc-800 group-hover:bg-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-white uppercase tracking-widest">NO_ISSUES_RECORDED</p>
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Initiate an ISSUANCE sequence to populate this view.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950">
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">RECIPIENT_NAME</th>
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">COURSE_TITLE</th>
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">TX_HASH</th>
                    <th className="p-4 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">TOKEN_ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {certificates.map((cert: any, i) => (
                    <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-white tracking-widest">
                        {cert.data?.name || cert.name}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-white">
                        {cert.data?.course || cert.course}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-zinc-500">
                        {cert.transactionHash?.slice(0, 12)}...
                      </td>
                      <td className="p-4">
                        <span className="text-[9px] font-mono font-bold text-emerald-500 border border-emerald-500/30 px-2 py-0.5 uppercase tracking-tighter">
                          {cert.tokenId || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
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
            <Route path="/" element={<History />} />
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

