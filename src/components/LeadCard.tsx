'use client';

import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Edit3, 
  Send, 
  MessageSquare, 
  ChevronRight, 
  Clock,
  Package
} from 'lucide-react';
import { Lead, LeadStatus } from '@/lib/types';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onMoverEstado: (id: string, nuevoEstado: LeadStatus) => void;
}

export default function LeadCard({
  lead,
  onEdit,
  onSendEmail,
  onMoverEstado
}: LeadCardProps) {
  // Calcular días desde creación
  const diffDays = lead.dias_inactivo !== undefined ? lead.dias_inactivo : Math.max(0, Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)));
  const isStale = (lead.estado === 'Contactado' || lead.estado === 'Seguimiento') && diffDays >= 3;

  // Siguiente estado en el pipeline
  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    switch (current) {
      case 'Nuevo': return 'Contactado';
      case 'Contactado': return 'En Reunión';
      case 'Seguimiento': return 'En Reunión';
      case 'En Reunión': return 'Cotizado';
      case 'Cotizado': return 'Cerrado Ganado';
      default: return null;
    }
  };

  const nextStage = getNextStage(lead.estado);

  // Link de WhatsApp con saludo personalizado
  const getWhatsAppLink = () => {
    if (!lead.telefono) return null;
    const cleanPhone = lead.telefono.replace(/\D/g, '');
    if (!cleanPhone) return null;
    const mensaje = encodeURIComponent(
      `Hola ${lead.decisor || ''}, un gusto saludarle de Sinoandina SpA. Le contacto brevemente respecto a suministro directo desde fábrica para sus proyectos en ejecución.`
    );
    return `https://wa.me/${cleanPhone}?text=${mensaje}`;
  };

  const waLink = getWhatsAppLink();

  return (
    <div className="bg-[#131f38] border border-[#1e3056] hover:border-blue-500/60 rounded-xl p-3.5 transition-all duration-150 shadow-md shadow-black/20 group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition line-clamp-1">
          {lead.empresa}
        </h4>
        {isStale ? (
          <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 flex-shrink-0 animate-pulse">
            <Clock className="w-3 h-3" /> {diffDays}d sin rpta
          </span>
        ) : (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#1a2744] text-slate-400 flex-shrink-0">
            {diffDays}d
          </span>
        )}
      </div>

      {/* Decision Maker */}
      <div className="text-xs font-semibold text-blue-400 line-clamp-1">{lead.decisor}</div>
      <div className="text-[11px] text-slate-400 mb-2.5 line-clamp-1">{lead.cargo}</div>

      {/* Tags: Monto & Partida */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {lead.monto_clp > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ${lead.monto_clp.toLocaleString('es-CL')} CLP
          </span>
        )}
        {lead.partida && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Package className="w-3 h-3" /> {lead.partida}
          </span>
        )}
      </div>

      {/* Contact Snippets */}
      <div className="space-y-1 mb-3 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5 bg-[#0c1527] px-2 py-1 rounded border border-[#1a2744] truncate">
          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.telefono && (
          <div className="flex items-center gap-1.5 bg-[#0c1527] px-2 py-1 rounded border border-[#1a2744] truncate">
            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{lead.telefono}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2.5 border-t border-[#1a2744] flex items-center gap-1.5">
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#162238] hover:bg-[#1e293b] text-slate-300 hover:text-white text-xs font-medium border border-[#233458] transition"
          title="Ver Ficha y Notas"
        >
          <Edit3 className="w-3 h-3" />
          <span>Ficha</span>
        </button>

        <button
          onClick={() => onSendEmail(lead)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#162238] hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-medium border border-[#233458] transition"
          title="Redactar Correo con IA"
        >
          <Send className="w-3 h-3" />
          <span>Email</span>
        </button>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold border border-emerald-500/30 transition"
            title="Abrir WhatsApp con mensaje pre-redactado"
          >
            <MessageSquare className="w-3 h-3" />
            <span>WA</span>
          </a>
        )}

        {nextStage && (
          <button
            onClick={() => onMoverEstado(lead.id, nextStage)}
            className="flex items-center justify-center py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
            title={`Mover a ${nextStage}`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
