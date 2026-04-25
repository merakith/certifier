import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertCircle, Loader2, Search } from 'lucide-react';

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
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });

      const data = await response.json();
      if (data.valid) {
        setResult(data.data);
      } else {
        setError(true);
      }
    } catch (err) {
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px] flex flex-col shadow-2xl"
    >
      <div className="p-8 space-y-8 flex-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white tracking-tight">VERIFICATION_NODE</h2>
            <p className="text-[10px] font-mono text-zinc-600 uppercase">Input Token ID for network validation</p>
          </div>
          <Search className="w-5 h-5 text-zinc-700" />
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">TOKEN_IDENTIFIER</label>
            <input 
              type="text" 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-xl placeholder:text-zinc-800"
            />
          </div>

          <button 
            onClick={handleVerify}
            disabled={!tokenId || isVerifying}
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-700 font-bold py-4 text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 rounded-xl"
          >
            {isVerifying ? (
              <>
                 <Loader2 className="w-4 h-4 animate-spin" />
                 {VERIFY_STATES[verifyStatusIndex]}...
              </>
            ) : 'START_VERIFICATION'}
          </button>
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {!result && !error && !isVerifying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="scanning-frame border-dashed opacity-50"
              >
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">AWAITING_INPUT_SIGNAL...</p>
              </motion.div>
            )}

            {isVerifying && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="scanning-frame border-emerald-500/20"
              >
                <div className="scanning-line" />
                <p className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] relative z-10">Searching_Relay_Nodes...</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/5 border border-emerald-500/50 p-6 space-y-4"
              >
                <div className="flex items-center gap-3 text-emerald-500">
                  <ShieldCheck className="w-4 h-4" />
                  <h3 className="font-bold uppercase tracking-widest text-[10px]">Node_Consensus: MATCHED</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 text-[10px] font-mono">
                  <div className="space-y-1">
                    <p className="text-zinc-600 uppercase">Validated_Entity</p>
                    <p className="text-white uppercase font-bold text-xs">{result.studentName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-zinc-600 uppercase">Relay_Status</p>
                    <p className="text-emerald-500 font-bold uppercase">VALID_ON_CHAIN_ANCHOR</p>
                  </div>
                </div>
                <button onClick={reset} className="w-full text-zinc-600 hover:text-white text-[9px] uppercase font-bold tracking-widest pt-2 transition-colors">
                  [RESET_SCAN]
                </button>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/5 border border-rose-500/50 p-6 flex flex-col items-center gap-3 text-center"
              >
                <AlertCircle className="text-rose-500 w-6 h-6" />
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">INTEGRITY_MISMATCH</p>
                <p className="text-[10px] font-mono text-rose-400 opacity-70 uppercase leading-relaxed">No matching anchor found for TokenID on the current relay network.</p>
                <button onClick={reset} className="text-zinc-700 hover:text-white text-[9px] uppercase font-bold tracking-widest pt-2 transition-colors">
                  [PURGE_BUFFER]
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
