import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

export function RevokeCertificate() {
  const [tokenId, setTokenId] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!tokenId) return;
    setIsRevoking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'REVOCATION_FAILED');
      }
    } catch (err) {
      setError('NETWORK_FAILURE');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">CERTIFICATE_REVOCATION</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Invalidating anchored credentials from global consensus...</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest">CRITICAL_OPERATION</h3>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 leading-relaxed uppercase">
            Revoking a certificate is an IRREVERSIBLE action. Once revoked, the cryptographic hash will be marked as INVALID across all network nodes.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">IDENTIFIER (TOKEN_ID / HASH)</label>
            <div className="relative">
              <input 
                type="text" 
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="INPUT_ID_FOR_DESTRUCTION"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-rose-500 transition-all uppercase placeholder:text-zinc-800"
              />
            </div>
          </div>

          <button 
            onClick={handleRevoke}
            disabled={!tokenId || isRevoking}
            className="w-full bg-rose-600 text-white hover:bg-rose-700 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold py-4 text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
          >
            {isRevoking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                DESTROYING_ANCHOR...
              </>
            ) : (
              'EXECUTE_REVOCATION'
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-emerald-500/50 p-6 flex flex-col items-center gap-4 text-center"
          >
            <Trash2 className="text-rose-500 w-8 h-8" />
            <div className="space-y-1">
              <h2 className="text-emerald-500 font-bold uppercase tracking-widest">NODE_CONSENSUS_REACHED</h2>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">ANCHOR_PURGED_SUCCESSFULLY</p>
            </div>
            <div className="bg-zinc-950 p-4 w-full text-[9px] font-mono text-zinc-600 break-all border border-zinc-800 uppercase">
              TX_RECEIPT: {result.hash}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-rose-500/50 p-6 flex flex-col items-center gap-4 text-center"
          >
            <ShieldAlert className="text-rose-500 w-8 h-8" />
            <div className="space-y-1">
              <h2 className="text-rose-500 font-bold uppercase tracking-widest">OPERATION_ABORTED</h2>
              <p className="text-[10px] font-mono text-zinc-600 uppercase italic whitespace-pre-wrap">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
