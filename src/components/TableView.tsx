'use client';

import React from 'react';
import { Lead } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface TableViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
}

export default function TableView({ leads, onEditLead }: TableViewProps) {
  const getBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Nuevo': return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Contactado': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'Seguimiento': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'En Reunión': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Cotizado': return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
      case 'Cerrado Ganado': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="bg-[#0c1527] border border-[#1a2744] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#131f38] text-slate-400 text-xs uppercase tracking-wider border-b border-[#1a2744]">
            <tr>
              <th className="py-4 px-6 font-semibold">Empresa</th>
              <th className="py-4 px-6 font-semibold">Tomador de Decisión</th>
              <th className="py-4 px-6 font-semibold">Cargo</th>
              <th className="py-4 px-6 font-semibold">Contacto</th>
              <th className="py-4 px-6 font-semibold">Monto CLP</th>
              <th className="py-4 px-6 font-semibold">Estado</th>
              <th className="py-4 px-6 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2744] text-slate-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No hay prospectos registrados aún. Ve a "Prospector IA" para descubrir nuevos.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#101b33] transition">
                  <td className="py-3.5 px-6 font-bold text-white">
                    <div>{lead.empresa}</div>
                    {lead.url && (
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline inline-flex items-center gap-1 font-normal"
                      >
                        <span>{lead.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="py-3.5 px-6">{lead.decisor}</td>
                  <td className="py-3.5 px-6 text-slate-400 text-xs">{lead.cargo}</td>
                  <td className="py-3.5 px-6 text-xs">
                    <div>{lead.email}</div>
                    {lead.telefono && <div className="text-slate-400">{lead.telefono}</div>}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-emerald-400">
                    {lead.monto_clp ? `$${lead.monto_clp.toLocaleString('es-CL')} CLP` : '-'}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeClass(lead.estado)}`}>
                      {lead.estado}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => onEditLead(lead)}
                      className="px-3 py-1.5 rounded-lg bg-[#162238] hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-semibold border border-[#233458] transition"
                    >
                      Editar Ficha
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
