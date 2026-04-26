import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, SearchCheck, ShieldX, Fingerprint } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalVerified: '---',
    blockHeight: '---',
    network: 'FETCHING...',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats({
          totalVerified: data.totalVerified || '---',
          blockHeight: data.blockHeight || '---',
          network: data.network || 'OFFLINE',
        });
      } catch (error: any) {
        console.warn('Dashboard stats issue:', error.message || error);
        setStats((prev) => ({
          ...prev,
          network: prev.network === 'FETCHING...' ? 'OFFLINE' : prev.network,
        }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const actions = [
    {
      label: 'Issue Certificate',
      description: 'Mint a new credential NFT to a recipient wallet.',
      to: '/issue',
      icon: ShieldCheck,
    },
    {
      label: 'Verify Token',
      description: 'Resolve and validate metadata using token ID.',
      to: '/verify',
      icon: SearchCheck,
    },
    {
      label: 'Public Verify',
      description: 'Upload a PDF and validate its SHA-256 fingerprint.',
      to: '/public-verify',
      icon: Fingerprint,
    },
    {
      label: 'Revoke Token',
      description: 'Invalidate an existing certificate token permanently.',
      to: '/revoke',
      icon: ShieldX,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="panel p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title">Certificate Operations</h2>
            <p className="section-subtitle mt-2 max-w-2xl">
              Use this workspace to issue, verify, and revoke certificate tokens using your current blockchain setup.
            </p>
          </div>
          <span className="pill">
            Network: {stats.network}
          </span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <p className="text-sm text-[#8b949e]">Total Verified</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#c9d1d9]">{stats.totalVerified}</p>
        </article>
        <article className="panel p-5">
          <p className="text-sm text-[#8b949e]">Current Block</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#c9d1d9]">{stats.blockHeight}</p>
        </article>
        <article className="panel p-5">
          <p className="text-sm text-[#8b949e]">Node Status</p>
          <p className="mt-2 text-2xl font-semibold text-[#c9d1d9]">{stats.network}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="panel flex items-start gap-4 p-5 hover:border-[#8b949e]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#21262d] text-[#c9d1d9]">
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#c9d1d9]">{action.label}</h3>
              <p className="mt-1 text-sm text-[#8b949e]">{action.description}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
