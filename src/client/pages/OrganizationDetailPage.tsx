import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, GLOBAL_SUPERUSER_SCOPE } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import {
  Building2,
  Users,
  CheckSquare,
  Calendar,
  ArrowLeft,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  GripVertical,
  ShieldCheck,
  Check,
  Tag,
  Mail,
  GraduationCap,
  MessageSquare,
  FileText,
  Send,
  MapPin,
  Search,
} from 'lucide-react';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED'];

export const OrganizationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { activeMembership, setActiveMembership, isSuperUser, isGlobalAdminScope } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'TASKS' | 'MEMBERS' | 'EVENTS' | 'LOGS'>('TASKS');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');

  // Logs & Discussions state
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [logType, setLogType] = useState<'EVENT' | 'MEETING'>('EVENT');
  const [logTitle, setLogTitle] = useState('');
  const [logSummary, setLogSummary] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 16));
  const [logLocation, setLogLocation] = useState('');
  const [logAttendees, setLogAttendees] = useState('');
  const [logKeyDecisions, setLogKeyDecisions] = useState('');
  const [logEventId, setLogEventId] = useState('');
  const [logsFilter, setLogsFilter] = useState<'ALL' | 'EVENT' | 'MEETING'>('ALL');
  const [logsSearch, setLogsSearch] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Fetch organization details
  const {
    data: org,
    isLoading: isOrgLoading,
    error: orgError,
  } = useQuery({
    queryKey: ['org', id],
    queryFn: () => fetchApi(`/api/orgs/${id}`),
    enabled: !!id,
  });

  // Fetch organization tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', { orgId: id }],
    queryFn: () => fetchApi(`/api/tasks?orgId=${id}`),
    enabled: !!id,
  });

  // Fetch organization-specific logs & discussions
  const { data: rawOrgLogs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['logs', { orgId: id }],
    queryFn: () => fetchApi(`/api/logs?organizationId=${id}`),
    enabled: !!id,
  });

  const orgLogs = Array.isArray(rawOrgLogs) ? rawOrgLogs : [];

  // Create Log Mutation scoped to this organization
  const createLogMutation = useMutation({
    mutationFn: async (newLog: any) => {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({
          ...newLog,
          organizationId: id,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create log');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs', { orgId: id }] });
      setShowNewLogModal(false);
      setLogTitle('');
      setLogSummary('');
      setLogLocation('');
      setLogAttendees('');
      setLogKeyDecisions('');
      setLogEventId('');
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ logId, content }: { logId: string; content: string }) => {
      const res = await fetch(`/api/logs/${logId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      return res.json();
    },
    onSuccess: (_, { logId }) => {
      queryClient.invalidateQueries({ queryKey: ['logs', { orgId: id }] });
      setCommentInputs((prev) => ({ ...prev, [logId]: '' }));
    },
  });

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTitle.trim() || !logSummary.trim()) return;

    createLogMutation.mutate({
      type: logType,
      title: logTitle.trim(),
      summary: logSummary.trim(),
      date: logDate,
      location: logLocation.trim() || undefined,
      attendees: logAttendees.trim() || undefined,
      keyDecisions: logKeyDecisions.trim() || undefined,
      eventId: logEventId || undefined,
    });
  };

  const handlePostComment = (logId: string) => {
    const text = (commentInputs[logId] || '').trim();
    if (!text) return;
    addCommentMutation.mutate({ logId, content: text });
  };

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: any) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { orgId: id }] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['org', id] });
      setShowNewTaskModal(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('MEDIUM');
      setTaskAssigneeId('');
    },
  });

  // Update Task Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', { orgId: id }] });
      const previousTasks = queryClient.getQueryData(['tasks', { orgId: id }]);
      queryClient.setQueryData(['tasks', { orgId: id }], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((t: any) => (t.id === taskId ? { ...t, status } : t));
      });
      return { previousTasks };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', { orgId: id }], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { orgId: id }] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['org', id] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskTitle.trim()) return;
    createTaskMutation.mutate({
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      priority: taskPriority,
      organizationId: id,
      assigneeId: taskAssigneeId || undefined,
      status: 'TODO',
    });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colStatus: string) => {
    if (dragOverColumn === colStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const droppedTaskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    setDragOverColumn(null);
    setDraggingTaskId(null);

    if (!droppedTaskId) return;
    const task = tasks.find((t: any) => t.id === droppedTaskId);
    if (task && task.status !== targetStatus) {
      updateStatusMutation.mutate({ taskId: droppedTaskId, status: targetStatus });
    }
  };

  const isCurrentActiveScope = activeMembership?.orgId === id;

  const handleSetScope = () => {
    if (!org) return;
    setActiveMembership({
      orgId: org.id,
      orgName: org.name,
      orgCode: org.code,
      orgType: org.type,
      role: activeMembership?.role || 'MEMBER',
    });
  };

  if (isOrgLoading) {
    return (
      <div className="py-16 text-center text-sm text-slate-500 font-mono">
        Loading organization workspace...
      </div>
    );
  }

  if (orgError || !org) {
    return (
      <div className="space-y-4">
        <Link
          to="/orgs"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizations</span>
        </Link>
        <div className="bg-white border border-rose-200 rounded-xl p-6 text-center text-rose-600 text-sm font-semibold">
          Organization not found or failed to load.
        </div>
      </div>
    );
  }

  const members = org.memberships || [];
  const events = org.leadEvents || [];
  const completedTasksCount = tasks.filter((t: any) => t.status === 'COMPLETED').length;

  const filteredLogs = orgLogs.filter((log: any) => {
    if (logsFilter !== 'ALL' && log.type !== logsFilter) return false;
    if (logsSearch.trim()) {
      const query = logsSearch.toLowerCase();
      const matchTitle = log.title?.toLowerCase().includes(query);
      const matchSummary = log.summary?.toLowerCase().includes(query);
      const matchLocation = log.location?.toLowerCase().includes(query);
      const matchDecisions = log.keyDecisions?.toLowerCase().includes(query);
      if (!matchTitle && !matchSummary && !matchLocation && !matchDecisions) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Back link & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/orgs"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Workspaces</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {isGlobalAdminScope ? (
            <>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>👑 Global Omni-Scope Active</span>
              </div>
              <button
                onClick={handleSetScope}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors shadow-xs"
                title="Switch from Global Scope to this organization's local scope"
              >
                <span>Switch to Local Scope</span>
              </button>
            </>
          ) : isCurrentActiveScope ? (
            <>
              <div className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>Current Active Scope</span>
              </div>
              {isSuperUser && (
                <button
                  onClick={() => setActiveMembership(GLOBAL_SUPERUSER_SCOPE)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                  title="Switch back to Directorate Global Scope"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>👑 Back to Global Omni-Scope</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleSetScope}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors shadow-xs"
              title="Set this organization as your active working scope"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Set as Active Scope</span>
            </button>
          )}

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>

          <button
            onClick={() => setShowNewLogModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Record Log / Minutes</span>
          </button>
        </div>
      </div>

      {/* Organization Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded font-semibold ${
                  org.type === 'CLUB'
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'bg-purple-50 border border-purple-200 text-purple-700'
                }`}
              >
                {org.type === 'CLUB' ? 'Cultural Club' : 'Core Administrative Domain'}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {org.code}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight flex items-center space-x-2.5">
              <Building2 className="w-7 h-7 text-slate-700" />
              <span>{org.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {org.description || 'DSA operational workspace for team coordination, task tracking, and cultural event execution.'}
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 self-start">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center min-w-[85px]">
              <div className="text-lg font-bold text-slate-900">{members.length}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Members</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center min-w-[85px]">
              <div className="text-lg font-bold text-slate-900">{tasks.length}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Tasks</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center min-w-[85px]">
              <div className="text-lg font-bold text-emerald-600">{completedTasksCount}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Done</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center min-w-[85px]">
              <div className="text-lg font-bold text-blue-600">{orgLogs.length}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">Logs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 text-xs font-medium space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`pb-3 transition-colors flex items-center space-x-2 border-b-2 font-semibold shrink-0 ${
            activeTab === 'TASKS'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks Kanban Engine ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`pb-3 transition-colors flex items-center space-x-2 border-b-2 font-semibold shrink-0 ${
            activeTab === 'MEMBERS'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Roster ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`pb-3 transition-colors flex items-center space-x-2 border-b-2 font-semibold shrink-0 ${
            activeTab === 'EVENTS'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Led Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-3 transition-colors flex items-center space-x-2 border-b-2 font-semibold shrink-0 ${
            activeTab === 'LOGS'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Logs & Discussions ({orgLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: TASKS KANBAN */}
      {activeTab === 'TASKS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Drag and drop tasks between columns to update status, or click to view details.</span>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="font-sans font-semibold text-slate-700 hover:text-slate-900 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          {isTasksLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm font-mono">Loading task board...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {TASK_STATUSES.map((status) => {
                const columnTasks = tasks.filter((t: any) => t.status === status);
                const isOver = dragOverColumn === status;

                return (
                  <div
                    key={status}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={(e) => handleDragLeave(e, status)}
                    onDrop={(e) => handleDrop(e, status)}
                    className={`bg-slate-100/70 border rounded-xl p-3 flex flex-col space-y-3 min-h-[460px] transition-all duration-150 ${
                      isOver
                        ? 'border-slate-400 bg-slate-200/60 ring-2 ring-slate-300 ring-offset-1'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-700">
                          {status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Task List */}
                    <div className="flex-1 space-y-2.5 overflow-y-auto">
                      {columnTasks.map((task: any) => {
                        const isDragging = draggingTaskId === task.id;

                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white border rounded-lg p-3.5 shadow-xs space-y-2.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150 group ${
                              isDragging
                                ? 'opacity-40 border-dashed border-slate-400 scale-95'
                                : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start space-x-1.5">
                                <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0 mt-0.5" />
                                <span className="text-xs font-bold text-slate-900 leading-snug">
                                  {task.title}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                                  task.priority === 'URGENT'
                                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                    : task.priority === 'HIGH'
                                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                                    : task.priority === 'MEDIUM'
                                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                    : 'bg-slate-50 border border-slate-200 text-slate-600'
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pl-5">
                                {task.description}
                              </p>
                            )}

                            <div className="pl-5 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                              <div className="flex items-center space-x-1 text-slate-600 truncate max-w-[110px]">
                                <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {task.assignee?.fullName || 'Unassigned'}
                                </span>
                              </div>

                              <select
                                value={task.status}
                                onChange={(e) =>
                                  updateStatusMutation.mutate({
                                    taskId: task.id,
                                    status: e.target.value,
                                  })
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-hidden"
                              >
                                {TASK_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s.replace(/_/g, ' ')}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })}

                      {columnTasks.length === 0 && (
                        <div
                          className={`h-28 rounded-lg border border-dashed flex items-center justify-center text-xs transition-colors ${
                            isOver
                              ? 'border-slate-400 bg-white/70 text-slate-700 font-semibold'
                              : 'border-slate-200 text-slate-400'
                          }`}
                        >
                          {isOver ? 'Drop here' : 'No tasks'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBERS */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-mono">
            Roster of active leadership, coordinators, and registered student members in this workspace.
          </div>

          {members.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
              No registered members found for this organization.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((m: any) => (
                <div
                  key={m.id || m.userId}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-bold text-slate-900">
                        {m.user?.fullName || 'DSA Member'}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                        {m.role ? m.role.replace(/_/g, ' ') : 'MEMBER'}
                      </span>
                    </div>

                    {m.user?.email && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{m.user.email}</span>
                      </div>
                    )}

                    {m.user?.studentId && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>ID: {m.user.studentId}</span>
                      </div>
                    )}
                  </div>

                  {m.title && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                      Position: {m.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVENTS */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-mono">
            Cultural festivals, competitions, and domain operations led by this organization.
          </div>

          {events.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 font-mono">
              No events registered under this organization yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev: any) => (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-blue-50 border border-blue-200 text-blue-700 uppercase">
                        {ev.category || 'Cultural Event'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{ev.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                      {ev.status}
                    </span>
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono gap-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.startDate ? new Date(ev.startDate).toLocaleDateString() : 'Date TBD'}</span>
                    </div>
                    <div>Venue: {ev.venue || 'Campus Wide'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LOGS & DISCUSSIONS */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setLogsFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  logsFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Logs ({orgLogs.length})
              </button>
              <button
                onClick={() => setLogsFilter('EVENT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  logsFilter === 'EVENT'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                Event Execution ({orgLogs.filter((l: any) => l.type === 'EVENT').length})
              </button>
              <button
                onClick={() => setLogsFilter('MEETING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  logsFilter === 'MEETING'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                Meeting Minutes ({orgLogs.filter((l: any) => l.type === 'MEETING').length})
              </button>
            </div>

            {/* Search Input & Action */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs & notes..."
                  value={logsSearch}
                  onChange={(e) => setLogsSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400 w-44 sm:w-52"
                />
              </div>

              <button
                onClick={() => setShowNewLogModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Log</span>
              </button>
            </div>
          </div>

          {isLogsLoading ? (
            <div className="text-center py-12 text-slate-400 text-sm font-mono">
              Loading logs & discussions for {org.name}...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No logs or discussions found for {org.name}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Record meeting minutes, event execution logs, and team decisions here. Members can discuss and post comments asynchronously.
              </p>
              <button
                onClick={() => setShowNewLogModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Log for {org.name}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log: any) => {
                const comments = log.comments || [];
                return (
                  <div
                    key={log.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
                  >
                    {/* Log Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              log.type === 'EVENT'
                                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                : 'bg-purple-50 border border-purple-200 text-purple-700'
                            }`}
                          >
                            {log.type === 'EVENT' ? 'Event Execution Log' : 'Meeting Minutes'}
                          </span>

                          {log.event && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                              Event: {log.event.title}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900">{log.title}</h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono self-start sm:self-auto">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(log.date).toLocaleString()}</span>
                        </div>
                        {log.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{log.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary / Minutes Content */}
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {log.summary}
                    </div>

                    {/* Key Decisions / Action Items */}
                    {log.keyDecisions && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Key Decisions & Action Items</span>
                        </div>
                        <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-line pl-5">
                          {log.keyDecisions}
                        </p>
                      </div>
                    )}

                    {/* Attendees */}
                    {log.attendees && (
                      <div className="flex items-start space-x-2 text-xs text-slate-500 font-mono">
                        <Users className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">
                          <strong className="text-slate-700">Attendees:</strong> {log.attendees}
                        </span>
                      </div>
                    )}

                    {/* Author Footer */}
                    <div className="text-[11px] text-slate-400 font-mono pt-1">
                      Logged by{' '}
                      <span className="text-slate-600 font-medium">
                        {log.author?.fullName || log.author?.email || 'DSA Member'}
                      </span>
                    </div>

                    {/* Discussion & Comment Thread */}
                    <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-xl">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          <span>Discussion Thread ({comments.length})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Scoped to {org.name}
                        </span>
                      </div>

                      {/* Comments list */}
                      {comments.length > 0 && (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {comments.map((c: any) => (
                            <div
                              key={c.id}
                              className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs space-y-1 shadow-2xs"
                            >
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span className="font-bold text-slate-800">
                                  {c.author?.fullName || c.author?.email || 'DSA Member'}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {new Date(c.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment input box */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder={`Add a comment or discussion note on this log for ${org.name}...`}
                          value={commentInputs[log.id] || ''}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({ ...prev, [log.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handlePostComment(log.id);
                            }
                          }}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                        />
                        <button
                          onClick={() => handlePostComment(log.id)}
                          disabled={addCommentMutation.isPending || !(commentInputs[log.id] || '').trim()}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow-xs transition-colors shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Post</span>
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

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">
                New Task for {org.name}
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Coordinate stage lighting with Electrical Dept"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide scope of work and dependencies..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m: any) => (
                      <option key={m.user?.id || m.userId} value={m.user?.id || m.userId}>
                        {m.user?.fullName || m.user?.email || 'Member'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending || !taskTitle.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Log / Minutes Modal */}
      {showNewLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">
                  Record Log / Minutes
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Organization: {org.name} ({org.code})
                </p>
              </div>
              <button
                onClick={() => setShowNewLogModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLogType('EVENT')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    logType === 'EVENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Event Execution Log</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogType('MEETING')}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    logType === 'MEETING'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Meeting Minutes</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Topic *
                </label>
                <input
                  type="text"
                  required
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  placeholder={
                    logType === 'EVENT'
                      ? 'e.g., Battle of the Bands - Stage 1 Soundcheck & Run-through'
                      : 'e.g., Core Committee Weekly Sync on Logistics & Budget'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    value={logLocation}
                    onChange={(e) => setLogLocation(e.target.value)}
                    placeholder="e.g., Mini Hall 1 / Tech Park 4th Floor"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  />
                </div>
              </div>

              {events.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Associate with Event (Optional)
                  </label>
                  <select
                    value={logEventId}
                    onChange={(e) => setLogEventId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                  >
                    <option value="">None (General Organization Log)</option>
                    {events.map((ev: any) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendees / Present Members
                </label>
                <input
                  type="text"
                  value={logAttendees}
                  onChange={(e) => setLogAttendees(e.target.value)}
                  placeholder="e.g., President, Tech Lead, Secretary, 12 Domain Volunteers"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Summary & Discussion Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={logSummary}
                  onChange={(e) => setLogSummary(e.target.value)}
                  placeholder="Summarize what was accomplished, issues observed, or topics debated..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Decisions & Action Items
                </label>
                <textarea
                  rows={2}
                  value={logKeyDecisions}
                  onChange={(e) => setLogKeyDecisions(e.target.value)}
                  placeholder="1. Approvals confirmed for PA system; 2. Roster deadline Friday."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewLogModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLogMutation.isPending || !logTitle.trim() || !logSummary.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  {createLogMutation.isPending ? 'Saving Log...' : 'Save Log to Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
