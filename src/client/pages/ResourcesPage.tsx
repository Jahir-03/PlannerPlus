import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
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
        <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Operations & Resource Inventory
        </h2>
        <p className="text-xs text-slate-500 font-mono">
          Conflict-free reservation system for Venues, Sound Systems, Cameras, and Furniture
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-12 text-center">Loading inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res: any) => (
            <div key={res.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                  {res.category}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-900">
                  Qty: {res.totalQuantity}
                </span>
              </div>

              <h3 className="text-base font-bold font-heading text-slate-900 flex items-center space-x-2">
                <Package className="w-4 h-4 text-slate-500" />
                <span>{res.name}</span>
              </h3>

              <div className="text-xs text-slate-500 font-mono">
                Managed by: {res.organization?.name || 'Operations Domain'}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active Reservations ({res.reservations?.length || 0}):
                </div>
                {res.reservations && res.reservations.length > 0 ? (
                  res.reservations.map((r: any) => (
                    <div key={r.id} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center font-mono">
                      <span className="text-slate-800 font-medium">{r.event?.title || 'Event'}</span>
                      <span className="text-emerald-700 font-bold">{r.quantity}x Reserved</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-400 font-mono">No active reservations. 100% Available.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
