import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell, Search, Cpu } from 'lucide-react';

export function TopNav() {
  return (
    <header className="h-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8 z-20">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative max-w-sm w-full group">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="CRYPTOGRAPHIC SEARCH..." 
            className="w-full bg-transparent border-b border-zinc-800 rounded-none py-2 pl-8 pr-4 text-[10px] font-mono text-white focus:outline-none focus:border-white transition-all placeholder:text-zinc-700 uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none animate-pulse" />
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
