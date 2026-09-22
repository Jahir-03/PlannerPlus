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
        <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Multi-Stage Approval Workflows
        </h2>
        <p className="text-xs text-slate-500 font-mono">
          Immutable approval logging for Event Proposals, Budget Allocations, and Resource Bookings
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading workflows...</div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf: any) => (
            <div key={wf.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {wf.requestType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Requester: {wf.requesterName}</span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-slate-900 mt-1">{wf.title}</h3>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-medium self-start sm:self-auto ${
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

              {/* Sequenced Steps */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Required Approval Chain:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wf.steps?.map((step: any) => (
                    <div
                      key={step.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 font-mono text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-bold">
                            {step.stepOrder}
                          </span>
                          <span className="font-semibold text-slate-900">{step.roleTarget.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Approver: {step.approver?.fullName || 'Awaiting Action'}
                        </div>
                      </div>

                      {step.status === 'PENDING' ? (
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => stepActionMutation.mutate({ stepId: step.id, action: 'APPROVE' })}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] flex items-center space-x-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => stepActionMutation.mutate({ stepId: step.id, action: 'REJECT' })}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[11px] font-mono font-medium ${
                            step.status === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'
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
