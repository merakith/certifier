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

export function PublicVerify() {
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const calculateHash = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setVerificationResult(null);
      setIsVerifying(true);
      
      const hash = await calculateHash(selectedFile);
      setFileHash(hash);

      try {
        const data = await verifyCertificate(hash);
        if (data.success && data.isValid) {
          setVerificationResult('success');
          setMetadata(data.metadata);
          toast.success('Integrity verified', {
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
        }
      } catch (error) {
        console.error('Verification Error:', error);
        setVerificationResult('failed');
        const message = error instanceof Error ? error.message : 'Connection error';
        toast.error(message, {
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
    }
  }, []);

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
        {!file && !isVerifying && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
          >
            <div 
              {...getRootProps()}
              className={cn(
                "bg-zinc-900/40 backdrop-blur-md scanning-frame p-20 cursor-pointer transition-all duration-700 min-h-[400px]",
                isDragActive ? "border-indigo-500 bg-indigo-500/5 glow-indigo-sharp shadow-[0_0_50px_-12px_rgba(99,102,241,0.2)]" : "border-zinc-800 hover:border-zinc-500"
              )}
            >
              <input {...getInputProps()} />
              {isDragActive && <div className="scanning-line" />}
              <div className="relative z-10 flex flex-col items-center">
                 <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center mb-10 group-hover:border-white transition-colors">
                    <div className="w-8 h-[1px] bg-zinc-800 group-hover:bg-white" />
                 </div>
                 <h3 className="text-[11px] font-mono font-bold text-white uppercase tracking-[0.4em] mb-4">LOAD_SOURCE_DOCUMENT</h3>
                 <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest max-w-[200px] leading-relaxed">
                   Device-side entropy generation. Zero sensitive data transmission.
                 </p>
                 <div className="mt-12 overflow-hidden h-[1px] w-0 group-hover:w-32 bg-white transition-all duration-700 opacity-20" />
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
            <div className="w-16 h-16 border border-zinc-800 border-t-white animate-spin" />
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-[0.3em]">PROBING_GLOBAL_LEDGER</h2>
              <p className="text-zinc-600 font-mono text-[9px] uppercase">SHA-256_FINGERPRINT: {fileHash?.slice(0, 24)}...</p>
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
                     <h2 className="text-2xl font-bold text-white uppercase tracking-widest font-mono">STATUS: VALIDATED</h2>
                     <p className="text-emerald-500 font-mono text-[9px] font-bold uppercase tracking-[0.2em]">RECIPIENT: {metadata?.recipient}</p>
                  </div>
               </div>

               <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800">
                  <div className="bg-zinc-950 p-6 space-y-1">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">ISSUER</p>
                     <p className="text-xs text-white font-mono truncate">{metadata?.issuer}</p>
                  </div>
                  <div className="bg-zinc-950 p-6 space-y-1">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">ASSET_HASH</p>
                     <p className="text-xs text-emerald-500 font-mono truncate">{fileHash}</p>
                  </div>
                  <div className="bg-zinc-950 p-6 space-y-1">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">CHAIN_HEIGHT</p>
                     <p className="text-xs text-white font-mono truncate">{metadata?.block}</p>
                  </div>
                  <div className="bg-zinc-950 p-6 space-y-1">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">TIMESTAMP</p>
                     <p className="text-xs text-white font-mono truncate">{metadata?.date}</p>
                  </div>
               </div>

               <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-white text-zinc-950 font-bold py-4 text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all">
                    BLOCK_EXPLORER
                  </button>
                  <button onClick={reset} className="px-8 bg-zinc-950 border border-zinc-800 text-zinc-400 font-bold py-4 text-[10px] uppercase tracking-widest hover:border-white hover:text-white transition-all">
                    [RESET_GATEWAY]
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
               <h2 className="text-xl font-bold text-white uppercase tracking-widest underline decoration-rose-500/50 underline-offset-8">INTEGRITY_COMPROMISED</h2>
               <p className="text-zinc-500 text-[10px] font-mono leading-relaxed max-w-xs mx-auto uppercase">
                 The provided document does not exist within the primary or secondary validation nodes. Origin: Unknown.
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
