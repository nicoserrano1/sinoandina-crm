'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, Mail, Sparkles } from 'lucide-react';
import { Lead } from '@/lib/types';
import { generateExecutiveEmails, isGenericEmail } from '@/lib/email-patterns';

interface ModalEnviarCorreoProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onEmailEnviado: (leadId: string) => void;
}

export default function ModalEnviarCorreo({
  lead,
  isOpen,
  onClose,
  onEmailEnviado
}: ModalEnviarCorreoProps) {
  const [tipo, setTipo] = useState<'intro' | 'followup' | 'cotizacion'>('intro');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [destinatario, setDestinatario] = useState(lead?.email || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lead) {
      setDestinatario(lead.email || '');
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  const suggestedEmails = generateExecutiveEmails(lead.decisor, lead.url || lead.email);
  const isGen = isGenericEmail(destinatario);

  const handleGenerarCopy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, tipo, enviarDirecto: false })
      });
      const data = await res.json();
      if (data.success) {
        setAsunto(data.asunto);
        setCuerpo(data.cuerpo);
      } else {
        alert(data.error || 'Error preparando mensaje');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(`Para: ${destinatario}\nAsunto: ${asunto}\n\n${cuerpo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAbrirEnCliente = async () => {
    const targetEmail = destinatario.trim() || lead.email;
    const mailto = `mailto:${targetEmail}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(mailto, '_blank');

    // Registrar en el historial de actividades de la tarjeta
    try {
      await fetch('/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          tipo: 'correo',
          descripcion: `Para: ${targetEmail}\nAsunto: ${asunto}\n\n${cuerpo}`
        })
      });
    } catch (e) {
      console.error('Error registrando actividad de correo:', e);
    }

    onEmailEnviado(lead.id);
    onClose();
  };

  const handleRegistrarComoEnviado = async () => {
    const targetEmail = destinatario.trim() || lead.email;
    try {
      await fetch('/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          tipo: 'correo',
          descripcion: `Para: ${targetEmail}\nAsunto: ${asunto}\n\n${cuerpo}`
        })
      });
    } catch (e) {
      console.error('Error registrando actividad:', e);
    }

    onEmailEnviado(lead.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C0F17] border border-white/[0.08] w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header Limpio */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white">Preparar Correo Comercial</h3>
            <p className="text-xs text-slate-400 mt-0.5">Empresa: {lead.empresa} · {lead.decisor}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Destinatario con Patrones Directos */}
        <div className="mb-4 p-3 rounded-xl bg-[#11141D] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Enviar a (Destinatario):</span>
            </label>
            {isGen && (
              <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium">
                Email actual es genérico
              </span>
            )}
          </div>

          <input
            type="email"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder="correo@empresa.com"
            className="w-full bg-[#0C0F17] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-1.5 text-xs text-white outline-none transition"
          />

          {/* Chips con patrones directos calculados para el decisor */}
          {suggestedEmails.length > 0 && (
            <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Patrones corporativos directos para {lead.decisor}:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedEmails.map((item, idx) => {
                  const isSelected = destinatario.toLowerCase() === item.email.toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDestinatario(item.email)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                          : 'bg-[#0C0F17] hover:bg-white/[0.06] border-white/[0.08] text-slate-300 hover:text-white'
                      }`}
                      title={`Patrón: ${item.patron} (${item.popularidad})`}
                    >
                      <span>{item.email}</span>
                      {item.esMasComun && <span className={isSelected ? 'text-slate-950 font-black' : 'text-amber-400 font-bold'}>★</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tipo de Mensaje */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Objetivo del Mensaje</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'intro', label: 'Primer Contacto' },
              { id: 'followup', label: 'Seguimiento' },
              { id: 'cotizacion', label: 'Cotización / Dossier' }
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setTipo(btn.id as any)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition ${
                  tipo === btn.id 
                    ? 'bg-blue-600 border-blue-500 text-white font-semibold' 
                    : 'bg-[#11141D] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generar Propuesta */}
        {!cuerpo && (
          <div className="py-6 text-center">
            <button
              onClick={handleGenerarCopy}
              disabled={loading}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
            >
              <span>{loading ? 'Generando propuesta...' : 'Generar Propuesta Personalizada'}</span>
            </button>
          </div>
        )}

        {/* Previsualización del Correo */}
        {cuerpo && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Asunto</label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cuerpo del Mensaje</label>
              <textarea
                rows={7}
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl p-3 text-xs text-white leading-relaxed outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2">
              <button
                onClick={handleCopiar}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-medium transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleRegistrarComoEnviado}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-medium border border-white/[0.08] transition"
                title="Registrar en el historial de la tarjeta sin abrir cliente de correo"
              >
                <Check className="w-3.5 h-3.5 text-amber-400" />
                <span>Registrar en Historial</span>
              </button>

              <button
                onClick={handleAbrirEnCliente}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Abrir en Gmail & Registrar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
