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
        <h1 className="text-3xl font-semibold text-white tracking-tight">Revoke Credential</h1>
        <p className="text-xs text-zinc-500">Invalidate anchored certificates from the blockchain consensus.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-8 rounded-3xl shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">Critical Operation</h3>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Revoking a certificate is an irreversible action. Once revoked, the cryptographic hash will be marked as invalid across all network nodes.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Token ID or Hash</label>
            <div className="relative">
              <input 
                type="text" 
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter ID for revocation"
                className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-rose-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
              />
            </div>
          </div>

          <button 
            onClick={handleRevoke}
            disabled={!tokenId || isRevoking}
            className="w-full bg-rose-600 text-white hover:bg-rose-700 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold py-4 text-xs transition-all flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-rose-950/20"
          >
            {isRevoking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing Revocation...
              </>
            ) : (
              'Revoke Now'
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-emerald-500/50 p-8 flex flex-col items-center gap-4 text-center rounded-3xl"
          >
            <Trash2 className="text-rose-500 w-10 h-10" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-emerald-500">Revocation Successful</h2>
              <p className="text-xs text-zinc-500">The certificate has been purged from the active node.</p>
            </div>
            <div className="bg-zinc-950 p-4 w-full text-[10px] font-mono text-zinc-600 break-all border border-zinc-800 rounded-2xl">
              TX_RECEIPT: {result.hash}
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-rose-500/50 p-8 flex flex-col items-center gap-4 text-center rounded-3xl"
          >
            <ShieldAlert className="text-rose-500 w-10 h-10" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-rose-500">Operation Aborted</h2>
              <p className="text-xs text-zinc-500 italic whitespace-pre-wrap">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
