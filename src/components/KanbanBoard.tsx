'use client';

import React, { useState } from 'react';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Settings2,
  LayoutGrid,
  List
} from 'lucide-react';
import { Lead, LeadStatus, PipelineEtapa } from '@/lib/types';
import LeadCard from './LeadCard';
import TableView from './TableView';

interface KanbanBoardProps {
  leads: Lead[];
  etapas: PipelineEtapa[];
  onEditLead: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onMoverEstado: (id: string, nuevoEstado: LeadStatus) => void;
  onRefresh: () => void;
  onOpenPersonalizarEtapas: () => void;
}

export default function KanbanBoard({
  leads,
  etapas,
  onEditLead,
  onSendEmail,
  onMoverEstado,
  onRefresh,
  onOpenPersonalizarEtapas
}: KanbanBoardProps) {
  const [vista, setVista] = useState<'kanban' | 'tabla'>('kanban');
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
    link.setAttribute('download', `Colmena_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden">
      {/* Toolbar Limpia con Botón de Personalización */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 flex-shrink-0">
        {/* Buscador minimalista */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar empresa, contacto o partida..."
            className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        {/* Selector de Vista: Tablero Kanban o Tabla */}
        <div className="flex items-center gap-1 bg-[#11141D] p-1 rounded-xl border border-white/[0.08] text-xs">
          <button
            onClick={() => setVista('kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              vista === 'kanban' 
                ? 'bg-amber-500/20 text-amber-200 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Tablero Kanban"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tablero</span>
          </button>
          <button
            onClick={() => setVista('tabla')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
              vista === 'tabla' 
                ? 'bg-amber-500/20 text-amber-200 font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Vista Tabla"
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabla</span>
          </button>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex items-center gap-1 bg-[#11141D] p-1 rounded-xl border border-white/[0.08] text-xs">
          <button
            onClick={() => setFiltroRapido('todos')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filtroRapido === 'todos' ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({leads.length})
          </button>
          <button
            onClick={() => setFiltroRapido('con_monto')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filtroRapido === 'con_monto' ? 'bg-white/[0.08] text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Con Monto
          </button>
          <button
            onClick={() => setFiltroRapido('estancados')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              filtroRapido === 'estancados' ? 'bg-rose-500/15 text-rose-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            En Riesgo (+3d)
          </button>
        </div>

        {/* Orden, Personalizar y Exportar */}
        <div className="flex items-center gap-2">
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as any)}
            className="bg-[#11141D] border border-white/[0.08] text-slate-300 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="recientes">Recientes primero</option>
            <option value="mayor_monto">Mayor Monto ($)</option>
            <option value="dias">Más días sin contacto</option>
          </select>

          <button
            onClick={onOpenPersonalizarEtapas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11141D] hover:bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
            title="Personalizar columnas y etapas del pipeline"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Etapas</span>
          </button>

          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#11141D] hover:bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
            title="Exportar a CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-[#11141D] hover:bg-white/[0.05] border border-white/[0.08] text-slate-400 hover:text-white text-xs transition"
            title="Refrescar datos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contenido: Tablero Kanban o Tabla */}
      {vista === 'tabla' ? (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <TableView leads={leadsFiltrados} onEditLead={onEditLead} />
        </div>
      ) : (
        <div className="flex-1 flex gap-3.5 overflow-x-auto overflow-y-hidden min-h-0 pb-1">
          {etapas.map((col) => {
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
                className={`w-[320px] min-w-[320px] max-w-[320px] flex-shrink-0 bg-[#0C0F17] border rounded-2xl flex flex-col h-full overflow-hidden transition-all duration-150 ${
                  isOver 
                    ? 'border-blue-500/60 bg-blue-500/[0.03]' 
                    : 'border-white/[0.06]'
                }`}
              >
                {/* Header de Columna Dinámica */}
                <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0 bg-[#0C0F17]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor || 'bg-blue-500'}`} />
                    <span className="text-xs font-bold tracking-tight text-slate-200 truncate">
                      {col.nombre}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400">
                    {leadsColumna.length}
                  </span>
                </div>

                {/* Subtotal en CLP */}
                {totalColumna > 0 && (
                  <div className="px-3.5 py-1 bg-white/[0.02] border-b border-white/[0.04] text-[11px] font-semibold text-emerald-400 text-right">
                    ${totalColumna.toLocaleString('es-CL')} CLP
                  </div>
                )}

                {/* Lista de Tarjetas (Drop Zone) */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2.5 space-y-2.5">
                  {leadsColumna.length === 0 ? (
                    <div className="h-28 border border-dashed border-white/[0.06] rounded-xl flex items-center justify-center text-xs text-slate-600 font-medium">
                      Arrastra una tarjeta aquí
                    </div>
                  ) : (
                    leadsColumna.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onEdit={onEditLead}
                        onSendEmail={onSendEmail}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
