import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, MapPin, Clock, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';

const EVENT_STAGES = [
  'DRAFT',
  'PLANNING',
  'PENDING_APPROVAL',
  'APPROVED',
  'PREPARATION',
  'EXECUTION',
  'COMPLETED',
];

export const EventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('TP Ganesan Main Auditorium');
  const [startDate, setStartDate] = useState('2026-02-19T09:00');
  const [endDate, setEndDate] = useState('2026-02-19T22:00');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const res = await fetch('/api/orgs', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  const [leadOrgId, setLeadOrgId] = useState('');

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: any) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}`,
        },
        body: JSON.stringify(newEvent),
      });
      if (!res.ok) throw new Error('Failed to propose event project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setShowNewEventModal(false);
      setTitle('');
      setDescription('');
    },
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLeadOrg = leadOrgId || (orgs.length > 0 ? orgs[0].id : '');
    createEventMutation.mutate({
      title,
      description,
      venue,
      startDate,
      endDate,
      leadOrganizationId: targetLeadOrg,
      expectedParticipants: 2500,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading gold-gradient-text">
            Event Project Operations
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Lifecycle management from Proposal $\rightarrow$ Approval $\rightarrow$ Execution $\rightarrow$ Post-Event Review
          </p>
        </div>

        <button
          onClick={() => setShowNewEventModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-2 transition-all shadow-md shadow-amber-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Event Project</span>
        </button>
      </div>

      {/* Event Cards Grid */}
      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading event projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((ev: any) => (
            <div key={ev.id} className="glass-panel p-6 space-y-4 relative border-amber-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Lead: {ev.leadOrganization?.name}
                  </span>
                  <h3 className="text-xl font-bold font-heading text-slate-100 mt-2">{ev.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-amber-400">
                  {ev.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ev.venue}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{new Date(ev.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Lifecycle Stage Progress</span>
                  <span className="text-amber-300 font-semibold">{ev.status}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                  {EVENT_STAGES.map((st, idx) => {
                    const currentIdx = EVENT_STAGES.indexOf(ev.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div
                        key={st}
                        className={`flex-1 border-r border-slate-950 ${
                          isPassed ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-slate-900'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Event Modal */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 w-full max-w-lg border-amber-500/30 space-y-4">
            <h3 className="text-lg font-bold font-heading gold-gradient-text">Propose New Event Project</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Battle of the Wizard Rock Bands"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Lead Organization</label>
                <select
                  value={leadOrgId}
                  onChange={(e) => setLeadOrgId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {orgs.map((o: any) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Venue & Location</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Event Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive event plan details..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-3 py-2 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {createEventMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
