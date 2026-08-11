import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileCheck, CheckCircle2, XCircle, Clock, ShieldCheck, User } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const res = await fetch('/api/approvals', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  const stepActionMutation = useMutation({
    mutationFn: async ({ stepId, action }: { stepId: string; action: 'APPROVE' | 'REJECT' }) => {
      const res = await fetch(`/api/approvals/steps/${stepId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify({ action, comments: `Processed by active authority.` }),
      });
      if (!res.ok) throw new Error('Failed to process approval step');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading gold-gradient-text">
          Multi-Stage Approval Workflows
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Immutable approval logging for Event Proposals, Budget Allocations, and Resource Bookings
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading workflows...</div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf: any) => (
            <div key={wf.id} className="glass-panel p-6 border-amber-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {wf.requestType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Requester: {wf.requesterName}</span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-100 mt-1">{wf.title}</h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold self-start sm:self-auto ${
                    wf.status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : wf.status === 'REJECTED'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {wf.status}
                </span>
              </div>

              {/* Sequenced Steps */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Required Approval Chain:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wf.steps?.map((step: any) => (
                    <div
                      key={step.id}
                      className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 font-mono text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                            {step.stepOrder}
                          </span>
                          <span className="font-bold">{step.roleTarget.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Approver: {step.approver?.fullName || 'Awaiting Action'}
                        </div>
                      </div>

                      {step.status === 'PENDING' ? (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => stepActionMutation.mutate({ stepId: step.id, action: 'APPROVE' })}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => stepActionMutation.mutate({ stepId: step.id, action: 'REJECT' })}
                            className="px-2 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 text-[11px]"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            step.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {step.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
