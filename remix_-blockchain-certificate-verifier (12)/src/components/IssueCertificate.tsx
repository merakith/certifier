import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Loader2,
} from 'lucide-react';
import { mintCertificate } from '../services/certificateService';

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
      const data = await mintCertificate({
        to: walletAddress,
        name: studentName,
        course: course,
        issuer: issuer,
        image: imageURL
      });
      
      // Checking for transactionHash or status as per user's example
      if (data.transactionHash || data.status === 'submitted') {
        setTxDetails({
          hash: data.transactionHash,
          blockNumber: data.blockNumber,
          tokenId: data.tokenId,
          mintedData: data.data || {
            name: studentName,
            course: course,
            issuer: issuer,
            image: imageURL
          }
        });
        setMinted(true);
      } else {
        console.error("Minting failed:", data.error || data.message);
        alert("Minting failed: " + (data.error || data.message || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Network error during minting:", error);
      alert("MINTING_ERROR: " + error.message);
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
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {isMinting && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ 
                  width: ["10%", "85%", "10%"]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute left-0 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"
              />
            </div>
          )}
          <div className="p-8 space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white tracking-tight">Issue New Certificate</h2>
              <p className="text-xs text-zinc-500">Provide recipient and course details for blockchain anchoring.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Recipient wallet address</label>
                  <input 
                    type="text" 
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Student full name</label>
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Course title</label>
                  <input 
                    type="text" 
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Blockchain Fundamentals"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Issuing institution</label>
                  <input 
                    type="text" 
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="Certifier Academy"
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400">Certificate image URL</label>
                <input 
                  type="text" 
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="https://ipfs.io/ipfs/..."
                  className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm font-sans text-white focus:outline-none focus:border-emerald-500 transition-all rounded-2xl placeholder:text-zinc-800 shadow-inner"
                />
              </div>
            </div>

            <button 
              onClick={handleMint}
              disabled={!studentName || !walletAddress || !course || !issuer || !imageURL || isMinting}
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 font-bold py-4 text-xs transition-all flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-emerald-500/20"
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
          className="bg-zinc-900 border border-emerald-500/30 overflow-hidden rounded-3xl shadow-2xl flex flex-col"
        >
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                 <CheckCircle2 className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Minting Successful</h2>
                <p className="text-xs text-zinc-500">Asset successfully anchored to the blockchain.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800">
               <div className="aspect-video rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  {txDetails?.mintedData?.image ? (
                    <img src={txDetails.mintedData.image} alt="Certificate" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-zinc-700 text-xs font-mono uppercase">Image_Not_Found</div>
                  )}
               </div>
               <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">Recipient</p>
                    <p className="text-sm text-white font-medium">{txDetails?.mintedData?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">Course</p>
                    <p className="text-sm text-white font-medium">{txDetails?.mintedData?.course}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-zinc-600 font-bold tracking-widest">Token ID</p>
                    <p className="text-sm text-emerald-500 font-mono font-bold">#{txDetails?.tokenId}</p>
                  </div>
               </div>
            </div>
            
            <div className="w-full bg-zinc-950/80 rounded-2xl border border-zinc-800 p-5 font-mono text-[10px] text-zinc-500 space-y-2">
               <div className="flex justify-between gap-4">
                 <span className="uppercase text-zinc-700">Transaction_Hash</span>
                 <span className="text-emerald-500/80 truncate max-w-[200px]">{txDetails?.hash}</span>
               </div>
               <div className="flex justify-between">
                 <span className="uppercase text-zinc-700">Block_Height</span>
                 <span className="text-white/80">#{txDetails?.blockNumber}</span>
               </div>
            </div>

            <button 
              onClick={resetForm} 
              className="w-full bg-white text-zinc-950 font-bold py-4 text-xs transition-all flex items-center justify-center gap-2 rounded-2xl hover:bg-zinc-200"
            >
               Issue Another Credential
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
