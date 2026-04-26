import { useState } from 'react';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export function VerifyCertificate() {
  const [tokenId, setTokenId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!tokenId) return;
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/verify/${tokenId}`, {
        method: 'GET',
      });

      const data = await response.json();
      if (data.verified) {
        setResult(data);
      } else {
        setError('No matching certificate found for this token ID.');
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Verification request failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setTokenId('');
    setResult(null);
    setError(null);
  };

  return (
    <section className="panel max-w-4xl p-6 md:p-8">
      <h2 className="section-title text-xl md:text-2xl">Verify Token</h2>
      <p className="section-subtitle mt-2">Enter a token ID and validate the certificate metadata anchored on-chain.</p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm text-[#8b949e]">Token ID</label>
          <input
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="e.g. 1"
            className="field"
          />
        </div>
        <button onClick={handleVerify} disabled={!tokenId || isVerifying} className="btn-primary min-w-44">
          {isVerifying ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </span>
          ) : (
            'Verify'
          )}
        </button>
      </div>

      {!result && !error && !isVerifying && (
        <div className="panel mt-6 p-4 text-sm text-[#8b949e]">Verification results will appear here.</div>
      )}

      {result && (
        <article className="panel mt-6 p-5">
          <div className="mb-4 flex items-center gap-2 text-[#3fb950]">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-sm font-semibold">Certificate is valid</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-[#8b949e]">Student</p>
              <p className="mt-1 text-sm font-medium text-[#c9d1d9]">{result.metadata?.name?.replace('Certificate - ', '') || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-[#8b949e]">Token ID</p>
              <p className="mt-1 font-mono text-sm font-semibold text-[#c9d1d9]">{result.tokenId}</p>
            </div>
            <div>
              <p className="text-xs text-[#8b949e]">Course</p>
              <p className="mt-1 text-sm font-medium text-[#c9d1d9]">
                {result.metadata?.attributes?.find((a: any) => a.trait_type === 'Course')?.value || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#8b949e]">Issuer</p>
              <p className="mt-1 text-sm font-medium text-[#c9d1d9]">
                {result.metadata?.attributes?.find((a: any) => a.trait_type === 'Issuer')?.value || 'N/A'}
              </p>
            </div>
          </div>

          <button onClick={reset} className="btn-primary mt-5">Clear</button>
        </article>
      )}

      {error && (
        <article className="mt-6 rounded-xl border border-[#f85149]/50 bg-[#2d1117] p-4 text-[#f85149]">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={reset} className="btn-primary mt-4">Reset</button>
        </article>
      )}
    </section>
  );
}

