'use client';

import React from 'react';
import { Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Lead } from '@/lib/types';

interface SeguimientosPanelProps {
  leads: Lead[];
  onSendEmail: (lead: Lead) => void;
}

export default function SeguimientosPanel({ leads, onSendEmail }: SeguimientosPanelProps) {
  // Filtrar leads estancados sin respuesta por más de 3 días
  const pendientes = leads.filter((l) => {
    const diffDays = l.dias_inactivo !== undefined ? l.dias_inactivo : Math.max(0, Math.floor((Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    return (l.estado === 'Contactado' || l.estado === 'Seguimiento') && diffDays >= 3;
  });

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-amber-400" />
          <span>Detector de Seguimientos Pendientes (&gt;3 Días sin Respuesta)</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Regla de Oro en Ventas B2B: El 80% de los negocios se cierran entre el 2do y 5to contacto.
        </p>
      </div>

      {pendientes.length === 0 ? (
        <div className="p-12 text-center bg-[#0c1527] border border-[#1a2744] rounded-3xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">¡Todo al día!</h3>
          <p className="text-sm text-slate-400 mt-1">
            No tienes prospectos esperando seguimiento en este momento.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.map((lead) => {
            const diffDays = Math.max(0, Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)));
            const cleanPhone = lead.telefono ? lead.telefono.replace(/\D/g, '') : null;
            const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

            return (
              <div
                key={lead.id}
                className="bg-[#0c1527] border border-[#1a2744] hover:border-amber-500/50 rounded-2xl p-5 flex items-center justify-between gap-4 transition shadow-md"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-white">{lead.empresa}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      ⏳ {diffDays} días sin respuesta
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>{lead.decisor}</strong> ({lead.cargo}) • {lead.email}
                  </p>
                  {lead.partida && (
                    <p className="text-xs text-purple-400 mt-1">
                      Partida de interés: {lead.partida}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                      title="Escribir por WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => onSendEmail(lead)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Preparar Seguimiento con IA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
