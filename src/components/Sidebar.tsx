'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Clock, 
  Database, 
  Plus, 
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNuevoLead: () => void;
  totalLeads: number;
  seguimientosCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNuevoLead,
  totalLeads,
  seguimientosCount
}: SidebarProps) {
  const menuItems = [
    { id: 'kanban', label: 'Pipeline Comercial', icon: LayoutDashboard, badge: totalLeads },
    { id: 'prospector', label: 'Prospector', icon: Search },
    { id: 'seguimientos', label: 'Seguimientos', icon: Clock, badge: seguimientosCount, badgeColor: 'bg-amber-500/15 text-amber-300' },
    { id: 'tabla', label: 'Base de Datos', icon: Database },
  ];

  return (
    <aside className="w-60 bg-[#08090C] border-r border-white/[0.06] flex flex-col p-4 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-base">
          <Building2 className="w-4 h-4" />
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
            Sinoandina
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">CRM Comercial</p>
        </div>
      </div>

      {/* Primary Action Button */}
      <button 
        onClick={onOpenNuevoLead}
        className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-sm hover:shadow-md"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Prospecto</span>
      </button>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-white/[0.08] text-white font-semibold' 
                  : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.badgeColor || (isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-400')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clean Minimal Footer */}
      <div className="mt-auto pt-4 text-[11px] text-slate-600 text-center font-medium">
        Sinoandina SpA
      </div>
    </aside>
  );
}
