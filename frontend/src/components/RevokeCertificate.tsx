import { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';

export function RevokeCertificate() {
  const [tokenId, setTokenId] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRevoke = async () => {
    if (!tokenId) return;
    setIsRevoking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || data.message || 'REVOCATION_FAILED');
      }
    } catch (err: any) {
      setError(`NETWORK_FAILURE: ${err.message}`);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="panel p-6 md:p-8">
        <h2 className="section-title text-xl md:text-2xl">Revoke Token</h2>
        <p className="section-subtitle mt-2">This action is irreversible. Revoked certificates cannot be restored.</p>

        <div className="mt-5 rounded-xl border border-[#d29922]/40 bg-[#2e2200] px-4 py-3 text-sm text-[#d29922]">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>Use only for invalid, fraudulent, or superseded certificates.</span>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-[#8b949e]">Token ID</label>
          <input
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter token ID"
            className="field"
          />
        </div>

        <button
          onClick={handleRevoke}
          disabled={!tokenId || isRevoking}
          className="btn-danger mt-5"
        >
          {isRevoking ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Revoking...
            </span>
          ) : (
            'Revoke Token'
          )}
        </button>
      </section>

      {result && (
        <section className="panel p-6">
          <div className="flex items-start gap-2 text-[#3fb950]">
            <Trash2 className="mt-0.5 h-5 w-5" />
            <div>
              <h3 className="text-base font-semibold">Revocation successful</h3>
              <p className="mt-1 text-sm text-[#8b949e]">The token was revoked on-chain.</p>
            </div>
          </div>

          <div className="panel mt-4 p-4">
            <p className="text-xs text-[#8b949e]">Transaction Hash</p>
            <p className="mt-1 break-all font-mono text-sm text-[#c9d1d9]">{result.hash}</p>
          </div>
        </section>
      )}

      {error && (
        <section className="rounded-xl border border-[#f85149]/50 bg-[#2d1117] p-4 text-[#f85149]">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4" />
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        </section>
      )}
    </div>
  );
}
