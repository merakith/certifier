import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Search, Cpu, FileCheck2, AlertCircle, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { verifyCertificate } from '../services/api';
import { GeometricLoader } from './GeometricLoader';

export function VerifyCertificate() {
  const [tokenId, setTokenId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!tokenId) return;
    setIsVerifying(true);
    setResult(null);
    
    try {
      const data = await verifyCertificate(tokenId);
      if (data.verified) {
        setResult(data.metadata || { name: 'NOT_FOUND', course: 'N/A' });
        toast.success('Asset identity confirmed', {
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: '0px',
          },
        });
      } else {
        toast.error(data.error || 'Token not verified on-chain', {
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: '0px',
          },
        });
      }
    } catch (error: any) {
      console.error('Verification Error:', error);
      toast.error(error.message || 'Connection failed', {
        style: {
          background: '#18181b',
          color: '#fff',
          border: '1px solid #27272a',
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          borderRadius: '0px',
        },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">ID_VERIFICATION_ENGINE</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PROTOCOL_V3 // ON-CHAIN VALIDATION LAYER</p>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 vault-border">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex gap-4 border-b border-zinc-800 pb-2 focus-within:border-white transition-colors">
            <Search className="w-5 h-5 text-zinc-600 self-center" />
            <input 
              type="text" 
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="INPUT_TOKEN_ID_NUMERIC (e.g. 1024)" 
              className="bg-transparent border-none outline-none w-full text-sm text-white font-mono placeholder:text-zinc-700 uppercase tracking-widest"
            />
          </div>
          <button 
            onClick={handleVerify}
            disabled={isVerifying || !tokenId}
            className="bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 px-10 py-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all shrink-0"
          >
            {isVerifying ? 'SYNCING...' : 'EXECUTE_QUERY'}
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
            <GeometricLoader size="md" />
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em]">NODE_CONSENSUS_SYNCING</h3>
              <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Querying Layer-1 Mainnet Validators...</p>
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
                  <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">ASSET_IDENTITY_CONFIRMED</h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-8 font-mono">
                  {[
                    { label: 'LEGAL_RECIPIENT', value: result.name || 'N/A' },
                    { label: 'CLASSIFICATION', value: result.course || 'N/A' },
                    { label: 'ISSUER_ID', value: result.issuer || 'N/A' },
                    { label: 'ASSET_HASH', value: result.image?.slice(0, 16) + '...' },
                    { label: 'TOKEN_ID', value: `#${tokenId}` },
                    { label: 'STATUS', value: 'VERIFIED_ON_CHAIN' },
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{item.label}</p>
                      <p className="text-white text-[12px] font-bold tracking-tight uppercase">{item.value}</p>
                    </div>
                  ))}
               </div>
               <div className="mt-12 flex gap-4">
                  <button 
                    onClick={() => { setTokenId(''); setResult(null); }} 
                    className="flex-1 px-8 bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest hover:border-white hover:text-white transition-all"
                  >
                    [RESCAN_ACCOUNT]
                  </button>
                  <button 
                    onClick={async () => {
                      if (!tokenId) return;
                      const loadingToast = toast.loading('Initiating Burn Sequence...', {
                        style: { background: '#18181b', color: '#fff', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', borderRadius: '0px' }
                      });
                      try {
                        const { revokeCertificate } = await import('../services/api');
                        const data = await revokeCertificate(tokenId);
                        if (data.burned) {
                          toast.success('Asset permanently revoked', { id: loadingToast });
                          setResult(null);
                          setTokenId('');
                        } else {
                          toast.error(data.error || 'Revocation rejected', { id: loadingToast });
                        }
                      } catch (err: any) {
                        toast.error(err.message || 'Transmission failed', { id: loadingToast });
                      }
                    }}
                    className="flex-1 px-8 bg-rose-950/20 border border-rose-500/30 text-rose-500 font-bold py-4 text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                  >
                    [BURN_ASSET]
                  </button>
               </div>
            </div>

            <div className="bg-zinc-950 p-8 flex flex-col items-center justify-center gap-6">
               <p className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest">GEN_PROX_SCAN</p>
               <div className="p-4 bg-white">
                 <QrCode className="w-32 h-32 text-zinc-950" />
               </div>
               <button className="w-full bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold font-mono py-3 uppercase tracking-widest hover:border-white transition-colors">
                 GENERATE_PUBLIC_URL_v1.2
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
