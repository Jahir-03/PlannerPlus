import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Plus, AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'COMPLETED'];

export const TasksPage: React.FC = () => {
  const { activeMembership } = useAuth();
  const queryClient = useQueryClient();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMembership) return;
    createTaskMutation.mutate({
      title,
      description,
      priority,
      organizationId: activeMembership.orgId,
      status: 'TODO',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading gold-gradient-text">
            Enterprise Task Engine
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Kanban workflow management for {activeMembership?.orgName || 'DSA Organizations'}
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 transition-all shadow-md shadow-amber-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => {
          const statusTasks = tasks.filter((t: any) => t.status === status);

          return (
            <div key={status} className="bg-slate-950/80 border border-amber-500/20 rounded-xl p-3 space-y-3 min-w-[240px]">
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                  {status.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400">
                  {statusTasks.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {statusTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2 hover:border-amber-500/40 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          t.priority === 'URGENT'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {t.organization?.code}
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-200">{t.title}</h4>
                    {t.description && <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>}

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{t.assignee?.fullName || 'Unassigned'}</span>
                      </div>

                      {/* Status Transition Select */}
                      <select
                        value={t.status}
                        onChange={(e) => updateStatusMutation.mutate({ taskId: t.id, status: e.target.value })}
                        className="bg-slate-950 text-[10px] text-amber-300 border border-slate-700 rounded px-1 py-0.5 focus:outline-none"
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
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 w-full max-w-md border-amber-500/30 space-y-4">
            <h3 className="text-lg font-bold font-heading gold-gradient-text">Create Operational Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sound Stage Setup"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task details and instructions..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
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
                  className="px-3 py-2 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
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
