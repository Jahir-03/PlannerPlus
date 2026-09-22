import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, CheckSquare, FileCheck, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
  pendingApprovalsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMenu,
  isMenuOpen,
  pendingApprovalsCount = 0,
}) => {
  const navItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/orgs', label: 'Orgs', icon: Building2 },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/approvals', label: 'Approvals', icon: FileCheck, badge: pendingApprovalsCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive && !isMenuOpen
                  ? 'text-slate-900 font-bold bg-slate-100/80 scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full min-w-3.5 h-3.5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenMenu}
        aria-label="Open Navigation Drawer"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          isMenuOpen ? 'text-blue-600 font-bold bg-blue-50 scale-105' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
      </button>
    </nav>
  );
};
