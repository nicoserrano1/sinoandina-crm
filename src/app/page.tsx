'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderStats from '@/components/HeaderStats';
import KanbanBoard from '@/components/KanbanBoard';
import ProspectorPanel from '@/components/ProspectorPanel';
import SeguimientosPanel from '@/components/SeguimientosPanel';
import TableView from '@/components/TableView';
import ModalNuevoLead from '@/components/ModalNuevoLead';
import ModalLeadFicha from '@/components/ModalLeadFicha';
import ModalEnviarCorreo from '@/components/ModalEnviarCorreo';
import ModalPersonalizarEtapas from '@/components/ModalPersonalizarEtapas';
import { Lead, LeadStatus, PipelineMetrics, PipelineEtapa } from '@/lib/types';

const ETAPAS_DEFAULT: PipelineEtapa[] = [
  { id: 'Nuevo', nombre: 'Nuevos', dotColor: 'bg-blue-500' },
  { id: 'Contactado', nombre: 'Contactados', dotColor: 'bg-amber-500' },
  { id: 'Seguimiento', nombre: 'Seguimiento', dotColor: 'bg-orange-500' },
  { id: 'En Reunión', nombre: 'En Reunión', dotColor: 'bg-purple-500' },
  { id: 'Cotizado', nombre: 'Cotizado', dotColor: 'bg-pink-500' },
  { id: 'Cerrado Ganado', nombre: 'Cerrado Ganado', dotColor: 'bg-emerald-500' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [etapas, setEtapas] = useState<PipelineEtapa[]>(ETAPAS_DEFAULT);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modales
  const [isModalNuevoOpen, setIsModalNuevoOpen] = useState(false);
  const [isModalEtapasOpen, setIsModalEtapasOpen] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<Lead | null>(null);

  // Cargar estado de la barra lateral y etapas personalizadas
  useEffect(() => {
    try {
      const guardadas = localStorage.getItem('sinoandina_pipeline_etapas');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setEtapas(parsed);
        }
      }

      const sidebarSaved = localStorage.getItem('sinoandina_sidebar_collapsed');
      if (sidebarSaved !== null) {
        setIsSidebarCollapsed(sidebarSaved === 'true');
      }
    } catch (e) {
      console.error('Error cargando configuración local:', e);
    }
  }, []);

  const handleToggleSidebar = (val?: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsed((prev) => {
      const next = typeof val === 'function' ? val(prev) : typeof val === 'boolean' ? val : !prev;
      try {
        localStorage.setItem('sinoandina_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Cargar leads desde la API de Supabase
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Error cargando leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Guardar etapas personalizadas
  const handleGuardarEtapas = (nuevasEtapas: PipelineEtapa[]) => {
    setEtapas(nuevasEtapas);
    try {
      localStorage.setItem('sinoandina_pipeline_etapas', JSON.stringify(nuevasEtapas));
    } catch (e) {
      console.error('Error guardando etapas:', e);
    }
  };

  const handleRestablecerEtapasDefecto = () => {
    setEtapas(ETAPAS_DEFAULT);
    try {
      localStorage.removeItem('sinoandina_pipeline_etapas');
    } catch (e) {}
  };

  // Métricas del Pipeline
  const metrics: PipelineMetrics = React.useMemo(() => {
    const m = {
      total: 0,
      nuevos: 0,
      contactados: 0,
      seguimiento: 0,
      reunion: 0,
      cotizados: 0,
      ganados: 0,
      descartados: 0,
      valorPipeline: 0,
      creditosDisponibles: 999
    };

    leads.forEach((l) => {
      if (l.estado === 'Descartado') {
        m.descartados++;
        return;
      }

      m.total++;
      if (l.estado === 'Nuevo') m.nuevos++;
      else if (l.estado === 'Contactado') m.contactados++;
      else if (l.estado === 'Seguimiento') m.seguimiento++;
      else if (l.estado === 'En Reunión') m.reunion++;
      else if (l.estado === 'Cotizado') m.cotizados++;
      else if (l.estado === 'Cerrado Ganado') m.ganados++;

      m.valorPipeline += Number(l.monto_clp) || 0;
    });

    return m;
  }, [leads]);

  // Manejadores de Estado
  const handleMoverEstado = async (id: string, nuevoEstado: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, estado: nuevoEstado } : l))
    );

    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      });
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  const handleLeadCreado = (nuevoLead: Lead) => {
    setLeads((prev) => [nuevoLead, ...prev]);
  };

  const handleLeadActualizado = (leadActualizado: Lead) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadActualizado.id ? leadActualizado : l))
    );
  };

  const handleLeadDescartado = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, estado: 'Descartado' } : l))
    );
  };

  const handleLeadsAgregadosPorProspector = (nuevosLeads: Lead[]) => {
    setLeads((prev) => [...nuevosLeads, ...prev]);
    setActiveTab('kanban');
  };

  const handleEmailEnviado = (leadId: string) => {
    handleMoverEstado(leadId, 'Contactado');
  };

  // Conteo de seguimientos pendientes (>3 días)
  const seguimientosCount = React.useMemo(() => {
    return leads.filter((l) => {
      const diffDays = l.dias_inactivo !== undefined ? l.dias_inactivo : Math.max(0, Math.floor((Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      return (l.estado === 'Contactado' || l.estado === 'Seguimiento') && diffDays >= 3;
    }).length;
  }, [leads]);

  const titulosVistas: Record<string, string> = {
    kanban: 'Pipeline Comercial',
    prospector: 'Prospección de Empresas',
    seguimientos: 'Seguimientos Pendientes',
    tabla: 'Base de Datos de Clientes'
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#08090C]">
      {/* Sidebar Lateral Colapsable */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNuevoLead={() => setIsModalNuevoOpen(true)}
        onOpenPersonalizarEtapas={() => setIsModalEtapasOpen(true)}
        totalLeads={metrics.total}
        seguimientosCount={seguimientosCount}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleSidebar}
      />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Barra Superior con botón de expansión */}
        <HeaderStats
          title={titulosVistas[activeTab] || 'Dashboard'}
          metrics={metrics}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => handleToggleSidebar()}
        />

        {/* Contenido Dinámico */}
        <main className={`flex-1 min-h-0 ${activeTab === 'kanban' ? 'overflow-hidden p-5 flex flex-col' : 'overflow-y-auto p-6'}`}>
          {activeTab === 'kanban' && (
            <KanbanBoard
              leads={leads}
              etapas={etapas}
              onEditLead={(lead) => setSelectedLeadForEdit(lead)}
              onSendEmail={(lead) => setSelectedLeadForEmail(lead)}
              onMoverEstado={handleMoverEstado}
              onRefresh={fetchLeads}
              onOpenPersonalizarEtapas={() => setIsModalEtapasOpen(true)}
            />
          )}

          {activeTab === 'prospector' && (
            <ProspectorPanel
              onLeadsAgregados={handleLeadsAgregadosPorProspector}
            />
          )}

          {activeTab === 'seguimientos' && (
            <SeguimientosPanel
              leads={leads}
              onSendEmail={(lead) => setSelectedLeadForEmail(lead)}
            />
          )}

          {activeTab === 'tabla' && (
            <TableView
              leads={leads}
              onEditLead={(lead) => setSelectedLeadForEdit(lead)}
            />
          )}
        </main>
      </div>

      {/* Modales */}
      <ModalNuevoLead
        isOpen={isModalNuevoOpen}
        onClose={() => setIsModalNuevoOpen(false)}
        onLeadCreado={handleLeadCreado}
      />

      <ModalLeadFicha
        lead={selectedLeadForEdit}
        isOpen={Boolean(selectedLeadForEdit)}
        onClose={() => setSelectedLeadForEdit(null)}
        onLeadActualizado={handleLeadActualizado}
        onLeadDescartado={handleLeadDescartado}
        etapas={etapas}
      />

      <ModalEnviarCorreo
        lead={selectedLeadForEmail}
        isOpen={Boolean(selectedLeadForEmail)}
        onClose={() => setSelectedLeadForEmail(null)}
        onEmailEnviado={handleEmailEnviado}
      />

      <ModalPersonalizarEtapas
        isOpen={isModalEtapasOpen}
        onClose={() => setIsModalEtapasOpen(false)}
        etapasActuales={etapas}
        onGuardarEtapas={handleGuardarEtapas}
        onRestablecerDefecto={handleRestablecerEtapasDefecto}
      />
    </div>
  );
}
