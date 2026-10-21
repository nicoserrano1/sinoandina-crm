'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import LeadCard from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onMoverEstado: (id: string, nuevoEstado: LeadStatus) => void;
  onRefresh: () => void;
}

const COLUMNAS: { id: LeadStatus; label: string; emoji: string }[] = [
  { id: 'Nuevo', label: 'Nuevos', emoji: '🆕' },
  { id: 'Contactado', label: 'Contactados', emoji: '✉️' },
  { id: 'Seguimiento', label: 'Seguimiento', emoji: '🔄' },
  { id: 'En Reunión', label: 'En Reunión', emoji: '🤝' },
  { id: 'Cotizado', label: 'Cotizado', emoji: '📝' },
  { id: 'Cerrado Ganado', label: 'Ganado', emoji: '🏆' },
];

export default function KanbanBoard({
  leads,
  onEditLead,
  onSendEmail,
  onMoverEstado,
  onRefresh
}: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado reactivo en tiempo real
  const leadsFiltrados = leads.filter((l) => {
    if (l.estado === 'Descartado') return false; // Omitir descartados del kanban activo
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.empresa.toLowerCase().includes(q) ||
      l.decisor.toLowerCase().includes(q) ||
      l.cargo.toLowerCase().includes(q) ||
      l.partida.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por empresa, decisor, partida o material..."
            className="w-full bg-[#111c33] border border-[#1a2744] focus:border-blue-500 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 outline-none transition"
          />
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111c33] hover:bg-[#162238] border border-[#1a2744] text-slate-300 hover:text-white text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Grid de Columnas Kanban */}
      <div className="flex-1 grid grid-cols-6 gap-3.5 overflow-x-auto min-w-[1200px] pb-4">
        {COLUMNAS.map((col) => {
          const leadsColumna = leadsFiltrados.filter((l) => l.estado === col.id);
          const totalColumna = leadsColumna.reduce((sum, l) => sum + (l.monto_clp || 0), 0);

          return (
            <div
              key={col.id}
              className="bg-[#0c1527] border border-[#1a2744] rounded-2xl flex flex-col max-h-full overflow-hidden"
            >
              {/* Header Columna */}
              <div className="p-3 border-b border-[#1a2744] flex items-center justify-between flex-shrink-0 bg-[#0e172a]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{col.emoji}</span>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#162238] text-slate-400">
                  {leadsColumna.length}
                </span>
              </div>

              {/* Subtotal en CLP si hay montos */}
              {totalColumna > 0 && (
                <div className="px-3 py-1 bg-[#101b33] border-b border-[#1a2744] text-[10px] font-bold text-emerald-400 text-right">
                  ${totalColumna.toLocaleString('es-CL')} CLP
                </div>
              )}

              {/* Cuerpo / Lista de Tarjetas */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                {leadsColumna.length === 0 ? (
                  <div className="h-28 border border-dashed border-[#1a2744] rounded-xl flex items-center justify-center text-xs text-slate-500 font-medium">
                    Sin prospectos
                  </div>
                ) : (
                  leadsColumna.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={onEditLead}
                      onSendEmail={onSendEmail}
                      onMoverEstado={onMoverEstado}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
