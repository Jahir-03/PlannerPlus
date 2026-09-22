import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, Building2, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen = false }) => {
  const {
    user,
    activeMembership,
    setActiveMembership,
    logout,
    isSuperUser,
    isGlobalAdminScope,
    availableScopes,
  } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Header */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold font-heading text-slate-900 tracking-tight leading-tight">
              DSA ECOSYSTEM
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-medium truncate max-w-[140px] sm:max-w-none">
              Directorate of Student Affairs
            </p>
          </div>
        </Link>
      </div>

      {/* Center Org Scope Switcher for Superuser & Multi-Role Users (Desktop) */}
      {user && availableScopes.length > 0 && (
        <div
          className={`hidden md:flex items-center space-x-2 rounded-full px-3 py-1 text-xs border transition-colors ${
            isGlobalAdminScope
              ? 'bg-slate-900 border-slate-800 text-white shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          {isGlobalAdminScope ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className={isGlobalAdminScope ? 'text-slate-300 font-medium' : 'text-slate-500 font-medium'}>
            Active Scope:
          </span>
          <select
            className={`bg-transparent font-semibold focus:outline-hidden cursor-pointer text-xs ${
              isGlobalAdminScope ? 'text-white' : 'text-slate-800'
            }`}
            value={activeMembership?.orgId || (isSuperUser ? 'GLOBAL_ADMIN' : '')}
            onChange={(e) => {
              const selected = availableScopes.find((m) => m.orgId === e.target.value);
              if (selected) setActiveMembership(selected);
            }}
          >
            {availableScopes.map((m) => (
              <option key={m.orgId} value={m.orgId} className="bg-white text-slate-800">
                {m.orgId === 'GLOBAL_ADMIN' ? '👑 ' : ''}
                {m.orgName} ({m.role.replace(/_/g, ' ')})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* User Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {isSuperUser && (
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Console</span>
          </Link>
        )}

        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{user.fullName}</div>
              <div className="text-[10px] font-mono uppercase">
                {isGlobalAdminScope ? (
                  <span className="text-emerald-600 font-bold">ALL ROLES (OMNI)</span>
                ) : (
                  <span className="text-slate-500">{activeMembership ? activeMembership.role.replace(/_/g, ' ') : 'MEMBER'}</span>
                )}
              </div>
            </div>

            <div
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs shrink-0 cursor-pointer"
              title={`${user.fullName} (${isGlobalAdminScope ? 'OMNI' : activeMembership?.role || 'MEMBER'})`}
              onClick={onToggleMobileMenu}
            >
              {user.fullName.charAt(0)}
            </div>

            {/* Desktop Logout Button */}
            <button
              onClick={logout}
              className="hidden md:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-500 font-mono">Not Authenticated</span>
        )}
      </div>
    </header>
  );
};
