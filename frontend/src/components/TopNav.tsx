import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, Bell, Hexagon } from 'lucide-react';
import { cn } from '../lib/utils';

interface TopNavProps {
  isScrolled?: boolean;
  onToggleSidebar?: () => void;
}

export function TopNav({ isScrolled, onToggleSidebar }: TopNavProps) {
  return (
    <header className={cn(
      "h-20 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0 transition-all duration-500",
      isScrolled 
        ? "bg-zinc-950/90 backdrop-blur-xl border-b border-emerald-500/30 shadow-[0_4px_20px_-12px_rgba(16,185,129,0.3)]" 
        : "bg-transparent border-b border-zinc-800/20"
    )}>
      <div className="flex items-center gap-6 flex-1">
        <button 
          onClick={onToggleSidebar}
          className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors text-zinc-400 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/30 border border-zinc-800/50 rounded-full">
          <Hexagon className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-mono text-zinc-400 tracking-wider">EVM: READY</span>
        </div>
        
        <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-800" />
        
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button 
                        onClick={openConnectModal} 
                        type="button"
                        className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button 
                        onClick={openChainModal} 
                        type="button"
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-white font-bold py-2 px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Wallet Connected
                    </button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
