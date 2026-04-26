import { LayoutDashboard, Trash2, Hexagon, ShieldCheck, FileSearch, X, Fingerprint } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: ShieldCheck, label: 'Issue Certificate', path: '/issue' },
  { icon: FileSearch, label: 'Verify Token', path: '/verify' },
  { icon: Fingerprint, label: 'Public Verify', path: '/public-verify' },
  { icon: Trash2, label: 'Revoke Token', path: '/revoke' },
];

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="panel flex h-full w-full flex-col overflow-hidden px-4 py-5">
      <div className="relative flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#30363d] bg-[#21262d]">
            <Hexagon className="h-5 w-5 text-[#c9d1d9]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b949e]">Certifier</p>
            <p className="text-sm font-semibold text-[#c9d1d9]">Credential Desk</p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-[#30363d] bg-[#21262d] p-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#8b949e]">Current Mode</p>
        <p className="mt-1 text-sm font-medium text-[#c9d1d9]">Local EVM workflow</p>
      </div>

      <nav className="mt-5 flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
              isActive 
                ? 'bg-[#1f6feb] text-white'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[#30363d] pt-4">
        <p className="text-xs text-[#8b949e]">API Endpoints</p>
        <ul className="mt-2 space-y-1 text-xs text-[#c9d1d9]">
          <li className="font-mono">POST /api/mint</li>
          <li className="font-mono">GET /api/verify/:tokenId</li>
          <li className="font-mono">POST /api/verify</li>
          <li className="font-mono">POST /api/revoke</li>
        </ul>
      </div>
    </aside>
  );
}
