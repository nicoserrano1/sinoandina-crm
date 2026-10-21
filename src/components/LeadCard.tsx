'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Edit3, 
  Send, 
  MessageSquare, 
  ChevronRight, 
  Clock,
  Package,
  GripVertical
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
  const [isDragging, setIsDragging] = useState(false);

  // Calcular días desde creación o último contacto
  const diffDays = lead.dias_inactivo !== undefined 
    ? lead.dias_inactivo 
    : Math.max(0, Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    
  const isStale = (lead.estado === 'Contactado' || lead.estado === 'Seguimiento') && diffDays >= 3;

  // Siguiente estado en el embudo comercial
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

  // Link de WhatsApp con saludo personalizado para Chile
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
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('leadId', lead.id);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`glass-card rounded-2xl p-3.5 transition-all duration-200 select-none cursor-grab active:cursor-grabbing w-full overflow-hidden ${
        isDragging ? 'opacity-40 scale-[0.98] border-blue-500 ring-2 ring-blue-500/30' : ''
      }`}
    >
      {/* Header con Nombre Completo y Días */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <h4 className="text-sm font-bold text-white hover:text-blue-400 transition leading-snug line-clamp-2">
            {lead.empresa}
          </h4>
        </div>

        {isStale ? (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex-shrink-0 animate-pulse">
            <Clock className="w-3 h-3" /> {diffDays}d
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-400 flex-shrink-0">
            {diffDays}d
          </span>
        )}
      </div>

      {/* Tomador de Decisión & Cargo */}
      <div className="text-xs font-semibold text-blue-400 truncate mb-0.5">{lead.decisor}</div>
      <div className="text-[11px] text-slate-400 mb-2.5 truncate">{lead.cargo}</div>

      {/* Tags: Monto en CLP & Partida de Interés */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.monto_clp > 0 && (
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm">
            ${lead.monto_clp.toLocaleString('es-CL')} CLP
          </span>
        )}
        {lead.partida && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 truncate max-w-full">
            <Package className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{lead.partida}</span>
          </span>
        )}
      </div>

      {/* Datos de Contacto Rápidos */}
      <div className="space-y-1 mb-3 text-[11px] text-slate-300">
        <div className="flex items-center gap-2 bg-[#08090C]/60 px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{lead.email}</span>
        </div>
        {lead.telefono && (
          <div className="flex items-center gap-2 bg-[#08090C]/60 px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{lead.telefono}</span>
          </div>
        )}
      </div>

      {/* Barra de Acciones: Perfectamente encajada sin desbordes */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-1.5">
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition"
          title="Ver Ficha y Notas"
        >
          <Edit3 className="w-3 h-3" />
          <span>Ficha</span>
        </button>

        <button
          onClick={() => onSendEmail(lead)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 transition"
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
            className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition shadow-sm"
            title="Abrir WhatsApp con mensaje pre-redactado"
          >
            <MessageSquare className="w-3 h-3" />
            <span>WA</span>
          </a>
        )}

        {nextStage && (
          <button
            onClick={() => onMoverEstado(lead.id, nextStage)}
            className="flex items-center justify-center p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm flex-shrink-0"
            title={`Avanzar a ${nextStage}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
