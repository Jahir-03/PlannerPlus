import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Building2,
  FileText,
  Activity,
  UserPlus,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Trash2,
  ExternalLink,
  KeyRound,
  Pencil,
  Calendar,
  CheckSquare,
  Package,
  FileCheck,
  Check,
  Clock,
  MapPin,
  Sparkles,
  Shield,
  AlertCircle,
} from 'lucide-react';

const AVAILABLE_ROLES = [
  { value: 'DIRECTOR', label: 'Director (Rank 100)' },
  { value: 'DY_DIRECTOR', label: 'Deputy Director (Rank 95)' },
  { value: 'ADMIN_STAFF', label: 'Admin Staff (Rank 90)' },
  { value: 'CULTURAL_SECRETARY', label: 'Cultural Secretary (Rank 85)' },
  { value: 'CLUB_SECRETARY', label: 'Club Secretary (Rank 75)' },
  { value: 'DOMAIN_SECRETARY', label: 'Domain Secretary (Rank 75)' },
  { value: 'CLUB_CONVENOR', label: 'Club Convenor (Rank 60)' },
  { value: 'DOMAIN_CONVENOR', label: 'Domain Convenor (Rank 60)' },
  { value: 'COMMITTEE_HEAD', label: 'Committee Head (Rank 50)' },
  { value: 'COMMITTEE_MEMBER', label: 'Committee Member (Rank 30)' },
  { value: 'CLUB_MEMBER', label: 'Club Member (Rank 30)' },
  { value: 'VOLUNTEER', label: 'Volunteer (Rank 10)' },
];

const EVENT_STATUS_OPTIONS = [
  'DRAFT',
  'PLANNING',
  'PENDING_APPROVAL',
  'APPROVED',
  'PREPARATION',
  'EXECUTION',
  'COMPLETED',
  'CANCELLED',
];

const TASK_STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED'];

export const AdminPage: React.FC = () => {
  const { user, activeMembership, setActiveMembership } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    'USERS' | 'ORGS' | 'EVENTS' | 'APPROVALS' | 'TASKS' | 'RESOURCES' | 'LOGS'
  >('USERS');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgFilterType, setOrgFilterType] = useState<'ALL' | 'CLUB' | 'CORE_DOMAIN'>('ALL');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // Modals state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [showCreateResourceModal, setShowCreateResourceModal] = useState(false);

  // Selected entities for actions
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [orgToDelete, setOrgToDelete] = useState<any | null>(null);
  const [orgToEdit, setOrgToEdit] = useState<any | null>(null);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);

  // Form states
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserStudentId, setNewUserStudentId] = useState('');
  const [newUserOrgId, setNewUserOrgId] = useState('');
  const [newUserRole, setNewUserRole] = useState('CLUB_MEMBER');

  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [assignOrgId, setAssignOrgId] = useState('');
  const [assignRole, setAssignRole] = useState('CLUB_MEMBER');

  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCode, setNewOrgCode] = useState('');
  const [newOrgType, setNewOrgType] = useState<'CLUB' | 'CORE_DOMAIN'>('CLUB');
  const [newOrgDesc, setNewOrgDesc] = useState('');

  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgCode, setEditOrgCode] = useState('');
  const [editOrgType, setEditOrgType] = useState<'CLUB' | 'CORE_DOMAIN'>('CLUB');
  const [editOrgDesc, setEditOrgDesc] = useState('');

  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceCategory, setNewResourceCategory] = useState('Venue');
  const [newResourceQty, setNewResourceQty] = useState(1);
  const [newResourceOrgId, setNewResourceOrgId] = useState('');

  // 1. Overall Stats Query
  const { data: stats = {} } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    },
  });

  // 2. Users Query
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  // 3. Organizations Query
  const { data: orgs = [], isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const res = await fetch('/api/orgs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  // 4. Global Events Query
  const { data: adminEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['admin_events'],
    queryFn: async () => {
      const res = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    enabled: activeTab === 'EVENTS',
  });

  // 5. Universal Approvals Query
  const { data: adminApprovals = [], isLoading: isLoadingApprovals } = useQuery({
    queryKey: ['admin_approvals'],
    queryFn: async () => {
      const res = await fetch('/api/admin/approvals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch approvals');
      return res.json();
    },
    enabled: activeTab === 'APPROVALS',
  });

  // 6. Global Tasks Query
  const { data: adminTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['admin_tasks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: activeTab === 'TASKS',
  });

  // 7. Resources & Inventory Query
  const { data: adminResources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ['admin_resources'],
    queryFn: async () => {
      const res = await fetch('/api/admin/resources', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    },
    enabled: activeTab === 'RESOURCES',
  });

  // 8. Audit Logs Query
  const { data: auditLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['admin_audit_logs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
    enabled: activeTab === 'LOGS',
  });

  // === MUTATIONS ===
  const createUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      setShowCreateUserModal(false);
      setNewUserFullName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserStudentId('');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await fetch(`/api/admin/users/${id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      return data;
    },
    onSuccess: () => {
      setShowResetPasswordModal(false);
      setSelectedUserForPassword(null);
      setNewPasswordInput('');
      alert('User password has been successfully reset.');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      setUserToDelete(null);
    },
  });

  const assignMembershipMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign role');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      setShowAssignRoleModal(false);
      setSelectedUserForRole(null);
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create organization');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      setShowCreateOrgModal(false);
      setNewOrgName('');
      setNewOrgCode('');
      setNewOrgDesc('');
    },
  });

  const editOrgMutation = useMutation({
    mutationFn: async ({ id, ...payload }: any) => {
      const res = await fetch(`/api/admin/orgs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update organization');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      setShowEditOrgModal(false);
      setOrgToEdit(null);
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const res = await fetch(`/api/admin/orgs/${orgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete organization');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      setOrgToDelete(null);
    },
  });

  // Event Mutations
  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete event');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEventToDelete(null);
    },
  });

  // Approval Step Override Mutation
  const overrideApprovalStepMutation = useMutation({
    mutationFn: async ({ stepId, status, comments }: { stepId: string; status: string; comments?: string }) => {
      const res = await fetch(`/api/admin/approvals/steps/${stepId}/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ status, comments }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to override step');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });

  // Task Mutations
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete task');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Resource Mutations
  const createResourceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create resource');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_resources'] });
      setShowCreateResourceModal(false);
      setNewResourceName('');
      setNewResourceQty(1);
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete resource');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_resources'] });
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to release reservation');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_resources'] });
    },
  });

  // Filters
  const filteredUsers = users.filter((u: any) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.studentId?.toLowerCase().includes(q)
    );
  });

  const filteredOrgsList = orgs.filter((o: any) => {
    if (orgFilterType !== 'ALL' && o.type !== orgFilterType) return false;
    if (orgSearchQuery.trim()) {
      const q = orgSearchQuery.toLowerCase().trim();
      return (
        o.name?.toLowerCase().includes(q) ||
        o.code?.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredEvents = adminEvents.filter((ev: any) => {
    const q = eventSearchQuery.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(q) ||
      ev.venue?.toLowerCase().includes(q) ||
      ev.leadOrganization?.name?.toLowerCase().includes(q) ||
      ev.status?.toLowerCase().includes(q)
    );
  });

  const filteredTasks = adminTasks.filter((t: any) => {
    const q = taskSearchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q) ||
      t.priority?.toLowerCase().includes(q) ||
      t.organization?.name?.toLowerCase().includes(q) ||
      t.assignee?.fullName?.toLowerCase().includes(q)
    );
  });

  const handleSetScope = (o: any) => {
    setActiveMembership({
      orgId: o.id,
      orgName: o.name,
      orgCode: o.code,
      orgType: o.type,
      role: 'DIRECTOR',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white tracking-wider uppercase">
              Omni-Control Center
            </span>
            <span className="text-xs text-emerald-600 font-semibold font-mono flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Full Authority Mode</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight mt-1 flex items-center space-x-2">
            <ShieldCheck className="w-7 h-7 text-slate-800" />
            <span>Superuser Administrative Console</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Full access to user accounts, organization workspaces, event lifecycle overrides, approvals governance, tasks, and campus resources.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => setShowCreateOrgModal(true)}
            className="bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition-colors border border-slate-300 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Users & Accounts</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalUsers ?? users.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium">
            {stats.activeUsers ?? users.filter((u: any) => u.isActive).length} Active Accounts
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Organizations</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalOrgs ?? orgs.length}</div>
          <div className="text-[11px] text-slate-500 font-mono">20 Clubs / 13 Domains</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Global Operations</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalEvents ?? 0}</div>
          <div className="text-[11px] text-slate-500 font-mono">{stats.totalTasks ?? 0} Total Tasks</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Security State</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">Protected</div>
          <div className="text-[11px] text-slate-500 font-mono">Live Audit Stream</div>
        </div>
      </div>

      {/* Main Console Tabs Switcher */}
      <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'USERS'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Users & Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ORGS')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'ORGS'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Workspaces ({orgs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'EVENTS'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Events Control ({adminEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'APPROVALS'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approvals Override ({adminApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'TASKS'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Global Tasks ({adminTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RESOURCES')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'RESOURCES'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-cyan-600" />
          <span>Campus Resources ({adminResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-3.5 py-1.5 rounded font-medium transition-colors shrink-0 flex items-center space-x-1.5 ${
            activeTab === 'LOGS'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: USERS & ROLES */}
      {activeTab === 'USERS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, email, or NetID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-800"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-mono">
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading user records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Net / Student ID</th>
                    <th className="py-3 px-4">Organization Memberships</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Superuser Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {u.studentId || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {u.memberships && u.memberships.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.memberships.map((m: any) => (
                              <span
                                key={m.id}
                                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-medium"
                              >
                                {m.organization?.name} ({m.role.replace(/_/g, ' ')})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No org scope assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForRole(u);
                              setAssignOrgId(orgs[0]?.id || '');
                              setShowAssignRoleModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                            title="Assign or modify club/domain role"
                          >
                            Role
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUserForPassword(u);
                              setNewPasswordInput('');
                              setShowResetPasswordModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center space-x-1 transition-colors"
                            title="Reset password for this user"
                          >
                            <KeyRound className="w-3 h-3 text-slate-500" />
                            <span>Password</span>
                          </button>

                          <button
                            onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: !u.isActive })}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              u.isActive
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          {u.email !== 'admin@srmist.edu.in' && u.studentId !== 'admin' && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] transition-colors"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORGANIZATIONS & WORKSPACES */}
      {activeTab === 'ORGS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 text-xs self-start">
              <button
                onClick={() => setOrgFilterType('ALL')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  orgFilterType === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({orgs.length})
              </button>
              <button
                onClick={() => setOrgFilterType('CLUB')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  orgFilterType === 'CLUB'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Clubs ({orgs.filter((o: any) => o.type === 'CLUB').length})
              </button>
              <button
                onClick={() => setOrgFilterType('CORE_DOMAIN')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  orgFilterType === 'CORE_DOMAIN'
                    ? 'bg-white text-purple-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Domains ({orgs.filter((o: any) => o.type === 'CORE_DOMAIN').length})
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={orgSearchQuery}
                  onChange={(e) => setOrgSearchQuery(e.target.value)}
                  placeholder="Search by name or code..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <button
                onClick={() => setShowCreateOrgModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition-colors shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Workspace</span>
              </button>
            </div>
          </div>

          {isLoadingOrgs ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading organizations...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrgsList.map((org: any) => {
                const isCurrentScope = activeMembership?.orgId === org.id;

                return (
                  <div
                    key={org.id}
                    className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-colors ${
                      isCurrentScope ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            org.type === 'CLUB'
                              ? 'bg-blue-50 border border-blue-200 text-blue-700'
                              : 'bg-purple-50 border border-purple-200 text-purple-700'
                          }`}
                        >
                          {org.type === 'CLUB' ? 'Cultural Club' : 'Core Domain'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">{org.code}</span>
                      </div>

                      <h3 className="font-bold font-heading text-slate-900 text-base flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span>{org.name}</span>
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {org.description || 'DSA organizational unit for campus operations.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleSetScope(org)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors ${
                            isCurrentScope
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                          title="Set as your active scope to execute tasks/approvals in this workspace"
                        >
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{isCurrentScope ? 'Active Scope' : 'Set Scope'}</span>
                        </button>

                        <Link
                          to={`/orgs/${org.id}`}
                          className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-blue-600 border border-slate-200 font-medium text-[11px] flex items-center space-x-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setOrgToEdit(org);
                            setEditOrgName(org.name);
                            setEditOrgCode(org.code);
                            setEditOrgType(org.type);
                            setEditOrgDesc(org.description || '');
                            setShowEditOrgModal(true);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Edit workspace details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setOrgToDelete(org)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title={`Delete ${org.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVENTS CONTROL & FORCE OVERRIDE */}
      {activeTab === 'EVENTS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                All Campus Events & Force Lifecycle Controls
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Superuser authority to force event status transitions (Approve, Execution, Complete, Cancel) across all 33 organizations.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {isLoadingEvents ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">No events found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Lead Workspace</th>
                    <th className="py-2.5 px-3">Venue & Date</th>
                    <th className="py-2.5 px-3">Tasks</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3 text-right">Force Status Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map((ev: any) => (
                    <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{ev.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{ev.description}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {ev.leadOrganization?.name || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        <div>{ev.venue}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ev.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {ev._count?.tasks ?? 0}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            value={ev.status}
                            onChange={(e) =>
                              updateEventStatusMutation.mutate({ id: ev.id, status: e.target.value })
                            }
                            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] text-slate-800 font-medium focus:outline-hidden"
                          >
                            {EVENT_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                Set {st}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => setEventToDelete(ev)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: APPROVALS OVERRIDE */}
      {activeTab === 'APPROVALS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Universal Approvals Governance & Step Overrides
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Superuser can single-click force approve or reject any committee review step across all events.
            </p>
          </div>

          {isLoadingApprovals ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading approval workflows...</div>
          ) : adminApprovals.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">No approval workflows registered.</div>
          ) : (
            <div className="space-y-4">
              {adminApprovals.map((wf: any) => (
                <div key={wf.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-200 text-slate-800">
                          {wf.requestType}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Requester: {wf.requesterName}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{wf.title}</h4>
                      {wf.event && (
                        <p className="text-xs text-slate-600">
                          Event: <strong>{wf.event.title}</strong> ({wf.event.leadOrganization?.name})
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        wf.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : wf.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {wf.status}
                    </span>
                  </div>

                  {/* Step Breakdown */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-600 uppercase font-mono">Approval Steps</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {wf.steps?.map((st: any) => (
                        <div
                          key={st.id}
                          className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-slate-500 font-bold">
                                Step #{st.stepOrder}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  st.status === 'APPROVED'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : st.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {st.status}
                              </span>
                            </div>
                            <div className="font-bold text-slate-800 mt-1">{st.roleTarget}</div>
                            {st.comments && (
                              <p className="text-[11px] text-slate-500 mt-1 italic font-mono">
                                Note: {st.comments}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() =>
                                overrideApprovalStepMutation.mutate({
                                  stepId: st.id,
                                  status: 'APPROVED',
                                  comments: 'Superuser Override Approved',
                                })
                              }
                              disabled={st.status === 'APPROVED'}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-[10px] transition-colors"
                            >
                              Force Approve
                            </button>
                            <button
                              onClick={() =>
                                overrideApprovalStepMutation.mutate({
                                  stepId: st.id,
                                  status: 'REJECTED',
                                  comments: 'Superuser Override Rejected',
                                })
                              }
                              disabled={st.status === 'REJECTED'}
                              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold text-[10px] transition-colors"
                            >
                              Force Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GLOBAL TASK MANAGEMENT */}
      {activeTab === 'TASKS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                All Institutional Tasks & Deadlines
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Direct oversight and manual state manipulation for any task across all 33 organizations.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                placeholder="Search tasks or assignees..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {isLoadingTasks ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">No tasks matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Task Title</th>
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Assignee</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{t.title}</div>
                        {t.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1">{t.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        {t.organization?.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {t.assignee?.fullName || 'Unassigned'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] font-semibold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            t.priority === 'URGENT'
                              ? 'bg-rose-50 text-rose-700'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            updateTaskStatusMutation.mutate({ id: t.id, status: e.target.value })
                          }
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-[11px] text-slate-800 font-medium focus:outline-hidden"
                        >
                          {TASK_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteTaskMutation.mutate(t.id)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CAMPUS RESOURCES & RESERVATIONS */}
      {activeTab === 'RESOURCES' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Campus Venues, Equipment & Active Reservations
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Superuser can add inventory items, force cancel reservations, or delete obsolete facilities.
              </p>
            </div>

            <button
              onClick={() => {
                setNewResourceOrgId(orgs[0]?.id || '');
                setShowCreateResourceModal(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          </div>

          {isLoadingResources ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading resources...</div>
          ) : adminResources.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">No resources configured.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminResources.map((res: any) => (
                <div
                  key={res.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-slate-100 border border-slate-200 text-slate-700">
                        {res.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        Qty: {res.totalQuantity}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>{res.name}</span>
                    </h4>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Custodian: {res.organization?.name}
                    </div>

                    {/* Active reservations */}
                    {res.reservations && res.reservations.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">
                          Active Reservations ({res.reservations.length})
                        </span>
                        {res.reservations.map((r: any) => (
                          <div
                            key={r.id}
                            className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] flex items-center justify-between gap-1"
                          >
                            <div>
                              <div className="font-semibold text-slate-800">{r.event?.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(r.startTime).toLocaleDateString()}
                              </div>
                            </div>
                            <button
                              onClick={() => cancelReservationMutation.mutate(r.id)}
                              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-medium"
                              title="Force release this reservation"
                            >
                              Release
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => deleteResourceMutation.mutate(res.id)}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Resource</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 font-heading">Immutable System Audit Log</h3>
            <p className="text-xs text-slate-500 font-mono">
              Tamper-resistant audit stream recording all logins, administrative overrides, and system workflows.
            </p>
          </div>

          {isLoadingLogs ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">Loading audit trail...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Entity</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{log.entity}</td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {log.user?.fullName || log.userId || 'System'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: CREATE USER */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Add New System User</h3>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            {createUserMutation.isError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                {(createUserMutation.error as any)?.message}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createUserMutation.mutate({
                  fullName: newUserFullName,
                  email: newUserEmail,
                  password: newUserPassword,
                  studentId: newUserStudentId || undefined,
                  organizationId: newUserOrgId || undefined,
                  role: newUserOrgId ? newUserRole : undefined,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="psharma@srmist.edu.in"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student / Net ID</label>
                <input
                  type="text"
                  value={newUserStudentId}
                  onChange={(e) => setNewUserStudentId(e.target.value)}
                  placeholder="e.g. RA2311003010123"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Org (Optional)</label>
                  <select
                    value={newUserOrgId}
                    onChange={(e) => setNewUserOrgId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                  >
                    <option value="">None (General)</option>
                    {orgs.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded font-semibold shadow-xs"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {showResetPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Reset User Password</h3>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Set a new password for <strong>{selectedUserForPassword.fullName}</strong> ({selectedUserForPassword.email}).
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                resetPasswordMutation.mutate({
                  id: selectedUserForPassword.id,
                  newPassword: newPasswordInput,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending || !newPasswordInput}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded font-semibold shadow-xs"
                >
                  {resetPasswordMutation.isPending ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRM */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold font-heading">Delete User Account</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{userToDelete.fullName}</strong> ({userToDelete.email})? All active sessions and organizational memberships will be terminated.
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN ROLE */}
      {showAssignRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">
                Assign Role to {selectedUserForRole.fullName}
              </h3>
              <button
                onClick={() => setShowAssignRoleModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                assignMembershipMutation.mutate({
                  userId: selectedUserForRole.id,
                  organizationId: assignOrgId,
                  role: assignRole,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Organization *</label>
                <select
                  value={assignOrgId}
                  onChange={(e) => setAssignOrgId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden"
                >
                  {orgs.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Role *</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignRoleModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignMembershipMutation.isPending}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded font-semibold shadow-xs"
                >
                  {assignMembershipMutation.isPending ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE WORKSPACE */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Create New Workspace</h3>
              <button
                onClick={() => setShowCreateOrgModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createOrgMutation.mutate({
                  name: newOrgName,
                  code: newOrgCode,
                  type: newOrgType,
                  description: newOrgDesc,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. SRM Coding Community"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Code / Prefix *</label>
                  <input
                    type="text"
                    required
                    value={newOrgCode}
                    onChange={(e) => setNewOrgCode(e.target.value)}
                    placeholder="e.g. CLUB_SCC"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type *</label>
                  <select
                    value={newOrgType}
                    onChange={(e: any) => setNewOrgType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden"
                  >
                    <option value="CLUB">Cultural Club</option>
                    <option value="CORE_DOMAIN">Core Domain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  placeholder="Mandate and operational scope..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateOrgModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOrgMutation.isPending}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded font-semibold shadow-xs"
                >
                  {createOrgMutation.isPending ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WORKSPACE */}
      {showEditOrgModal && orgToEdit && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Edit Workspace</h3>
              <button
                onClick={() => setShowEditOrgModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editOrgMutation.mutate({
                  id: orgToEdit.id,
                  name: editOrgName,
                  code: editOrgCode,
                  type: editOrgType,
                  description: editOrgDesc,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organization Name *</label>
                <input
                  type="text"
                  required
                  value={editOrgName}
                  onChange={(e) => setEditOrgName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Code / Prefix *</label>
                  <input
                    type="text"
                    required
                    value={editOrgCode}
                    onChange={(e) => setEditOrgCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type *</label>
                  <select
                    value={editOrgType}
                    onChange={(e: any) => setEditOrgType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden"
                  >
                    <option value="CLUB">Cultural Club</option>
                    <option value="CORE_DOMAIN">Core Domain</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editOrgDesc}
                  onChange={(e) => setEditOrgDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditOrgModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editOrgMutation.isPending}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded font-semibold shadow-xs"
                >
                  {editOrgMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ORG CONFIRM */}
      {orgToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold font-heading">Delete Organization</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{orgToDelete.name}</strong> ({orgToDelete.code})? All associated tasks, event dependencies, and team memberships will be dissolved.
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrgToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteOrgMutation.mutate(orgToDelete.id)}
                disabled={deleteOrgMutation.isPending}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                {deleteOrgMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE EVENT CONFIRM */}
      {eventToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold font-heading">Delete Event</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete event <strong>{eventToDelete.title}</strong>? All event tasks and approval workflows will be purged.
            </p>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteEventMutation.mutate(eventToDelete.id)}
                disabled={deleteEventMutation.isPending}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-xs"
              >
                {deleteEventMutation.isPending ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RESOURCE */}
      {showCreateResourceModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Add Campus Resource</h3>
              <button
                onClick={() => setShowCreateResourceModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createResourceMutation.mutate({
                  name: newResourceName,
                  category: newResourceCategory,
                  totalQuantity: newResourceQty,
                  organizationId: newResourceOrgId,
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                  placeholder="e.g. Wireless Microphones (Set of 4)"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={newResourceCategory}
                    onChange={(e) => setNewResourceCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Audio">Audio</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Camera">Camera</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newResourceQty}
                    onChange={(e) => setNewResourceQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Custodian Organization *</label>
                <select
                  value={newResourceOrgId}
                  onChange={(e) => setNewResourceOrgId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-2 text-slate-900 focus:outline-hidden"
                >
                  {orgs.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateResourceModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createResourceMutation.isPending}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded font-semibold shadow-xs"
                >
                  {createResourceMutation.isPending ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
