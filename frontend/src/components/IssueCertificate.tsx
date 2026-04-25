import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Loader2,
} from 'lucide-react';

const MINT_STATES = [
  'INITIALIZING_PROTOCOL',
  'COMPILING_PROOF',
  'ENCRYPTING_PAYLOAD',
  'ESTABLISHING_SECURE_CHANNEL',
  'BROADCASTING_TX',
  'AWAITING_CONSENSUS'
];

export function IssueCertificate() {
  const [studentName, setStudentName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [course, setCourse] = useState('');
  const [issuer, setIssuer] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatusIndex, setMintStatusIndex] = useState(0);
  const [minted, setMinted] = useState(false);
  const [txDetails, setTxDetails] = useState<any>(null);

  useEffect(() => {
    let interval: any;
    if (isMinting) {
      interval = setInterval(() => {
        setMintStatusIndex((prev) => (prev + 1) % MINT_STATES.length);
      }, 1000);
    } else {
      setMintStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isMinting]);

  const handleMint = async () => {
    if (!studentName || !walletAddress || !course || !issuer || !imageURL) return;
    setIsMinting(true);
    
    try {
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: walletAddress,
          name: studentName,
          course: course,
          issuer: issuer,
          image: imageURL
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setTxDetails({
          hash: data.hash,
          blockNumber: data.blockNumber
        });
        setMinted(true);
      } else {
        console.error("Minting failed:", data.error);
        alert("Minting failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Network error during minting:", error);
      alert("NETWORK_STABILITY_ERROR: Check console.");
    } finally {
      setIsMinting(false);
    }
  };

  const resetForm = () => {
    setStudentName('');
    setWalletAddress('');
    setCourse('');
    setIssuer('');
    setImageURL('');
    setMinted(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!minted ? (
        <motion.div 
          key="issue-form"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-8 space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white tracking-tight">ASSET_MINTING_NODE</h2>
              <p className="text-[10px] font-mono text-zinc-600 uppercase">Input metadata for L1 synchronization</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">RECIPIENT_ADDRESS</label>
                  <input 
                    type="text" 
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-xl placeholder:text-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">STUDENT_IDENTIFIER</label>
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-xl placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">COURSE_TITLE</label>
                  <input 
                    type="text" 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Blockchain 101"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-xl placeholder:text-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ISSUING_AUTHORITY</label>
                  <input 
                    type="text" 
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="Certifier Academy"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-xl placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">RESOURCE_IMAGE_URL</label>
                <input 
                  type="text" 
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="https://resources.ipfs..."
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-mono text-white focus:outline-none focus:border-white transition-all rounded-xl placeholder:text-zinc-800"
                />
              </div>
            </div>

            <button 
              onClick={handleMint}
              disabled={!studentName || !walletAddress || !course || !issuer || !imageURL || isMinting}
              className="w-full bg-white text-zinc-950 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-700 font-bold py-4 text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 rounded-xl"
            >
              {isMinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {MINT_STATES[mintStatusIndex]}...
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
          className="bg-zinc-900 border border-emerald-500/50 p-12 flex flex-col items-center justify-center text-center gap-8"
        >
          <div className="w-16 h-16 border-2 border-emerald-500 flex items-center justify-center">
             <CheckCircle2 className="text-emerald-500 w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">CONSENSUS_ACHIEVED</h2>
            <p className="text-[10px] font-mono text-zinc-500 max-w-sm mx-auto uppercase">
               IDENTITY_ANCHORED_SUCCESSFULLY: {studentName} registered on relay.
            </p>
          </div>
          
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 font-mono text-[9px] text-zinc-600 space-y-2 text-left uppercase">
             <div className="flex justify-between border-b border-zinc-900 pb-1">
               <span>TX_HASH:</span>
               <span className="text-emerald-500">{txDetails?.hash?.slice(0, 16)}...</span>
             </div>
             <div className="flex justify-between border-b border-zinc-900 pb-1">
               <span>BLOCK_HEIGHT:</span>
               <span className="text-white">#{txDetails?.blockNumber}</span>
             </div>
          </div>

          <button 
            onClick={resetForm} 
            className="w-full max-w-md bg-white text-zinc-950 font-bold py-4 text-[11px] uppercase tracking-widest hover:bg-zinc-200 transition-all text-center"
          >
             ISSUE_NEXT_CREDENTIAL
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
