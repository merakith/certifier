import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell, Search, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavProps {
  isScrolled?: boolean;
}

export function TopNav({ isScrolled }: TopNavProps) {
  return (
    <header className={cn(
      "h-20 flex items-center justify-between px-8 z-20 sticky top-0 transition-all duration-500",
      isScrolled 
        ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20" 
        : "bg-transparent"
    )}>
      <div className="flex items-center gap-8 flex-1">
        <div className="relative max-w-sm w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search credentials..." 
            className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/50 rounded-xl py-2 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800/50 rounded-full text-[10px] font-mono font-medium text-zinc-400 tracking-wider">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          NET_STATUS: STABLE
        </div>
        
        <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-800" />
        
        <ConnectButton 
          accountStatus="address" 
          showBalance={false}
          chainStatus="none"
        />
      </div>
    </header>
  );
}
