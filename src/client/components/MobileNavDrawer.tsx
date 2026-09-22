import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  X,
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
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose }) => {
  const {
    user,
    activeMembership,
    setActiveMembership,
    logout,
    isSuperUser,
    isGlobalAdminScope,
    availableScopes,
  } = useAuth();

  const location = useLocation();

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 md:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 font-heading">DSA ECOSYSTEM</div>
              <div className="text-[10px] text-slate-500 font-medium">Mobile Operations Hub</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="p-4 bg-slate-900 text-white border-b border-slate-800 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                {user.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate text-white">{user.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>

            {/* Scope Switcher on Mobile */}
            {availableScopes.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center space-x-1 font-semibold">
                    {isGlobalAdminScope ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Active Role / Scope</span>
                  </span>
                  {isGlobalAdminScope && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                      OMNI
                    </span>
                  )}
                </div>

                <select
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
                  value={activeMembership?.orgId || (isSuperUser ? 'GLOBAL_ADMIN' : '')}
                  onChange={(e) => {
                    const selected = availableScopes.find((m) => m.orgId === e.target.value);
                    if (selected) {
                      setActiveMembership(selected);
                      onClose();
                    }
                  }}
                >
                  {availableScopes.map((m) => (
                    <option key={m.orgId} value={m.orgId} className="bg-slate-900 text-white">
                      {m.orgId === 'GLOBAL_ADMIN' ? '👑 ' : ''}
                      {m.orgName} ({m.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Navigation Modules */}
        <div className="p-3 flex-1 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Navigation Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isItemActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <div key={item.to} className="space-y-1">
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isItemActive
                      ? 'bg-slate-100 text-slate-900 border-l-3 border-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </NavLink>

                {/* Sub-links for Orgs */}
                {item.to === '/orgs' && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
                    <Link
                      to="/orgs?window=clubs"
                      onClick={onClose}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Cultural Clubs</span>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        20
                      </span>
                    </Link>
                    <Link
                      to="/orgs?window=domains"
                      onClick={onClose}
                      className="flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-500" />
                        <span>Core Domains</span>
                      </div>
                      <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                        13
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}

          {/* Superuser Admin Link */}
          {isSuperUser && (
            <div className="pt-2">
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Console (Omni)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
              </NavLink>
            </div>
          )}
        </div>

        {/* Footer with Sign Out */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Ecosystem</span>
          </button>
          <div className="text-[10px] text-center text-slate-400 font-mono">
            DSA Platform v1.0 • Mobile Suite
          </div>
        </div>
      </div>
    </div>
  );
};
