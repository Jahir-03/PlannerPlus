import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../utils/api';
import {
  Building2,
  Users,
  CheckSquare,
  ArrowRight,
  Search,
  Sparkles,
  Shield,
  Columns,
  Layers,
  X
} from 'lucide-react';

interface OrganizationsPageProps {
  defaultWindow?: 'clubs' | 'domains' | 'split';
}

export const OrganizationsPage: React.FC<OrganizationsPageProps> = ({ defaultWindow }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active window: 'clubs' | 'domains' | 'split'
  const paramWindow = searchParams.get('window') as 'clubs' | 'domains' | 'split' | null;
  const activeWindow: 'clubs' | 'domains' | 'split' =
    paramWindow || defaultWindow || 'clubs';

  const setWindow = (w: 'clubs' | 'domains' | 'split') => {
    setSearchParams({ window: w });
  };

  // Search queries for each window
  const [clubsSearch, setClubsSearch] = useState('');
  const [domainsSearch, setDomainsSearch] = useState('');

  const { data: rawOrgs = [], isLoading } = useQuery({
    queryKey: ['orgs'],
    queryFn: () => fetchApi('/api/orgs'),
  });

  const orgs = Array.isArray(rawOrgs) ? rawOrgs : [];

  const allClubs = useMemo(() => orgs.filter((o: any) => o.type === 'CLUB'), [orgs]);
  const allDomains = useMemo(() => orgs.filter((o: any) => o.type === 'CORE_DOMAIN'), [orgs]);

  const filteredClubs = useMemo(() => {
    const q = clubsSearch.trim().toLowerCase();
    if (!q) return allClubs;
    return allClubs.filter(
      (c: any) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [allClubs, clubsSearch]);

  const filteredDomains = useMemo(() => {
    const q = domainsSearch.trim().toLowerCase();
    if (!q) return allDomains;
    return allDomains.filter(
      (d: any) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }, [allDomains, domainsSearch]);

  // Aggregate stats
  const totalClubMembers = allClubs.reduce((acc: number, c: any) => acc + (c._count?.memberships || 0), 0);
  const totalClubTasks = allClubs.reduce((acc: number, c: any) => acc + (c._count?.tasks || 0), 0);
  const totalDomainMembers = allDomains.reduce((acc: number, d: any) => acc + (d._count?.memberships || 0), 0);
  const totalDomainTasks = allDomains.reduce((acc: number, d: any) => acc + (d._count?.tasks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Window Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>DSA Organizational Windows</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Organization Workspaces
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Dedicated operational windows for <strong>{allClubs.length} Cultural Clubs</strong> and <strong>{allDomains.length} Core Administrative Domains</strong>.
            </p>
          </div>

          {/* Large Window Switcher Bar */}
          <div className="inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-auto shadow-xs">
            <button
              onClick={() => setWindow('clubs')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeWindow === 'clubs'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Cultural Clubs Window</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {allClubs.length}
              </span>
            </button>

            <button
              onClick={() => setWindow('domains')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeWindow === 'domains'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Core Domains Window</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {allDomains.length}
              </span>
            </button>

            <button
              onClick={() => setWindow('split')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeWindow === 'split'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View both windows side by side"
            >
              <Columns className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Split Dual View</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-16 text-center font-mono">
          Loading organizational units...
        </div>
      ) : (
        <>
          {/* WINDOW 1: CULTURAL CLUBS DEDICATED WINDOW */}
          {activeWindow === 'clubs' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {/* Window Header */}
              <div className="border-b border-slate-200 p-5 bg-gradient-to-r from-blue-50/50 via-white to-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold font-heading text-slate-900">
                          Cultural Clubs Window
                        </h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                          {allClubs.length} Active Clubs
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Creative, performing arts, literary, and student talent clubs under DSA.
                      </p>
                    </div>
                  </div>

                  {/* Window Metrics */}
                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-600">
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
                      <span className="font-bold text-slate-900">{totalClubMembers}</span> Members
                    </div>
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
                      <span className="font-bold text-slate-900">{totalClubTasks}</span> Tasks
                    </div>
                  </div>
                </div>

                {/* Search Bar for Clubs */}
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={clubsSearch}
                    onChange={(e) => setClubsSearch(e.target.value)}
                    placeholder="Search clubs by name, code, or description..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
                  />
                  {clubsSearch && (
                    <button
                      onClick={() => setClubsSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Cultural Clubs */}
              <div className="p-6">
                {filteredClubs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-mono">
                    No cultural clubs match "{clubsSearch}".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClubs.map((org: any) => (
                      <Link
                        key={org.id}
                        to={`/orgs/${org.id}`}
                        className="bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 rounded-xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3 block text-left no-underline"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-medium bg-blue-50 border border-blue-200 text-blue-700">
                              Cultural Club
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">{org.code}</span>
                          </div>

                          <h4 className="text-base font-bold font-heading text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                            <span>{org.name}</span>
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {org.description || 'DSA cultural club workspace for student team coordination and performances.'}
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{org._count?.memberships || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span>{org._count?.tasks || 0} tasks</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 text-slate-700 group-hover:text-blue-600 font-semibold text-[11px] transition-colors">
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WINDOW 2: CORE ADMINISTRATIVE DOMAINS DEDICATED WINDOW */}
          {activeWindow === 'domains' && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              {/* Window Header */}
              <div className="border-b border-slate-200 p-5 bg-gradient-to-r from-purple-50/50 via-white to-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold font-heading text-slate-900">
                          Core Administrative Domains Window
                        </h3>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold border border-purple-200">
                          {allDomains.length} Active Domains
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Central operations, logistics, approvals, security, and public relations wings.
                      </p>
                    </div>
                  </div>

                  {/* Window Metrics */}
                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-600">
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
                      <span className="font-bold text-slate-900">{totalDomainMembers}</span> Officers
                    </div>
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-center">
                      <span className="font-bold text-slate-900">{totalDomainTasks}</span> Tasks
                    </div>
                  </div>
                </div>

                {/* Search Bar for Domains */}
                <div className="relative max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={domainsSearch}
                    onChange={(e) => setDomainsSearch(e.target.value)}
                    placeholder="Search core domains by name, code, or function..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600"
                  />
                  {domainsSearch && (
                    <button
                      onClick={() => setDomainsSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Core Domains */}
              <div className="p-6">
                {filteredDomains.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-mono">
                    No core domains match "{domainsSearch}".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDomains.map((org: any) => (
                      <Link
                        key={org.id}
                        to={`/orgs/${org.id}`}
                        className="bg-white border border-slate-200 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 rounded-xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between space-y-3 block text-left no-underline"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded font-medium bg-purple-50 border border-purple-200 text-purple-700">
                              Core Domain
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-semibold">{org.code}</span>
                          </div>

                          <h4 className="text-base font-bold font-heading text-slate-900 group-hover:text-purple-600 transition-colors flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-slate-500 group-hover:text-purple-600" />
                            <span>{org.name}</span>
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {org.description || 'DSA operational domain for central coordination and governance.'}
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{org._count?.memberships || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                              <span>{org._count?.tasks || 0} tasks</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 text-slate-700 group-hover:text-purple-600 font-semibold text-[11px] transition-colors">
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WINDOW 3: DUAL SPLIT-WINDOW MODE */}
          {activeWindow === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Window Pane: Cultural Clubs */}
              <div className="bg-white border-t-4 border-t-blue-500 border-x border-b border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold font-heading text-slate-900">
                      Cultural Clubs Window ({filteredClubs.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setWindow('clubs')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Maximize Window ↗
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={clubsSearch}
                    onChange={(e) => setClubsSearch(e.target.value)}
                    placeholder="Search clubs..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredClubs.map((org: any) => (
                    <Link
                      key={org.id}
                      to={`/orgs/${org.id}`}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg flex items-center justify-between transition-all group block text-left"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                            {org.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{org.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 font-mono">
                          {org._count?.memberships || 0} members • {org._count?.tasks || 0} tasks
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right Window Pane: Core Domains */}
              <div className="bg-white border-t-4 border-t-purple-500 border-x border-b border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <h3 className="text-base font-bold font-heading text-slate-900">
                      Core Domains Window ({filteredDomains.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setWindow('domains')}
                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  >
                    Maximize Window ↗
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={domainsSearch}
                    onChange={(e) => setDomainsSearch(e.target.value)}
                    placeholder="Search core domains..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredDomains.map((org: any) => (
                    <Link
                      key={org.id}
                      to={`/orgs/${org.id}`}
                      className="p-3 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-lg flex items-center justify-between transition-all group block text-left"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                            {org.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{org.code}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 font-mono">
                          {org._count?.memberships || 0} officers • {org._count?.tasks || 0} tasks
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
