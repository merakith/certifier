import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, Dot, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLocation } from 'react-router-dom';

interface TopNavProps {
  isScrolled?: boolean;
  onToggleSidebar?: () => void;
}

export function TopNav({ isScrolled, onToggleSidebar }: TopNavProps) {
  const location = useLocation();

  const routeMeta: Record<string, { title: string; subtitle: string }> = {
    '/': { title: 'Dashboard', subtitle: 'Overview of certificate operations' },
    '/issue': { title: 'Issue Certificate', subtitle: 'Mint a new credential token' },
    '/verify': { title: 'Verify Token', subtitle: 'Resolve metadata for a token ID' },
    '/public-verify': { title: 'Public Verify', subtitle: 'Upload PDF and validate its hash' },
    '/revoke': { title: 'Revoke Token', subtitle: 'Permanently invalidate an issued token' },
  };

  const page = routeMeta[location.pathname] ?? {
    title: 'Certifier',
    subtitle: 'Credential operations workspace',
  };

  return (
    <header className={cn(
      'panel sticky top-0 z-30 flex h-20 items-center justify-between px-4 md:px-6',
      isScrolled 
        ? 'border-[#30363d] bg-[#161b22] shadow-sm' 
        : 'bg-[#161b22]'
    )}>
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl border border-[#30363d] bg-[#21262d] p-2 text-[#8b949e] hover:bg-[#30363d] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-[#c9d1d9] md:text-xl">{page.title}</h1>
          <p className="truncate text-xs text-[#8b949e] md:text-sm">{page.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-[11px] font-medium text-[#8b949e] md:inline-flex">
          <Compass className="h-3.5 w-3.5" />
          Local Network
          <Dot className="h-4 w-4 text-[#1f6feb]" />
          Ready
        </div>

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
                        className="btn-accent px-4 py-2 text-xs"
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
                        className="btn-danger px-4 py-2 text-xs"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="btn-primary gap-2 px-4 py-2 text-xs"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#1f6feb]" />
                      {account.displayName}
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
