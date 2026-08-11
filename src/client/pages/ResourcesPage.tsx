import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Calendar, MapPin, ShieldCheck, AlertTriangle } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await fetch('/api/resources', {
        headers: { Authorization: `Bearer ${localStorage.getItem('dsa_access_token')}` },
      });
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading gold-gradient-text">
          Operations & Resource Inventory
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Conflict-free reservation system for Venues, Sound Systems, Cameras, and Furniture
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res: any) => (
            <div key={res.id} className="glass-panel p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {res.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Qty: {res.totalQuantity}
                </span>
              </div>

              <h3 className="text-lg font-bold font-heading text-slate-100 flex items-center space-x-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>{res.name}</span>
              </h3>

              <div className="text-xs text-slate-400 font-mono">
                Managed by: {res.organization?.name || 'Operations Domain'}
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Reservations ({res.reservations?.length || 0}):
                </div>
                {res.reservations && res.reservations.length > 0 ? (
                  res.reservations.map((r: any) => (
                    <div key={r.id} className="p-2 bg-slate-900 rounded text-xs flex justify-between items-center font-mono">
                      <span className="text-amber-300">{r.event?.title || 'Event'}</span>
                      <span className="text-emerald-400 font-bold">{r.quantity}x Reserved</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 font-mono">No active reservations. 100% Available.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
