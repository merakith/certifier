import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertCircle, Loader2, Search } from 'lucide-react';
import { verifyCertificate } from '../services/certificateService';

const VERIFY_STATES = [
  'LISTENING_FOR_SIGNAL',
  'INITIALIZING_PROTOCOL',
  'ESTABLISHING_SECURE_CHANNEL',
  'VERIFYING_NODE_CONSENSUS',
  'SYNCING_CHAIN_DATA',
  'RESOLVING_MERKLE_PATH'
];

export function VerifyCertificate() {
  const [tokenId, setTokenId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatusIndex, setVerifyStatusIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isVerifying) {
      interval = setInterval(() => {
        setVerifyStatusIndex((prev) => (prev + 1) % VERIFY_STATES.length);
      }, 700);
    } else {
      setVerifyStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isVerifying]);

  const handleVerify = async () => {
    if (!tokenId) return;
    setIsVerifying(true);
    setError(false);
    setResult(null);

    try {
      const data = await verifyCertificate(tokenId);
      if (data.verified) {
        setResult(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setTokenId('');
    setResult(null);
    setError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px] flex flex-col shadow-2xl relative"
    >
      {isVerifying && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ 
              width: ["10%", "85%", "10%"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute left-0 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
          />
        </div>
      )}
      <div className="p-8 space-y-8 flex-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white tracking-tight">Verify Credential</h2>
            <p className="text-xs text-zinc-500">Input Token ID for network validation</p>
          </div>
          <Search className="w-5 h-5 text-zinc-700" />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Credential token ID</label>
            <input 
              type="text" 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="e.g. 1024"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
            />
          </div>

          <button 
            onClick={handleVerify}
            disabled={!tokenId || isVerifying}
            className="w-full bg-white text-zinc-950 hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold py-4 text-xs transition-all flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-white/5"
          >
            {isVerifying ? (
              <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 Processing...
              </>
            ) : 'Verify Now'}
          </button>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {!result && !error && !isVerifying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 border border-zinc-800 border-dashed rounded-3xl flex items-center justify-center text-center opacity-50"
              >
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Awaiting input signal...</p>
              </motion.div>
            )}

            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 border border-emerald-500/20 rounded-3xl relative overflow-hidden flex items-center justify-center text-center"
              >
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] relative z-10">Searching Relay Nodes...</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/5 border border-emerald-500/30 rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-widest text-[11px]">Consensus: Matched</h3>
                  </div>

                  <div className="flex gap-6 p-4 bg-zinc-950/40 rounded-2xl border border-emerald-500/10">
                    <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                      {result.metadata?.image && (
                         <img src={result.metadata.image} alt="Verify" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div className="space-y-3 py-1 flex-1 overflow-hidden">
                       <div className="space-y-0.5">
                         <p className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest leading-none">Entity</p>
                         <p className="text-sm text-white font-medium truncate">{result.metadata?.name?.replace('Certificate - ', '')}</p>
                       </div>
                       <div className="space-y-0.5">
                         <p className="text-[9px] uppercase text-zinc-600 font-bold tracking-widest leading-none">Course</p>
                         <p className="text-xs text-emerald-500 font-medium truncate">
                           {result.metadata?.attributes?.find((a: any) => a.trait_type === 'Course')?.value || 'N/A'}
                         </p>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                        <p className="text-[8px] uppercase text-zinc-600 font-bold tracking-widest mb-1">Status</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase">Valid Anchor</p>
                     </div>
                     <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/50">
                        <p className="text-[8px] uppercase text-zinc-600 font-bold tracking-widest mb-1">Token_ID</p>
                        <p className="text-[10px] text-white font-bold uppercase">#{result.tokenId}</p>
                     </div>
                  </div>

                  <button 
                    onClick={reset} 
                    className="w-full text-zinc-700 hover:text-white text-[10px] uppercase font-bold tracking-widest pt-2 transition-colors border-t border-zinc-800/50"
                  >
                    Clear Search
                  </button>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/5 border border-rose-500/30 p-8 rounded-3xl flex flex-col items-center gap-3 text-center"
              >
                <AlertCircle className="text-rose-500 w-8 h-8" />
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Integrity Mismatch</p>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px]">No matching anchor found for Token ID on the current relay network.</p>
                <button onClick={reset} className="mt-4 text-zinc-600 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors">
                  Purge Buffer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
