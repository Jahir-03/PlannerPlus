import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Plus, AlertCircle, Clock, CheckCircle2, User, GripVertical } from 'lucide-react';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED'];

export const TasksPage: React.FC = () => {
  const { activeMembership, isGlobalAdminScope } = useAuth();
  const queryClient = useQueryClient();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [targetOrgId, setTargetOrgId] = useState('');

  const { data: orgs = [] } = useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const res = await fetch('/api/orgs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowNewTaskModal(false);
      setTitle('');
      setDescription('');
    },
  });

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
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((t: any) => (t.id === taskId ? { ...t, status } : t));
      });
      return { previousTasks };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const finalOrgId = isGlobalAdminScope
      ? targetOrgId || (orgs.length > 0 ? orgs[0].id : '')
      : activeMembership?.orgId;
    if (!finalOrgId) return;

    createTaskMutation.mutate({
      title,
      description,
      priority,
      organizationId: finalOrgId,
      status: 'TODO',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Enterprise Task Engine
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {isGlobalAdminScope ? (
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <span>👑 Directorate Omni-Scope: Inspecting and managing tasks across all 33 organizations</span>
              </span>
            ) : (
              `Drag and drop tasks between columns or use quick transition controls for ${activeMembership?.orgName || 'DSA Organizations'}`
            )}
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => {
          const statusTasks = tasks.filter((t: any) => t.status === status);
          const isOver = dragOverColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverColumn !== status) {
                  setDragOverColumn(status);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
                if (taskId) {
                  updateStatusMutation.mutate({ taskId, status });
                }
                setDraggingTaskId(null);
                setDragOverColumn(null);
              }}
              className={`rounded-xl p-3 space-y-3 min-w-[240px] transition-all ${
                isOver
                  ? 'bg-slate-200/90 border-2 border-dashed border-slate-400 ring-2 ring-slate-400/20'
                  : 'bg-slate-100/90 border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200">
                <span className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">
                  {status.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                  {statusTasks.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {statusTasks.map((t: any) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', t.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggingTaskId(t.id);
                    }}
                    onDragEnd={() => {
                      setDraggingTaskId(null);
                      setDragOverColumn(null);
                    }}
                    className={`p-3 bg-white border rounded-lg space-y-2 hover:border-slate-300 shadow-xs transition-all text-xs cursor-grab active:cursor-grabbing select-none ${
                      draggingTaskId === t.id
                        ? 'opacity-40 border-dashed border-slate-400 scale-[0.98]'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors" />
                        <span
                          className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                            t.priority === 'URGENT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {t.organization?.code}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900">{t.title}</h4>
                    {t.description && <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-[10px] text-slate-600">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{t.assignee?.fullName || 'Unassigned'}</span>
                      </div>

                      {/* Status Transition Select */}
                      <select
                        value={t.status}
                        onChange={(e) => updateStatusMutation.mutate({ taskId: t.id, status: e.target.value })}
                        className="bg-slate-50 text-[10px] text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none font-medium cursor-pointer"
                      >
                        {TASK_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {statusTasks.length === 0 && (
                  <div
                    className={`p-4 rounded-lg border border-dashed text-center text-[11px] font-mono transition-colors ${
                      isOver
                        ? 'border-slate-400 bg-white/70 text-slate-700 font-medium'
                        : 'border-slate-300/60 text-slate-400'
                    }`}
                  >
                    Drop task here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h3 className="text-lg font-bold font-heading text-slate-900">Create Operational Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              {isGlobalAdminScope && (
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Target Organization Workspace *
                  </label>
                  <select
                    value={targetOrgId || (orgs.length > 0 ? orgs[0].id : '')}
                    onChange={(e) => setTargetOrgId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-hidden focus:border-slate-900 font-semibold"
                  >
                    {orgs.map((o: any) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sound Stage Setup"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details and instructions..."
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {createTaskMutation.isPending ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
