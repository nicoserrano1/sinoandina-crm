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
  GripVertical,
  Sparkles
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { getLinkedInUrl, isGenericDecisor } from '@/lib/linkedin';
import { resolveLeadEmails, classifyPhone } from '@/lib/email-patterns';

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

  // Enlace directo al perfil de la persona o búsqueda de directivos en LinkedIn
  const linkedinUrl = getLinkedInUrl(lead);
  const isGeneric = isGenericDecisor(lead.decisor);

  // Clasificación transparente de correos y teléfonos
  const emailList = resolveLeadEmails(lead);
  const phoneInfo = classifyPhone(lead.telefono);

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

      {/* Tomador de Decisión & Acceso Directo a LinkedIn */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-200 truncate">
            {lead.decisor}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {lead.cargo}
          </div>
        </div>

        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-1 rounded-lg bg-[#0077B5]/10 hover:bg-[#0077B5]/25 border border-[#0077B5]/30 text-[#0077B5] hover:text-sky-300 text-[10px] font-bold transition flex items-center gap-1 flex-shrink-0"
          title={isGeneric 
            ? `Buscar directivos de ${lead.empresa} en LinkedIn` 
            : `Abrir perfil de ${lead.decisor} (${lead.empresa}) en LinkedIn`
          }
        >
          <span>in</span>
        </a>
      </div>

      {/* Tags: Monto en CLP & Partida */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {lead.monto_clp > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ${lead.monto_clp.toLocaleString('es-CL')} CLP
          </span>
        )}
        {lead.partida && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300 border border-white/[0.06] leading-snug">
            <Package className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span>{lead.partida}</span>
          </span>
        )}
      </div>

      {/* Directorio de Contacto Transparente (Optimizado para visibilidad total sin cortes) */}
      <div className="bg-[#090C12] border border-white/[0.06] rounded-xl p-2.5 space-y-2 mb-3">
        {/* Email Principal / Web */}
        {emailList.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{emailList[0].origen === 'real_web_generico' ? 'Mesa Central (Web)' : 'Correo Principal'}</span>
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${emailList[0].badgeColor}`}>
                {emailList[0].origen === 'real_web_generico' ? '🏢 Web Empresa' : '👤 Verificado'}
              </span>
            </div>
            <div className="text-slate-200 text-[11px] font-mono break-all select-all leading-tight pl-4">
              {emailList[0].email}
            </div>
          </div>
        )}

        {/* Segundo Correo / Estimado Directo */}
        {emailList.length > 1 && (
          <div className="pt-1.5 border-t border-white/[0.04]">
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-amber-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Directo Estimado ({emailList[1].esMasProbable ? '50% Más Probable' : 'Alternativo'}):</span>
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded border text-amber-300 bg-amber-500/15 border-amber-500/30">
                💡 Patrón IA
              </span>
            </div>
            <div className="text-amber-200 text-[11px] font-mono break-all select-all leading-tight pl-4">
              {emailList[1].email}
            </div>
          </div>
        )}

        {/* Teléfono con Clasificación Transparente */}
        {phoneInfo.numero && (
          <div className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
              <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span>{phoneInfo.numero}</span>
            </div>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${phoneInfo.badgeColor}`}>
              {phoneInfo.tipo === 'movil_directo' ? '📱 Celular / WA' : '☎️ Mesa Central'}
            </span>
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
