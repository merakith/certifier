import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Decorative Symmetrical Grid */}
        <div className="absolute inset-0 cyber-grid pointer-events-none" />
        
        <TopNav />
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
