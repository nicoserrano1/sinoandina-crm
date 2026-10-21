'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, Copy, Check, ShieldCheck, Mail } from 'lucide-react';
import { Lead } from '@/lib/types';

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
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !lead) return null;

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
        alert(data.error || 'Error generando correo');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(`Asunto: ${asunto}\n\n${cuerpo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAbrirEnCliente = () => {
    const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.open(mailto, '_blank');
    onEmailEnviado(lead.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c1527] border border-[#1a2744] w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1a2744]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Redactor Anti-Spam IA</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Destinatario: {lead.email}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#162238] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Anti-Spam Compliance */}
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Norma Oficial de Google Workspace:</strong> Cero adjuntos pesados en frío, texto ejecutivo breve (&lt;75 palabras) y opt-out legal garantizado.
          </div>
        </div>

        {/* Tipo de Correo */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Objetivo del Mensaje</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'intro', label: '1er Contacto (Frío)' },
              { id: 'followup', label: 'Seguimiento (+3d)' },
              { id: 'cotizacion', label: 'Cotización / Dossier' }
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setTipo(btn.id as any)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition ${
                  tipo === btn.id 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-[#131f38] border-[#233458] text-slate-400 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón para Redactar con Gemini */}
        {!cuerpo && (
          <div className="py-6 text-center">
            <button
              onClick={handleGenerarCopy}
              disabled={loading}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Redactando con Gemini...' : 'Generar Mensaje Hiperpersonalizado'}</span>
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
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cuerpo del Mensaje</label>
              <textarea
                rows={7}
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white leading-relaxed outline-none resize-none font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#162238] hover:bg-[#1e293b] border border-[#233458] text-slate-200 text-xs font-semibold transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                onClick={handleAbrirEnCliente}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
              >
                <Mail className="w-4 h-4" />
                <span>Abrir en Gmail / Mail y Avanzar ➔</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
