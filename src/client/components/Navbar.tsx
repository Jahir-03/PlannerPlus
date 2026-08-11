import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, LogOut, Building2, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeMembership, setActiveMembership, logout } = useAuth();

  return (
    <header className="h-16 border-b border-amber-500/20 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-600 via-rose-900 to-amber-400 p-[1px] flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold font-heading gold-gradient-text tracking-wide leading-tight">
            DSA ECOSYSTEM
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            Directorate of Student Affairs
          </p>
        </div>
      </div>

      {/* Center Org Scope Switcher for Multi-Role Users */}
      {user && user.memberships && user.memberships.length > 0 && (
        <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 border border-amber-500/20 rounded-full px-3 py-1 text-xs">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Active Scope:</span>
          <select
            className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer"
            value={activeMembership?.orgId || ''}
            onChange={(e) => {
              const selected = user.memberships.find((m) => m.orgId === e.target.value);
              if (selected) setActiveMembership(selected);
            }}
          >
            {user.memberships.map((m) => (
              <option key={m.orgId} value={m.orgId} className="bg-slate-900 text-slate-200">
                {m.orgName} ({m.role.replace(/_/g, ' ')})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user.fullName}</div>
              <div className="text-[10px] text-amber-400/90 font-mono">
                {activeMembership ? activeMembership.role.replace(/_/g, ' ') : 'MEMBER'}
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
              {user.fullName.charAt(0)}
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-amber-400 font-mono">Not Authenticated</span>
        )}
      </div>
    </header>
  );
};
