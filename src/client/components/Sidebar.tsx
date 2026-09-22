import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Calendar,
  FileCheck,
  Package,
  Bot,
  ShieldCheck,
  Sparkles,
  Shield,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isSuperUser =
    user?.email === 'admin@srmist.edu.in' ||
    user?.studentId === 'admin' ||
    user?.memberships?.some((m) => ['DIRECTOR', 'DY_DIRECTOR', 'ADMIN_STAFF'].includes(m.role));

  const isOrgsActive = location.pathname.startsWith('/orgs');
  const queryWindow = new URLSearchParams(location.search).get('window');

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
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between py-6 px-3 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 pb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Ecosystem Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive =
            item.to === '/'
              ? location.pathname === '/'
              : item.to === '/orgs'
              ? isOrgsActive
              : location.pathname.startsWith(item.to);

          return (
            <div key={item.to} className="space-y-1">
              <NavLink
                to={item.to}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isItemActive
                    ? 'bg-slate-100 text-slate-900 font-semibold border-l-2 border-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.label}</span>
              </NavLink>

              {/* Dedicated Windows for Organizations */}
              {item.to === '/orgs' && (
                <div className="pl-6 space-y-1 border-l border-slate-100 ml-4 py-1">
                  <Link
                    to="/orgs?window=clubs"
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isOrgsActive && (queryWindow === 'clubs' || !queryWindow)
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Clubs Window</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      20
                    </span>
                  </Link>

                  <Link
                    to="/orgs?window=domains"
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isOrgsActive && queryWindow === 'domains'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <span>Domains Window</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      13
                    </span>
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {isSuperUser && (
          <div className="pt-4 mt-3 border-t border-slate-100">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Administration
            </div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Superuser Console</span>
            </NavLink>
          </div>
        )}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Security & Scope</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Permissions are scoped to your active organization membership. Sensitive actions append audit logs.
        </p>
      </div>
    </aside>
  );
};
