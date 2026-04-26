import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  ShieldCheck, 
  ShieldAlert, 
} from 'lucide-react';
import { cn } from '../lib/utils';

const VERIFY_STATES = [
  'INITIALIZING_PROTOCOL',
  'SEARCHING_BLOCK_HISTORY',
  'VERIFYING_NODE_CONSENSUS',
  'SYNCING_CHAIN_DATA',
];

export function PublicVerify() {
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatusIndex, setVerifyStatusIndex] = useState(0);
  const [verificationResult, setVerificationResult] = useState<'success' | 'failed' | null>(null);
  const [certData, setCertData] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (isVerifying) {
      interval = setInterval(() => {
        setVerifyStatusIndex((prev) => (prev + 1) % VERIFY_STATES.length);
      }, 800);
    } else {
      setVerifyStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isVerifying]);

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
      setCertData(null);
      setIsVerifying(true);
      
      const hash = await calculateHash(selectedFile);
      setFileHash(hash);

      try {
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash })
        });
        const data = await response.json();
        
        setIsVerifying(false);
        if (data.valid) {
          setCertData(data.data);
          setVerificationResult('success');
        } else {
          setVerificationResult('failed');
        }
      } catch (error) {
        console.error("Verification error:", error);
        setIsVerifying(false);
        setVerificationResult('failed');
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
    setCertData(null);
  };

  const explorerHref = certData?.txHash
    ? `https://sepolia.etherscan.io/tx/${certData.txHash}`
    : certData?.transactionHash
      ? `https://sepolia.etherscan.io/tx/${certData.transactionHash}`
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="panel p-6 md:p-8">
        <h2 className="section-title text-xl md:text-2xl">Public PDF Verification</h2>
        <p className="section-subtitle mt-2">Upload a PDF certificate and validate its SHA-256 hash against on-chain data.</p>

        {!file && !isVerifying && (
          <div
            {...getRootProps()}
            className={cn(
              'mt-6 cursor-pointer rounded-2xl border border-dashed p-10 text-center',
              isDragActive ? 'border-[#1f6feb] bg-[#0d1f3a]' : 'border-[#30363d] bg-[#0d1117]'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-[#8b949e]" />
            <p className="mt-3 text-sm font-medium text-[#c9d1d9]">Drop a PDF here or click to upload</p>
            <p className="mt-1 text-sm text-[#8b949e]">Only .pdf files are accepted.</p>
          </div>
        )}

        {isVerifying && (
          <div className="panel mt-6 p-5">
            <p className="text-sm font-medium text-[#c9d1d9]">Verifying document...</p>
            <p className="mt-1 font-mono text-xs text-[#8b949e]">{VERIFY_STATES[verifyStatusIndex]}</p>
          </div>
        )}

        {verificationResult === 'success' && certData && (
          <div className="panel mt-6 p-5">
            <div className="flex items-start gap-2 text-[#3fb950]">
              <ShieldCheck className="mt-0.5 h-5 w-5" />
              <div>
                <h3 className="text-base font-semibold">Verification successful</h3>
                <p className="mt-1 text-sm text-[#8b949e]">Certificate hash matches a valid record.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="panel p-4">
                <p className="text-xs text-[#8b949e]">Student Name</p>
                <p className="mt-1 text-sm font-medium text-[#c9d1d9]">{certData.studentName || 'N/A'}</p>
              </article>
              <article className="panel p-4">
                <p className="text-xs text-[#8b949e]">Recipient Wallet</p>
                <p className="mt-1 break-all font-mono text-sm text-[#c9d1d9]">{certData.recipientWallet || 'N/A'}</p>
              </article>
              <article className="panel p-4">
                <p className="text-xs text-[#8b949e]">Block Number</p>
                <p className="mt-1 font-mono text-sm text-[#c9d1d9]">{certData.blockNumber || 'N/A'}</p>
              </article>
              <article className="panel p-4">
                <p className="text-xs text-[#8b949e]">Timestamp</p>
                <p className="mt-1 text-sm text-[#c9d1d9]">
                  {certData.timestamp ? new Date(certData.timestamp).toLocaleString() : 'N/A'}
                </p>
              </article>
            </div>

            <article className="panel mt-4 p-4">
              <p className="text-xs text-[#8b949e]">SHA-256 Hash</p>
              <p className="mt-1 break-all font-mono text-sm text-[#c9d1d9]">{fileHash}</p>
            </article>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={explorerHref || '#'}
                target="_blank"
                rel="noreferrer"
                className={cn('btn-primary', !explorerHref && 'pointer-events-none opacity-50')}
              >
                Open Explorer
              </a>
              <button onClick={reset} className="btn-primary">Verify Another PDF</button>
            </div>
          </div>
        )}

        {verificationResult === 'failed' && (
          <div className="mt-6 rounded-xl border border-[#f85149]/50 bg-[#2d1117] p-5 text-[#f85149]">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <div>
                <h3 className="text-base font-semibold">Verification failed</h3>
                <p className="mt-1 text-sm">The uploaded file hash does not match any valid on-chain record.</p>
                <p className="mt-2 break-all font-mono text-xs">Hash: {fileHash}</p>
              </div>
            </div>
            <button onClick={reset} className="btn-primary mt-4">Try Again</button>
          </div>
        )}
      </section>
    </div>
  );
}
