'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Clock, 
  Database, 
  CreditCard, 
  PlusCircle, 
  Zap,
  Building2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNuevoLead: () => void;
  creditos: number;
  totalLeads: number;
  seguimientosCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNuevoLead,
  creditos,
  totalLeads,
  seguimientosCount
}: SidebarProps) {
  const menuItems = [
    { id: 'kanban', label: 'Pipeline Kanban', icon: LayoutDashboard, badge: totalLeads },
    { id: 'prospector', label: 'Prospector IA', icon: Search, highlight: true },
    { id: 'seguimientos', label: 'Seguimientos', icon: Clock, badge: seguimientosCount, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'tabla', label: 'Base de Datos CRM', icon: Database },
    { id: 'planes', label: 'Planes & Créditos', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-[#0c1527] border-r border-[#1a2744] flex flex-col p-4 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-lg">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-tight leading-none">Sinoandina</h1>
          <p className="text-xs text-slate-400 mt-1">Revenue Machine v5</p>
        </div>
      </div>

      {/* Credit Balance Card */}
      <div className="mb-5 p-3 rounded-xl bg-gradient-to-br from-[#111c33] to-[#162238] border border-[#1e3056] shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Créditos IA
          </span>
          <span className="text-emerald-400 font-semibold">Plan Pro</span>
        </div>
        <div className="flex items-baseline justify-between mt-2">
          <div className="text-xl font-bold text-white">
            {creditos} <span className="text-xs font-normal text-slate-400">/ 250</span>
          </div>
          <button 
            onClick={() => setActiveTab('planes')}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            Recargar
          </button>
        </div>
        <div className="w-full bg-[#0a101f] h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (creditos / 250) * 100)}%` }}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-300 hover:bg-[#162238] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-[#1e293b] text-slate-300')
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Action Button */}
      <button 
        onClick={onOpenNuevoLead}
        className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-blue-500/40 text-blue-400 bg-blue-500/10 hover:bg-blue-600 hover:text-white hover:border-solid text-sm font-semibold transition"
      >
        <PlusCircle className="w-4 h-4" />
        <span>Agregar Lead Manual</span>
      </button>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-[#1a2744] text-[11px] text-slate-500 text-center">
        Sourcing China • Entrega DDP<br />Factura Local en CLP
      </div>
    </aside>
  );
}
