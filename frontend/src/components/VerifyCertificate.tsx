import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Search, Cpu, FileCheck2, AlertCircle, ExternalLink, QrCode } from 'lucide-react';
import { cn } from '../lib/utils';

export function VerifyCertificate() {
  const [hash, setHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);

  const handleVerify = async () => {
    if (!hash) return;
    setIsVerifying(true);
    setResult(null);
    setError(false);
    
    try {
      const normalizedHash = hash.startsWith('0x') ? hash : '0x' + hash;
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: normalizedHash })
      });
      const data = await response.json();
      
      if (data.valid) {
        setResult(data.data);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Verification search failed:", error);
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setHash('');
    setResult(null);
    setError(false);
  };


  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">HASH_VERIFICATION_ENGINE</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">CRYPTOGRAPHIC AUTHENTICATION LAYER // v2.4.0</p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 vault-border">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex gap-4 border-b border-zinc-800 pb-2 focus-within:border-white transition-colors">
            <Search className="w-5 h-5 text-zinc-600 self-center" />
            <input 
              type="text" 
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="INPUT_HASH_HEX_STRING_0x..." 
              className="bg-transparent border-none outline-none w-full text-sm text-white font-mono placeholder:text-zinc-700 uppercase tracking-widest"
            />
          </div>
          <button 
            onClick={handleVerify}
            disabled={isVerifying || !hash}
            className="bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 px-10 py-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all shrink-0"
          >
            {isVerifying ? 'SCANNING...' : 'EXECUTE_QUERY'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isVerifying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-zinc-900 border border-zinc-800 border-dashed p-20 flex flex-col items-center justify-center gap-6"
          >
            <div className="w-12 h-12 border-2 border-zinc-800 border-t-white animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">VERIFYING_NODE_CONSENSUS</h3>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">RESOLVING_MERKLE_PATH: {hash.slice(0, 24)}...</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-800"
          >
            <div className="md:col-span-2 p-8 bg-zinc-900 border-r border-zinc-800">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-emerald-500" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-[0.2em]">STATUS: HASH_MATCHED</h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-8 font-mono">
                  {[
                    { label: 'IDENTIFIED_ENTITY', value: result.studentName },
                    { label: 'RECIPIENT_WALLET', value: result.recipientWallet },
                    { label: 'ISSUER_SOURCE', value: result.issuer },
                    { label: 'BLOCK_TIMESTAMP', value: new Date(result.timestamp).toLocaleDateString() },
                    { label: 'CHAIN_HEIGHT', value: result.blockNumber },
                    { label: 'ASSET_SIGNATURE', value: hash.slice(0, 16) + '...' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{item.label}</p>
                      <p className="text-white text-[12px] font-bold tracking-tight uppercase">{item.value}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-zinc-950 p-8 flex flex-col items-center justify-center gap-6">
               <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">GEN_PROX_SCAN</p>
               <div className="p-4 bg-white">
                 <QrCode className="w-32 h-32 text-zinc-950" />
               </div>
               <button onClick={reset} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold font-mono py-3 uppercase tracking-widest hover:border-white transition-colors">
                 [RESET_QUERY]
               </button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-rose-500/30 p-20 flex flex-col items-center text-center gap-8 shadow-[0_0_50px_-12px_rgba(244,63,94,0.1)]"
          >
            <div className="w-16 h-16 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
               <AlertCircle className="text-rose-500 w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-rose-500 uppercase tracking-[0.2em]">STATUS: NODE_REJECTION</h2>
              <p className="text-[11px] font-mono text-zinc-500 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
                HASH_MISMATCH_DETECTED: THE CRYPTOGRAPHIC HASH ENTERED HAS NO MATCHING RECORD IN THE ANCHORED REGISTRY.
              </p>
            </div>
            <button onClick={reset} className="bg-white text-zinc-950 px-12 py-3 font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all">
              PURGE_AND_RETRY
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
