import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSearch, 
  Upload, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCcw,
  FileText,
  ExternalLink,
  Lock,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { verifyCertificate } from '../services/api';
import { GeometricLoader } from './GeometricLoader';

export function PublicVerify() {
  const [file, setFile] = useState<File | null>(null);
  const [tokenId, setTokenId] = useState('');
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const calculateHash = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleVerify = async () => {
    if (!tokenId) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setErrorDetails(null);
    
    try {
      const data = await verifyCertificate(tokenId);
      if (data.verified) {
        setVerificationResult('success');
        setMetadata(data.metadata || {});
        toast.success('Asset found on ledger', {
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
        setVerificationResult('failed');
        setErrorDetails(data.error || 'Token ID not detected');
      }
    } catch (error: any) {
      console.error('Verification Error:', error);
      setVerificationResult('failed');
      setErrorDetails(error.message || 'Connection error');
    } finally {
      setIsVerifying(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const hash = await calculateHash(selectedFile);
      setFileHash(hash);
      
      // If we already have metadata, check integrity
      if (metadata) {
        const expectedHash = metadata.image;
        if (hash === expectedHash) {
          toast.success('Binary integrity confirmed', { icon: '💎' });
        } else {
          toast.error('Hash mismatch: File may be altered');
        }
      }
    }
  }, [metadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  } as any);

  const reset = () => {
    setFile(null);
    setFileHash(null);
    setVerificationResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white tracking-[0.2em] uppercase">PUBLIC_GATEWAY</h1>
        <div className="h-[2px] w-12 bg-white mx-auto opacity-10" />
        <p className="text-zinc-500 font-mono text-[10px] max-w-sm mx-auto uppercase tracking-widest leading-loose">
          Cryptographic validation of educational assets against global consensus layers.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!verificationResult && !isVerifying && (
          <motion.div
            key="input-zone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-zinc-900 border border-zinc-800 p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-[0.4em]">1. ENTER_TOKEN_ID</h3>
                <div className="flex gap-4 border-b border-zinc-800 focus-within:border-white transition-colors">
                  <Lock className="w-5 h-5 text-zinc-600 self-center" />
                  <input 
                    type="text" 
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="TOKEN_ID_NUMERIC" 
                    className="flex-1 bg-transparent border-none outline-none py-4 text-xl text-white font-mono placeholder:text-zinc-800 uppercase tracking-widest"
                  />
                  <button 
                    onClick={handleVerify}
                    className="px-8 bg-white text-zinc-950 font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    IDENTIFY
                  </button>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-900 flex gap-4">
                <div className="w-1 h-auto bg-zinc-800" />
                <p className="text-[9px] font-mono text-zinc-600 uppercase leading-relaxed font-bold">
                  Identify asset by its unique on-chain ID before performing manual binary integrity checks.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {isVerifying && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 border-dashed p-32 flex flex-col items-center justify-center text-center gap-10"
          >
            <GeometricLoader size="lg" />
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em]">PROBING_GLOBAL_LEDGER</h2>
              <p className="text-zinc-600 font-mono text-[9px] uppercase">QUERY_TOKEN: #{tokenId}</p>
            </div>
          </motion.div>
        )}

        {verificationResult === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-zinc-900 border border-emerald-500/30 p-12 relative">
               <div className="absolute top-4 right-4">
                  <ShieldCheck className="w-24 h-24 text-emerald-500/5 rotate-12" />
               </div>

               <div className="flex flex-col md:flex-row gap-10 items-center">
                  <div className="w-16 h-16 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                     <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="space-y-1 text-center md:text-left">
                     <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-mono">STATUS: DETECTED</h2>
                     <p className="text-emerald-500 font-mono text-[9px] font-bold uppercase tracking-[0.2em]">RECIPIENT: {metadata?.name}</p>
                  </div>
               </div>

               <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800">
                  <div className="bg-zinc-950 p-6 space-y-1">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">ISSUING_ENTITY</p>
                     <p className="text-xs text-white font-mono truncate">{metadata?.issuer}</p>
                  </div>
                  <div className="bg-zinc-950 p-6 space-y-1">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">COURSE_TITLE</p>
                     <p className="text-xs text-white font-mono truncate">{metadata?.course}</p>
                  </div>
               </div>

               <div className="mt-12 space-y-6">
                 <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-[0.4em]">2. BINARY_INTEGRITY_CHECK (OPTIONAL)</h3>
                 {!file ? (
                   <div 
                     {...getRootProps()}
                     className={cn(
                       "bg-zinc-950 border border-dashed border-zinc-800 p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white transition-all",
                       isDragActive && "bg-emerald-500/5 border-emerald-500"
                     )}
                   >
                     <input {...getInputProps()} />
                     <Upload className="w-6 h-6 text-zinc-700" />
                     <p className="text-[9px] font-mono text-zinc-500 uppercase">Drop asset to compare SHA-256 fingerprint</p>
                   </div>
                 ) : (
                   <div className="bg-zinc-950 border border-zinc-800 p-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <FileText className="w-5 h-5 text-emerald-500" />
                       <div className="font-mono">
                         <p className="text-[10px] text-white uppercase">{file.name}</p>
                         <p className="text-[9px] text-zinc-600">{fileHash === metadata?.image ? 'INTEGRITY_VERIFIED' : 'INTEGRITY_FAILED'}</p>
                       </div>
                     </div>
                     <button onClick={() => setFile(null)} className="text-zinc-600 hover:text-white uppercase text-[9px] font-bold">Clear</button>
                   </div>
                 )}
               </div>

               <div className="mt-12 flex gap-4">
                  <button onClick={reset} className="px-8 bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest hover:border-white hover:text-white transition-all">
                    [RESCAN_ACCOUT]
                  </button>
               </div>
            </div>
          </motion.div>
        )}

        {verificationResult === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-rose-500/30 p-20 flex flex-col items-center text-center gap-10"
          >
            <div className="w-16 h-16 border-2 border-rose-500 flex items-center justify-center">
               <ShieldAlert className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-4">
               <h2 className="text-xl font-bold text-white uppercase tracking-widest underline decoration-rose-500/50 underline-offset-8">DETECTION_FAILED</h2>
               <p className="text-zinc-500 text-[10px] font-mono leading-relaxed max-w-xs mx-auto uppercase">
                 {errorDetails || 'TOKEN_ID_NOT_LOCATED_IN_LAYER_1'}
               </p>
            </div>
            <button onClick={reset} className="bg-white text-zinc-950 px-12 py-4 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all">
              RETRY_AUTHENTICATION
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-20 border-t border-zinc-900 flex justify-between items-center text-zinc-700 text-[8px] font-mono tracking-[0.4em] uppercase">
         <div className="flex items-center gap-10">
            <span className="flex items-center gap-2 font-bold"><div className="w-1 h-1 bg-emerald-500" /> ENV: SECURE</span>
            <span className="flex items-center gap-2 font-bold"><div className="w-1 h-1 bg-emerald-500" /> ENGINE_SHA: 2.0.4</span>
         </div>
         <div className="font-bold">EVM_COMPATIBLE_LEDGER: SYNCED</div>
      </footer>
    </div>
  );
}
