import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Calendar,
  FileCheck,
  Package,
  Bot,
  ShieldAlert,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orgs', label: 'Organizations (33)', icon: Building2 },
    { to: '/tasks', label: 'Task Engine', icon: CheckSquare },
    { to: '/events', label: 'Event Operations', icon: Calendar },
    { to: '/approvals', label: 'Approvals Workflow', icon: FileCheck },
    { to: '/resources', label: 'Resource Inventory', icon: Package },
    { to: '/ai-assistant', label: 'AI Operations Assistant', icon: Bot },
  ];

  return (
    <aside className="w-64 border-r border-amber-500/20 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between py-6 px-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 pb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Ecosystem Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-900/20 border border-amber-500/40 text-amber-300 shadow-md shadow-amber-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4 text-amber-400/80" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="glass-panel p-3 border-amber-500/20 text-xs text-slate-400 space-y-2">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Security & Scope</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Permissions are scoped to your active organization membership. Sensitive actions append audit logs.
        </p>
      </div>
    </aside>
  );
};
