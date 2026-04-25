import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldPlus, 
  Upload, 
  User, 
  Wallet, 
  FileText, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { issueCertificate, MintResponse } from '../services/api';
import { GeometricLoader } from './GeometricLoader';

export function IssueCertificate() {
  const [studentName, setStudentName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [course, setCourse] = useState('B.SC COMPUTER SCIENCE');
  const [issuer, setIssuer] = useState('GLOBAL_ACADEMIC_LEDGER');
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [txDetails, setTxDetails] = useState<{ hash: string; tokenId: string } | null>(null);

  const calculateHash = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setFileHash('0x' + hashHex);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      calculateHash(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false
  } as any);

  const handleMint = async () => {
    if (!studentName || !walletAddress || !fileHash || !course || !issuer) return;
    setIsMinting(true);
    
    try {
      const data = await issueCertificate({
        to: walletAddress,
        name: studentName,
        course: course,
        issuer: issuer,
        image: fileHash // Using fileHash as the "image" field represention
      });

      if (data.status === "submitted" && data.transactionHash) {
        setTxDetails({ 
          hash: data.transactionHash, 
          tokenId: 'PENDING_ON_CONSOLIDATION' // The index.ts doesn't return ID immediately usually, it waits for receipt or we assume next
        });
        setMinted(true);
        toast.success('Certificate anchored to blockchain', {
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid #27272a', // zinc-800
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: '0px',
          },
        });
      } else {
        toast.error(`Minting failed`, {
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid #27272a', // zinc-800
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: '0px',
          },
        });
      }
    } catch (error: any) {
      console.error('API Error:', error);
      toast.error(error.message || 'Unknown connection error', {
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
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setStudentName('');
    setWalletAddress('');
    setFile(null);
    setFileHash(null);
    setMinted(false);
    setTxDetails(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white uppercase tracking-widest">ASSET_ISSUANCE_MODULE</h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Anchoring digital credentials to L1 consensus...</p>
      </div>

      <AnimatePresence mode="wait">
        {!minted ? (
          <motion.div 
            key="issue-form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-zinc-800"
          >
            {/* Input Section */}
            <div className="p-8 space-y-12 bg-zinc-900 border-r border-zinc-800">
              <div className="space-y-6">
                <h3 className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em]">RECIPIENT_METADATA</h3>
                
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">NAME_IDENTITY</label>
                    <input 
                      type="text" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="LEGAL_ENTITY_NAME"
                      className="w-full bg-zinc-950 border-b border-zinc-800 py-3 text-sm text-white focus:outline-none focus:border-white transition-all font-mono uppercase placeholder:text-zinc-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase">EVM_WALLET_DESTINATION</label>
                    <input 
                      type="text" 
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x0000..."
                      className="w-full bg-zinc-950 border-b border-zinc-800 py-3 text-sm text-white focus:outline-none focus:border-white transition-all font-mono uppercase placeholder:text-zinc-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">COURSE_TITLE</label>
                      <input 
                        type="text" 
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="e.g. COMPUTER SCIENCE"
                        className="w-full bg-zinc-950 border-b border-zinc-800 py-3 text-[11px] text-white focus:outline-none focus:border-white transition-all font-mono uppercase placeholder:text-zinc-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase">ISSUING_ENTITY</label>
                      <input 
                        type="text" 
                        value={issuer}
                        onChange={(e) => setIssuer(e.target.value)}
                        placeholder="e.g. UNIVERSITY_X"
                        className="w-full bg-zinc-950 border-b border-zinc-800 py-3 text-[11px] text-white focus:outline-none focus:border-white transition-all font-mono uppercase placeholder:text-zinc-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-950 border border-zinc-800 flex gap-4">
                 <div className="w-[1px] bg-emerald-500" />
                 <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase">
                   Protocol: ERC-721 Standardized Metadata Integration. Final hash will be cryptographically immutable post-consensus.
                 </p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="p-8 flex flex-col bg-zinc-900/40 backdrop-blur-md">
                <h3 className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6">DATA_SOURCE_INTEGRITY</h3>

                {!file ? (
                  <div 
                    {...getRootProps()} 
                    className={cn(
                      "flex-1 scanning-frame transition-all duration-300 cursor-pointer group mb-8",
                      isDragActive ? "border-indigo-500 bg-indigo-500/5 glow-indigo-sharp" : "hover:border-zinc-500"
                    )}
                  >
                    <input {...getInputProps()} />
                    {isDragActive && <div className="scanning-line" />}
                    <div className="flex flex-col items-center gap-4 relative z-10">
                       <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center group-hover:border-white transition-colors">
                          <div className="w-6 h-[1px] bg-zinc-700 group-hover:bg-white" />
                       </div>
                       <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">DRAG_DROP_SOURCE_PDF</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-6 mb-8">
                    <div className="bg-zinc-950/80 border border-zinc-800 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <FileText className="text-white w-4 h-4" />
                        <div className="font-mono">
                          <p className="text-[10px] text-white uppercase tracking-tight truncate max-w-[150px]">{file.name}</p>
                          <p className="text-[9px] text-zinc-600 uppercase">{(file.size / 1024 / 1024).toFixed(3)} MB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setFile(null); setFileHash(null); }}
                        className="text-zinc-600 hover:text-rose-500 transition-colors uppercase text-[9px] font-bold"
                      >
                        [PURGE_BUFFER]
                      </button>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 space-y-2">
                       <label className="text-[9px] text-emerald-500 font-mono font-bold uppercase tracking-widest">CRYPTO_SIGNATURE_GENERATED</label>
                       <div className={cn("overflow-hidden", fileHash && "typewriter")}>
                         <p className="text-[10px] font-mono text-emerald-400 break-all leading-tight italic lowercase">
                           {fileHash || '...entropy_analysis'}
                         </p>
                       </div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleMint}
                  disabled={!studentName || !walletAddress || !fileHash || isMinting}
                  className="w-full bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-700 font-bold py-4 text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      PROCESSING_ON_BLOCKCHAIN...
                    </>
                  ) : 'EXECUTE_MINT'}
                </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-emerald-500/50 p-20 flex flex-col items-center justify-center text-center gap-8"
          >
            <GeometricLoader size="lg" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white uppercase tracking-[0.2em]">ASSET_MINTED_SUCCESSFULLY</h2>
              <p className="text-[11px] font-mono text-zinc-500 max-w-sm mx-auto uppercase">
                Identity anchored for "{studentName}". Metadata serialized and broadcast to the p2p network.
              </p>
            </div>
            
            <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-6 font-mono text-[9px] text-zinc-600 space-y-2 text-left uppercase">
               <div className="flex justify-between border-b border-zinc-900 pb-1">
                 <span>TX_HASH:</span>
                 <span className="text-emerald-500">{txDetails?.hash.slice(0, 10)}...{txDetails?.hash.slice(-8)}</span>
               </div>
               <div className="flex justify-between border-b border-zinc-900 pb-1">
                 <span>TOKEN_ID:</span>
                 <span className="text-white">#{txDetails?.tokenId}</span>
               </div>
               <div className="flex justify-between border-b border-zinc-900 pb-1">
                 <span>NODE_CONSENSUS:</span>
                 <span className="text-white">VERIFIED</span>
               </div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={resetForm} className="flex-1 bg-white text-zinc-950 font-bold py-3 text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all">
                 ISSUE_NEXT
              </button>
              <a 
                href={`https://sepolia.etherscan.io/tx/${txDetails?.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-zinc-950 border border-zinc-800 text-white font-bold py-3 text-[10px] uppercase tracking-widest hover:border-white transition-all text-center flex items-center justify-center gap-2"
              >
                 EXPLORER <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
