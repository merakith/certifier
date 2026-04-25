import { LayoutDashboard, ShieldCheck, FileSearch, History, Settings, LogOut, Trash2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Control Center', path: '/' },
  { icon: ShieldCheck, label: 'Mint Certificate', path: '/issue' },
  { icon: ShieldCheck, label: 'Verify Entity', path: '/verify' },
  { icon: Trash2, label: 'Revoke Anchor', path: '/revoke' },
  { icon: History, label: 'Audit Log', path: '/history' },
  { icon: Settings, label: 'System Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col z-20">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-white/5 border border-zinc-800 rounded-xl flex items-center justify-center">
          <ShieldCheck className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-sm tracking-[0.2em] text-white">Certifier</span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-[10px] font-bold uppercase tracking-widest",
              isActive 
                ? "bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-3 px-4 py-2 text-zinc-600 hover:text-rose-500 transition-colors w-full text-[10px] font-bold uppercase tracking-widest">
          <LogOut className="w-4 h-4" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
