'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Edit3, 
  Send, 
  MessageSquare, 
  Clock,
  Package,
  GripVertical
} from 'lucide-react';
import { Lead } from '@/lib/types';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
}

export default function LeadCard({
  lead,
  onEdit,
  onSendEmail
}: LeadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Días transcurridos
  const diffDays = lead.dias_inactivo !== undefined 
    ? lead.dias_inactivo 
    : Math.max(0, Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    
  const isStale = (lead.estado === 'Contactado' || lead.estado === 'Seguimiento') && diffDays >= 3;

  // Link de WhatsApp con saludo personalizado
  const getWhatsAppLink = () => {
    if (!lead.telefono) return null;
    const cleanPhone = lead.telefono.replace(/\D/g, '');
    if (!cleanPhone) return null;
    const mensaje = encodeURIComponent(
      `Hola ${lead.decisor || ''}, gusto en saludarle. Le contacto de Sinoandina respecto a suministro directo para sus proyectos en ejecución.`
    );
    return `https://wa.me/${cleanPhone}?text=${mensaje}`;
  };

  const waLink = getWhatsAppLink();

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', lead.id);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`bg-[#11141D] hover:bg-[#161B26] border border-white/[0.06] hover:border-white/[0.14] rounded-xl p-3.5 transition-all duration-150 select-none cursor-grab active:cursor-grabbing w-full shadow-sm hover:shadow-md ${
        isDragging ? 'opacity-40 scale-[0.98] border-blue-500' : ''
      }`}
    >
      {/* Header con Nombre Completo y Días */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
          <h4 className="text-[13px] font-bold text-white hover:text-blue-300 transition leading-snug line-clamp-2">
            {lead.empresa}
          </h4>
        </div>

        {isStale ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 flex-shrink-0">
            <Clock className="w-3 h-3" /> {diffDays}d
          </span>
        ) : (
          <span className="text-[10px] text-slate-500 flex-shrink-0 font-medium">
            {diffDays}d
          </span>
        )}
      </div>

      {/* Tomador de Decisión & Cargo */}
      <div className="text-xs font-medium text-slate-300 truncate">{lead.decisor}</div>
      <div className="text-[11px] text-slate-500 mb-3 truncate">{lead.cargo}</div>

      {/* Tags: Monto en CLP & Partida */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.monto_clp > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ${lead.monto_clp.toLocaleString('es-CL')} CLP
          </span>
        )}
        {lead.partida && (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06] truncate max-w-full">
            <Package className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.partida}</span>
          </span>
        )}
      </div>

      {/* Datos de Contacto Rápidos */}
      <div className="space-y-1 mb-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.telefono && (
          <div className="flex items-center gap-2 truncate">
            <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{lead.telefono}</span>
          </div>
        )}
      </div>

      {/* Acciones limpias y sin sobrecarga */}
      <div className="pt-2.5 border-t border-white/[0.06] flex items-center gap-1.5">
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <Edit3 className="w-3 h-3 text-slate-400" />
          <span>Ficha</span>
        </button>

        <button
          onClick={() => onSendEmail(lead)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <Send className="w-3 h-3 text-slate-400" />
          <span>Email</span>
        </button>

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition"
          >
            <MessageSquare className="w-3 h-3" />
            <span>WA</span>
          </a>
        )}
      </div>
    </div>
  );
}
