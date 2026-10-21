'use client';

import React from 'react';
import { Lead } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

interface TableViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
}

export default function TableView({ leads, onEditLead }: TableViewProps) {
  return (
    <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#11141D] text-slate-400 uppercase tracking-wider border-b border-white/[0.06] text-[10px]">
            <tr>
              <th className="py-3 px-5 font-semibold">Empresa</th>
              <th className="py-3 px-5 font-semibold">Tomador de Decisión</th>
              <th className="py-3 px-5 font-semibold">Cargo</th>
              <th className="py-3 px-5 font-semibold">Contacto</th>
              <th className="py-3 px-5 font-semibold">Monto Estimado</th>
              <th className="py-3 px-5 font-semibold">Estado</th>
              <th className="py-3 px-5 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-300">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                  No hay prospectos registrados aún.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-5 font-bold text-white">
                    <div>{lead.empresa}</div>
                    {lead.url && (
                      <a
                        href={lead.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 font-normal"
                      >
                        <span>{lead.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-5 font-medium">{lead.decisor}</td>
                  <td className="py-3 px-5 text-slate-400">{lead.cargo}</td>
                  <td className="py-3 px-5">
                    <div>{lead.email}</div>
                    {lead.telefono && <div className="text-slate-500 mt-0.5">{lead.telefono}</div>}
                  </td>
                  <td className="py-3 px-5 font-bold text-emerald-400">
                    {lead.monto_clp ? `$${lead.monto_clp.toLocaleString('es-CL')} CLP` : '-'}
                  </td>
                  <td className="py-3 px-5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.05] border border-white/[0.08] text-slate-300">
                      {lead.estado}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={() => onEditLead(lead)}
                      className="px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/[0.08] transition"
                    >
                      Ver Ficha
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
