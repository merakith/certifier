import { LayoutDashboard, History, Settings, LogOut, Trash2, Hexagon, ShieldCheck, FileSearch, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Control Center', path: '/' },
  { icon: ShieldCheck, label: 'Issue Credential', path: '/issue' },
  { icon: FileSearch, label: 'Verify Entity', path: '/verify' },
  { icon: Trash2, label: 'Revoke Anchor', path: '/revoke' },
  { icon: History, label: 'Audit Log', path: '/history' },
  { icon: Settings, label: 'System Settings', path: '/settings' },
];

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="w-full h-full bg-zinc-950 border-r border-zinc-800 flex flex-col z-50">
      {/* Defined Gradient for Icons */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="sidebar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBAD1D" /> {/* yellow-400 equivalent */}
            <stop offset="100%" stopColor="#A855F7" /> {/* purple-500 equivalent */}
          </linearGradient>
        </defs>
      </svg>

      <div className="p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ x: -60, rotate: -360, opacity: 0 }}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            exit={{ x: -60, rotate: -360, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 100,
              delay: 0.2
            }}
            className="w-8 h-8 bg-white/5 border border-zinc-800 rounded-xl flex items-center justify-center"
          >
            <Hexagon className="text-white w-5 h-5" />
          </motion.div>
          <span className="font-bold text-sm tracking-[0.2em] text-white">
            Certifier
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-800/50 rounded-full text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-[11px] font-medium tracking-wide",
              isActive 
                ? "bg-white text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.1)]" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <motion.div
              whileHover={{ 
                y: [0, -6, 0, -3, 0],
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
            >
              <item.icon 
                className="w-4 h-4" 
                stroke="url(#sidebar-gradient)" 
              />
            </motion.div>
            <span>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button className="flex items-center gap-3 px-4 py-2 text-zinc-600 hover:text-rose-500 transition-colors w-full group text-[10px] font-bold uppercase tracking-widest">
          <motion.div
            whileHover={{ 
              y: [0, -6, 0, -3, 0],
              transition: { duration: 0.5, ease: "easeInOut" }
            }}
          >
            <LogOut 
              className="w-4 h-4" 
              stroke="url(#sidebar-gradient)"
            />
          </motion.div>
          <span>
            Terminate Session
          </span>
        </button>
      </div>
    </aside>
  );
}
