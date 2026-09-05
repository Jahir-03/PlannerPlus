import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../utils/api';
import { Building2, CheckSquare, Calendar, FileCheck, Shield, Sparkles, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, activeMembership } = useAuth();

  const { data: rawOrgs = [] } = useQuery({
    queryKey: ['orgs'],
    queryFn: () => fetchApi('/api/orgs'),
  });

  const { data: rawTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchApi('/api/tasks'),
  });

  const { data: rawEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => fetchApi('/api/events'),
  });

  const { data: rawApprovals = [] } = useQuery({
    queryKey: ['approvals'],
    queryFn: () => fetchApi('/api/approvals'),
  });

  const orgs = Array.isArray(rawOrgs) ? rawOrgs : [];
  const tasks = Array.isArray(rawTasks) ? rawTasks : [];
  const events = Array.isArray(rawEvents) ? rawEvents : [];
  const approvals = Array.isArray(rawApprovals) ? rawApprovals : [];

  const clubs = orgs.filter((o: any) => o.type === 'CLUB');
  const domains = orgs.filter((o: any) => o.type === 'CORE_DOMAIN');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 border-amber-500/30 relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-400" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Active Role: {activeMembership?.role ? activeMembership.role.replace(/_/g, ' ') : 'MEMBER'}</span>
          </div>
          <h2 className="text-3xl font-bold font-heading gold-gradient-text">
            Welcome, {user?.fullName || 'DSA Delegate'}
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            DSA Operations Platform for managing <strong>20 Cultural Clubs</strong>, <strong>13 Core Administrative Domains</strong>, multi-stage approval workflows, and cross-functional event taskforces.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Organizations</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{orgs.length} Units</div>
          <div className="text-xs text-amber-400/80 font-mono">
            {clubs.length} Clubs • {domains.length} Domains
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
            <CheckSquare className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{tasks.length} Assigned</div>
          <div className="text-xs text-slate-400 font-mono">
            {tasks.filter((t: any) => t.status === 'IN_PROGRESS').length} In Progress
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Event Projects</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{events.length} Projects</div>
          <div className="text-xs text-emerald-400/80 font-mono">
            {events.filter((e: any) => e.status === 'APPROVED' || e.status === 'PREPARATION').length} Approved/Active
          </div>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{approvals.length} Workflows</div>
          <div className="text-xs text-amber-300 font-mono">
            {approvals.filter((a: any) => a.status === 'PENDING').length} Action Required
          </div>
        </div>
      </div>

      {/* Grid Layout: Active Memberships & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Your Organizational Memberships */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-200 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Your Organizational Scope</span>
          </h3>

          <div className="space-y-3">
            {!user?.memberships || user.memberships.length === 0 ? (
              <div className="text-xs text-slate-400 p-2">No active organizational memberships.</div>
            ) : (
              user.memberships.map((m) => (
                <div
                  key={m.orgId}
                  className="p-3 bg-slate-900/80 border border-amber-500/20 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-amber-300">{m.orgName}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {m.orgType === 'CLUB' ? 'Cultural Club' : 'Core Administrative Domain'}
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px]">
                    {m.role ? m.role.replace(/_/g, ' ') : 'MEMBER'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Major Event Projects */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <h3 className="text-base font-bold font-heading text-slate-200 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Active DSA Event Projects</span>
          </h3>

          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-xs text-slate-400 p-4 text-center">No active event projects found.</div>
            ) : (
              events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-4 bg-slate-900/80 border border-amber-500/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{ev.title}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Lead Org: {ev.leadOrganization?.name || 'DSA'} • Venue: {ev.venue}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
