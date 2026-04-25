import { LayoutDashboard, ShieldCheck, FileSearch, History, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileSearch, label: 'Certificate Hash', path: '/verify' },
  { icon: ShieldCheck, label: 'Public Verify', path: '/public-verify' },
  { icon: ShieldCheck, label: 'Issue New', path: '/issue' },
  { icon: History, label: 'Verification Log', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col z-20">
      <div className="p-8 flex items-center gap-3">
        <div className="w-6 h-6 bg-white rounded-none flex items-center justify-center">
          <ShieldCheck className="text-zinc-950 w-4 h-4" />
        </div>
        <span className="font-bold text-sm tracking-[0.2em] text-white">Certifier</span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-2 rounded-none transition-all duration-200 group text-[11px] font-bold uppercase tracking-widest",
              isActive 
                ? "bg-zinc-100 text-zinc-950" 
                : "text-zinc-500 hover:text-white"
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
