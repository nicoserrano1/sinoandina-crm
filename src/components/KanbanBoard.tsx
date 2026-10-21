'use client';

import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';
import LeadCard from './LeadCard';

interface KanbanBoardProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onMoverEstado: (id: string, nuevoEstado: LeadStatus) => void;
  onRefresh: () => void;
}

const COLUMNAS: { id: LeadStatus; label: string; emoji: string; color: string }[] = [
  { id: 'Nuevo', label: 'Nuevos', emoji: '🆕', color: 'text-blue-400' },
  { id: 'Contactado', label: 'Contactados', emoji: '✉️', color: 'text-amber-400' },
  { id: 'Seguimiento', label: 'Seguimiento', emoji: '🔄', color: 'text-orange-400' },
  { id: 'En Reunión', label: 'En Reunión', emoji: '🤝', color: 'text-purple-400' },
  { id: 'Cotizado', label: 'Cotizado', emoji: '📝', color: 'text-pink-400' },
  { id: 'Cerrado Ganado', label: 'Ganado', emoji: '🏆', color: 'text-emerald-400' },
];

export default function KanbanBoard({
  leads,
  onEditLead,
  onSendEmail,
  onMoverEstado,
  onRefresh
}: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRapido, setFiltroRapido] = useState<'todos' | 'con_monto' | 'estancados'>('todos');
  const [orden, setOrden] = useState<'recientes' | 'mayor_monto' | 'dias'>('recientes');
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);

  // Filtrado reactivo inteligente
  const leadsFiltrados = leads.filter((l) => {
    if (l.estado === 'Descartado') return false;

    // Filtros rápidos
    if (filtroRapido === 'con_monto' && (!l.monto_clp || l.monto_clp <= 0)) return false;
    if (filtroRapido === 'estancados') {
      const diffDays = l.dias_inactivo !== undefined ? l.dias_inactivo : Math.max(0, Math.floor((Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      if (!((l.estado === 'Contactado' || l.estado === 'Seguimiento') && diffDays >= 3)) return false;
    }

    // Buscador por texto
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.empresa.toLowerCase().includes(q) ||
      l.decisor.toLowerCase().includes(q) ||
      l.cargo.toLowerCase().includes(q) ||
      l.partida.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    if (orden === 'mayor_monto') return (b.monto_clp || 0) - (a.monto_clp || 0);
    if (orden === 'dias') {
      const daysA = Math.max(0, Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      const daysB = Math.max(0, Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      return daysB - daysA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Exportar a CSV
  const exportarCSV = () => {
    if (leads.length === 0) {
      alert('No hay prospectos para exportar');
      return;
    }

    const headers = ['Empresa', 'Sitio Web', 'Decisor', 'Cargo', 'Email', 'Telefono', 'Monto CLP', 'Partida', 'Estado', 'Notas'];
    const rows = leads.map(l => [
      `"${l.empresa.replace(/"/g, '""')}"`,
      `"${l.url}"`,
      `"${l.decisor.replace(/"/g, '""')}"`,
      `"${l.cargo.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.telefono}"`,
      l.monto_clp || 0,
      `"${l.partida.replace(/"/g, '""')}"`,
      `"${l.estado}"`,
      `"${l.notas.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sinoandina_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Toolbar Pro */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 flex-shrink-0">
        {/* Buscador reactivo */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por empresa, decisor, partida o material..."
            className="w-full bg-[#0E1017] border border-white/10 focus:border-blue-500 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none transition shadow-sm"
          />
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center gap-1.5 bg-[#0E1017] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setFiltroRapido('todos')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filtroRapido === 'todos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({leads.length})
          </button>
          <button
            onClick={() => setFiltroRapido('con_monto')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filtroRapido === 'con_monto' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Con Monto CLP
          </button>
          <button
            onClick={() => setFiltroRapido('estancados')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filtroRapido === 'estancados' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚠️ En Riesgo (+3d)
          </button>
        </div>

        {/* Orden y Exportar */}
        <div className="flex items-center gap-2">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as any)}
            className="bg-[#0E1017] border border-white/10 text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none"
          >
            <option value="recientes">Recientes primero</option>
            <option value="mayor_monto">Mayor Monto ($)</option>
            <option value="dias">Más días sin contacto</option>
          </select>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1017] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition"
            title="Exportar base completa a CSV / Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-[#0E1017] hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs transition"
            title="Refrescar datos desde Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid de Columnas Kanban con Drag & Drop Nativo */}
      <div className="flex-1 grid grid-cols-6 gap-3.5 overflow-x-auto min-w-[1240px] pb-4">
        {COLUMNAS.map((col) => {
          const leadsColumna = leadsFiltrados.filter((l) => l.estado === col.id);
          const totalColumna = leadsColumna.reduce((sum, l) => sum + (l.monto_clp || 0), 0);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCol(col.id);
              }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                e.preventDefault();
                const leadId = e.dataTransfer.getData('leadId');
                if (leadId) {
                  onMoverEstado(leadId, col.id);
                }
                setDragOverCol(null);
              }}
              className={`glass-panel rounded-2xl flex flex-col max-h-full overflow-hidden transition-all duration-200 ${
                isOver ? 'kanban-dropzone-active border-dashed border-2' : ''
              }`}
            >
              {/* Header de Columna */}
              <div className="p-3.5 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-[#0E1017]/80">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.emoji}</span>
                  <span className={`text-xs font-extrabold tracking-wide uppercase ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                  {leadsColumna.length}
                </span>
              </div>

              {/* Subtotal en CLP si hay montos en la columna */}
              {totalColumna > 0 && (
                <div className="px-3 py-1 bg-emerald-500/5 border-b border-emerald-500/10 text-[10px] font-extrabold text-emerald-400 text-right">
                  ${totalColumna.toLocaleString('es-CL')} CLP
                </div>
              )}

              {/* Lista de Tarjetas / Drop Zone */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                {leadsColumna.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-500 font-medium p-4 text-center">
                    <span className="text-lg opacity-40 mb-1">📥</span>
                    <span>Arrastra una tarjeta aquí</span>
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
