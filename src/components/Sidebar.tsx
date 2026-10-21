'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Clock, 
  Database, 
  Plus, 
  Building2,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNuevoLead: () => void;
  onOpenPersonalizarEtapas: () => void;
  totalLeads: number;
  seguimientosCount: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNuevoLead,
  onOpenPersonalizarEtapas,
  totalLeads,
  seguimientosCount,
  isCollapsed,
  setIsCollapsed
}: SidebarProps) {
  const menuItems = [
    { 
      id: 'kanban', 
      label: 'Pipeline Comercial', 
      icon: LayoutDashboard, 
      badge: totalLeads 
    },
    { 
      id: 'prospector', 
      label: 'Prospector', 
      icon: Search 
    },
    { 
      id: 'seguimientos', 
      label: 'Seguimientos', 
      icon: Clock, 
      badge: seguimientosCount, 
      badgeColor: 'bg-amber-500/15 text-amber-300' 
    },
    { 
      id: 'tabla', 
      label: 'Base de Datos', 
      icon: Database 
    },
  ];

  return (
    <aside 
      className={`bg-[#08090C] border-r border-white/[0.06] flex flex-col flex-shrink-0 select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[68px] p-2.5' : 'w-60 p-4'
      }`}
    >
      {/* Brand Header */}
      <div className={`flex items-center mb-6 mt-1 ${isCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div 
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-base flex-shrink-0 cursor-pointer"
            title="Sinoandina SpA"
          >
            <Building2 className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-white text-sm tracking-tight leading-tight truncate">
                Sinoandina
              </h1>
              <p className="text-[11px] text-slate-500 font-medium truncate">CRM Comercial</p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition"
            title="Ocultar menú lateral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      {isCollapsed ? (
        <button 
          onClick={onOpenNuevoLead}
          className="w-10 h-10 mx-auto mb-5 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm hover:shadow-md"
          title="Nuevo Prospecto"
        >
          <Plus className="w-5 h-5" />
        </button>
      ) : (
        <button 
          onClick={onOpenNuevoLead}
          className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Prospecto</span>
        </button>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 flex flex-col justify-between">
        <nav className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Comercial
            </div>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-medium transition-all relative ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                } ${
                  isActive 
                    ? 'bg-white/[0.08] text-white font-semibold shadow-sm' 
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {/* Badge con número */}
                {item.badge !== undefined && item.badge > 0 && (
                  isCollapsed ? (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-[#08090C]" />
                  ) : (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400')
                    }`}>
                      {item.badge}
                    </span>
                  )
                )}
              </button>
            );
          })}

          {/* Sección de Configuración */}
          <div className="pt-3">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                Ajustes
              </div>
            )}
            <button
              onClick={onOpenPersonalizarEtapas}
              title={isCollapsed ? 'Configurar Etapas del Pipeline' : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {!isCollapsed && <span>Etapas Pipeline</span>}
            </button>
          </div>
        </nav>

        {/* Footer / User Profile & Expand Trigger */}
        <div className="pt-4 border-t border-white/[0.06] mt-auto">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
                title="Expandir menú lateral"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
              <div 
                className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-slate-300"
                title="Nicolás Serrano - Sinoandina SpA"
              >
                NS
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-1">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-200">
                    NS
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#08090C]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">Nicolás Serrano</p>
                  <p className="text-[10px] text-slate-500 truncate">Sinoandina SpA</p>
                </div>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition"
                title="Colapsar menú"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
