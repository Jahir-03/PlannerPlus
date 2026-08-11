import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Users, CheckSquare, Sparkles, Compass } from 'lucide-react';

export const OrganizationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CLUB' | 'CORE_DOMAIN'>('ALL');

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const res = await fetch('/api/orgs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  const filteredOrgs = orgs.filter((o: any) => {
    if (activeTab === 'ALL') return true;
    return o.type === activeTab;
  });

  const clubsCount = orgs.filter((o: any) => o.type === 'CLUB').length;
  const domainsCount = orgs.filter((o: any) => o.type === 'CORE_DOMAIN').length;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading gold-gradient-text">
            DSA Organizational Workspaces
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Managing {clubsCount} Cultural Clubs and {domainsCount} Core Administrative Domains
          </p>
        </div>

        <div className="flex bg-slate-900 border border-amber-500/20 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'ALL' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Workspaces ({orgs.length})
          </button>
          <button
            onClick={() => setActiveTab('CLUB')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'CLUB' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clubs ({clubsCount})
          </button>
          <button
            onClick={() => setActiveTab('CORE_DOMAIN')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              activeTab === 'CORE_DOMAIN' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Domains ({domainsCount})
          </button>
        </div>
      </div>

      {/* Grid of Workspaces */}
      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading workspaces...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map((org: any) => (
            <div
              key={org.id}
              className="glass-panel p-5 glass-card-hover space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    {org.type === 'CLUB' ? 'Cultural Club' : 'Core Domain'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{org.code}</span>
                </div>

                <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>{org.name}</span>
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {org.description || 'DSA operational workspace for team coordination and events.'}
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{org._count?.memberships || 0} Members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>{org._count?.tasks || 0} Tasks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
