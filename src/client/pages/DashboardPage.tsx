import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../utils/api';
import { Building2, CheckSquare, Calendar, FileCheck, Shield, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, activeMembership, isGlobalAdminScope } = useAuth();

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {isGlobalAdminScope ? (
                <strong className="text-emerald-700 font-bold">
                  👑 Active Scope: Directorate Omni-Scope (All Roles & Full Access)
                </strong>
              ) : (
                `Active Scope: ${activeMembership?.orgName || 'DSA System'} (${activeMembership?.role ? activeMembership.role.replace(/_/g, ' ') : 'MEMBER'})`
              )}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Welcome, {user?.fullName || 'DSA Delegate'}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            DSA Operations Platform for managing <strong>20 Cultural Clubs</strong>, <strong>13 Core Administrative Domains</strong>, multi-stage approval workflows, and cross-functional event taskforces.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/orgs"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1.5 hover:border-slate-400 hover:shadow-sm transition-all block text-left group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">Organizations</span>
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{orgs.length} Units</div>
          <div className="text-xs text-slate-500 font-mono">
            {clubs.length} Clubs • {domains.length} Domains
          </div>
        </Link>

        <Link
          to="/tasks"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1.5 hover:border-slate-400 hover:shadow-sm transition-all block text-left group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">Active Tasks</span>
            <CheckSquare className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{tasks.length} Assigned</div>
          <div className="text-xs text-slate-500 font-mono">
            {tasks.filter((t: any) => t.status === 'IN_PROGRESS').length} In Progress
          </div>
        </Link>

        <Link
          to="/events"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1.5 hover:border-slate-400 hover:shadow-sm transition-all block text-left group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">Event Projects</span>
            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{events.length} Projects</div>
          <div className="text-xs text-slate-500 font-mono">
            {events.filter((e: any) => e.status === 'APPROVED' || e.status === 'PREPARATION').length} Approved/Active
          </div>
        </Link>

        <Link
          to="/approvals"
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1.5 hover:border-slate-400 hover:shadow-sm transition-all block text-left group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">Pending Approvals</span>
            <FileCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{approvals.length} Workflows</div>
          <div className="text-xs text-slate-500 font-mono">
            {approvals.filter((a: any) => a.status === 'PENDING').length} Action Required
          </div>
        </Link>
      </div>

      {/* Grid Layout: Active Memberships & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Your Organizational Memberships */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Your Workspaces</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Click to view tasks</span>
          </div>

          <div className="space-y-2.5">
            {!user?.memberships || user.memberships.length === 0 ? (
              <div className="text-xs text-slate-500 p-2">No active organizational memberships.</div>
            ) : (
              user.memberships.map((m) => (
                <Link
                  key={m.orgId}
                  to={`/orgs/${m.orgId}`}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-between transition-all group block text-left"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-1.5">
                      <span>{m.orgName}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-600" />
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {m.orgType === 'CLUB' ? 'Cultural Club' : 'Core Administrative Domain'}
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-medium">
                    {m.role ? m.role.replace(/_/g, ' ') : 'MEMBER'}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Major Event Projects */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold font-heading text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span>Active DSA Event Projects</span>
          </h3>

          <div className="space-y-2.5">
            {events.length === 0 ? (
              <div className="text-xs text-slate-500 p-4 text-center">No active event projects found.</div>
            ) : (
              events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ev.title}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Lead Org: {ev.leadOrganization?.name || 'DSA'} • Venue: {ev.venue}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 text-xs font-mono font-medium">
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
