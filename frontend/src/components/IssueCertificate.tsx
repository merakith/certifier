import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function IssueCertificate() {
  const [studentName, setStudentName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [course, setCourse] = useState('');
  const [issuer, setIssuer] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [txDetails, setTxDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const canMint = useMemo(
    () => Boolean(studentName && walletAddress && course && issuer && imageURL && !isMinting),
    [studentName, walletAddress, course, issuer, imageURL, isMinting]
  );

  const handleMint = async () => {
    if (!studentName || !walletAddress || !course || !issuer || !imageURL) return;
    setIsMinting(true);
    setError(null);
    
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
        setError(data.error || data.message || 'Minting failed');
      }
    } catch (error: any) {
      setError(error.message || 'Network error during minting');
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
    setError(null);
    setMinted(false);
    setTxDetails(null);
  };

  if (minted && txDetails) {
    return (
      <section className="panel max-w-4xl p-6 md:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#3fb950]" />
          <div>
            <h2 className="section-title text-xl md:text-2xl">Certificate minted</h2>
            <p className="section-subtitle mt-1">The certificate token was successfully issued on-chain.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="panel p-4">
            <p className="text-xs text-[#8b949e]">Recipient</p>
            <p className="mt-1 text-sm font-medium text-[#c9d1d9]">{txDetails.mintedData?.name}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs text-[#8b949e]">Course</p>
            <p className="mt-1 text-sm font-medium text-[#c9d1d9]">{txDetails.mintedData?.course}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs text-[#8b949e]">Token ID</p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#c9d1d9]">{txDetails.tokenId ?? 'N/A'}</p>
          </article>
          <article className="panel p-4">
            <p className="text-xs text-[#8b949e]">Block Number</p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#c9d1d9]">{txDetails.blockNumber ?? 'N/A'}</p>
          </article>
        </div>

        <article className="panel mt-4 p-4">
          <p className="text-xs text-[#8b949e]">Transaction Hash</p>
          <p className="mt-1 break-all font-mono text-sm text-[#c9d1d9]">{txDetails.hash}</p>
        </article>

        <button onClick={resetForm} className="btn-primary mt-6">Issue Another Certificate</button>
      </section>
    );
  }

  return (
    <section className="panel max-w-4xl p-6 md:p-8">
      <h2 className="section-title text-xl md:text-2xl">Issue Certificate</h2>
      <p className="section-subtitle mt-2">Provide recipient and course details to mint a new certificate token.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-[#8b949e]">Recipient Wallet Address</label>
          <input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-[#8b949e]">Student Full Name</label>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Jane Doe"
            className="field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-[#8b949e]">Course Title</label>
          <input
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Blockchain Fundamentals"
            className="field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-[#8b949e]">Issuing Institution</label>
          <input
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="Certifier Academy"
            className="field"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm text-[#8b949e]">Certificate Image URL</label>
        <input
          value={imageURL}
          onChange={(e) => setImageURL(e.target.value)}
          placeholder="https://ipfs.io/ipfs/..."
          className="field"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-[#f85149]/50 bg-[#2d1117] px-4 py-3 text-sm text-[#f85149]">{error}</div>
      )}

      <button onClick={handleMint} disabled={!canMint} className="btn-accent mt-6 min-w-48">
        {isMinting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Minting...
          </span>
        ) : (
          'Mint Certificate'
        )}
      </button>
    </section>
  );
}
