import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // I need to install this
import { ethers } from 'ethers';
import { Shield, Upload, Check, Copy, ExternalLink, Activity, Globe, Lock } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';

// Mock ABI for the smart contract verification
// In a real app, this would be the actual ABI of your verification contract
const VERIFIER_ABI = [
  {
    "inputs": [{ "internalType": "bytes32", "name": "hash", "type": "bytes32" }],
    "name": "verifyCertificate",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "issuerName", "type": "string" },
          { "internalType": "string", "name": "studentName", "type": "string" },
          { "internalType": "uint256", "name": "issueDate", "type": "uint256" },
          { "internalType": "bool", "name": "isValid", "type": "bool" }
        ],
        "internalType": "struct VerificationResult",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with your contract

export default function Verifier() {
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { isConnected } = useAccount();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    
    // Hash the file locally
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      const hash = ethers.keccak256(bytes);
      setFileHash(hash);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Use wagmi to read from the contract
  // Note: This is a placeholder since we don't have a live contract yet
  const { data: verificationResult, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: VERIFIER_ABI,
    functionName: 'verifyCertificate',
    args: [fileHash as `0x${string}`],
    query: {
      enabled: !!fileHash && isConnected,
    }
  });

  // Mock result for UI demonstration if contract isn't live
  const result = verificationResult || (fileHash ? {
    issuerName: "Global Institute of Technology",
    studentName: "Sarah J. Henderson",
    issueDate: Math.floor(Date.now() / 1000) - 86400 * 30,
    isValid: fileHash.startsWith('0x3') || fileHash.startsWith('0x5'), // Simulate some success
  } : null);

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-200 font-sans flex flex-col selection:bg-indigo-500/30">
      {/* Abstract Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-0 pointer-events-none"></div>

      {/* Header / Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-6 border-b border-white/5 bg-[#0A0B10]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ChainVerify<span className="text-indigo-400">.io</span></span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8 text-sm font-medium">
          <div className="hidden md:flex items-center gap-8 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Verify</a>
            <a href="#" className="hover:text-white transition-colors">Issuers</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
          </div>
          <div className="hidden md:block h-4 w-px bg-white/10"></div>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-10 py-12 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Immutable Verification</h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Instant cryptographic proof of educational and professional credentials powered by Ethereum.</p>
        </div>

        {/* Verification Panel */}
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
                <Lock className="w-3 h-3" /> Certificate Hash
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={fileHash || "Awaiting file drop..."} 
                  readOnly 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-slate-300 font-mono text-sm focus:outline-none group-hover:border-white/20 transition-all"
                />
                {fileHash && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(fileHash)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <DropZone onDrop={onDrop} fileName={fileName} />
            
            <p className="mt-4 text-[11px] text-slate-500 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Files are processed entirely within your browser. Privacy guaranteed.
            </p>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {fileHash ? (
              <>
                <div className={`border rounded-3xl p-6 transition-all duration-500 shadow-xl ${
                  result?.isValid 
                    ? 'bg-emerald-500/10 border-emerald-500/20' 
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${
                      result?.isValid ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'
                    }`}>
                      {result?.isValid ? <Check className="w-6 h-6 stroke-[3]" /> : <Activity className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className={`font-bold leading-tight ${result?.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result?.isValid ? 'Verified Authentic' : 'Hash Not Found'}
                      </h3>
                      <p className={`text-[10px] uppercase tracking-tighter ${result?.isValid ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                        {result?.isValid ? 'Signature Match Detected' : 'Unrecognized Credential'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Issuer Organization</p>
                      <p className="text-white font-medium">{result?.issuerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Student Recipient</p>
                      <p className="text-white font-medium">{result?.studentName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Issue Date</p>
                      <p className="text-white font-medium">
                        {new Date((result?.issueDate as number) * 1000).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex-1 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
                    Smart Contract Event Log
                    <Activity className="w-3 h-3 opacity-50" />
                  </p>
                  <div className="space-y-3 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-400">
                      <span>TxHash:</span>
                      <span className="text-indigo-400">0x{fileHash.slice(2, 5)}...{fileHash.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Timestamp:</span>
                      <span>{result?.issueDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Status:</span>
                      <span className={result?.isValid ? "text-emerald-400" : "text-amber-400"}>
                        {result?.isValid ? "Success" : "Pending"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/5 mt-2 flex justify-between text-slate-500 italic">
                      <span>Gas Used:</span>
                      <span>42,109 units</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-50 h-full">
                <Globe className="w-10 h-10 text-slate-600 mb-4" />
                <p className="text-slate-500 text-sm">Upload a certificate to begin the decentralized verification process.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Stats */}
      <footer className="px-6 md:px-10 py-6 border-t border-white/5 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <div className="flex gap-8">
          <div className="flex items-center gap-2 group cursor-help">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="group-hover:text-slate-300 transition-colors">ETH PRICE: $3,241.12</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>NETWORK: ACTIVE</span>
          </div>
        </div>
        <div className="flex gap-6 uppercase tracking-widest">
          <span className="hover:text-white cursor-pointer transition-colors">Docs</span>
          <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          <span className="text-slate-700">© 2024 ChainVerify</span>
        </div>
      </footer>
    </div>
  );
}

function DropZone({ onDrop, fileName }: { onDrop: (f: File[]) => void, fileName: string | null }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  } as any); // Type cast to avoid environment-specific React version conflicts

  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
        isDragActive 
          ? 'border-indigo-500 bg-indigo-500/5' 
          : 'border-white/10 bg-white/[0.02] hover:border-indigo-500/50 hover:bg-white/[0.04]'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className={`w-12 h-12 mb-4 transition-transform duration-300 ${isDragActive ? '-translate-y-2 text-indigo-400' : 'text-slate-500'}`} />
      <p className="text-white font-medium">
        {fileName ? fileName : 'Drag and drop PDF certificate'}
      </p>
      <p className="text-slate-500 text-sm mt-1">
        {isDragActive ? 'Drop it here' : 'Only PDF files supported for cryptographic hashing.'}
      </p>
    </div>
  );
}
