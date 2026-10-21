'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Lead } from '@/lib/types';

interface ProspectorPanelProps {
  onLeadsAgregados: (nuevosLeads: Lead[]) => void;
  creditos: number;
  onDescontarCreditos: (cantidad: number) => void;
}

export default function ProspectorPanel({
  onLeadsAgregados,
  creditos,
  onDescontarCreditos
}: ProspectorPanelProps) {
  const [criterio, setCriterio] = useState('');
  const [decisorTipo, setDecisorTipo] = useState('Jefe de Compras y Abastecimiento / Adquisiciones');
  const [limite, setLimite] = useState(10);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const handleProspectar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterio.trim()) {
      alert('Ingresa el rubro o tipo de empresas a buscar');
      return;
    }

    if (creditos < limite) {
      setFeedback({
        tipo: 'error',
        mensaje: `No tienes suficientes créditos (${creditos} disponibles). Necesitas ${limite} créditos.`
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/prospectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criterio: criterio.trim(),
          limite,
          decisorTipo
        })
      });

      const data = await res.json();
      if (data.success && data.leads) {
        onLeadsAgregados(data.leads);
        onDescontarCreditos(data.leads.length);
        setFeedback({
          tipo: 'success',
          mensaje: `🎉 ¡Éxito! Se descubrieron ${data.leads.length} empresas y se agregaron a la columna "Nuevo" del Kanban.`
        });
        setCriterio('');
      } else {
        setFeedback({
          tipo: 'error',
          mensaje: data.error || data.mensaje || 'Error ejecutando prospección.'
        });
      }
    } catch (err: any) {
      setFeedback({
        tipo: 'error',
        mensaje: 'Error de conexión: ' + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-[#0c1527] border border-[#1a2744] rounded-3xl p-8 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Prospector B2B Universal con IA</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Descubre empresas reales en Chile o Latinoamérica, identifica al tomador de decisión y agrégalas directamente a tu embudo.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleProspectar} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              ¿Qué tipo de empresas buscas?
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                placeholder="Ej: Constructoras de edificación en Santiago, Clínicas privadas, Hoteles boutique"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Perfil del Tomador de Decisión Objetivo
            </label>
            <select
              value={decisorTipo}
              onChange={(e) => setDecisorTipo(e.target.value)}
              className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-2xl p-3.5 text-sm text-white outline-none transition"
            >
              <option value="Jefe de Compras y Abastecimiento / Adquisiciones">Jefe de Compras y Abastecimiento (B2B)</option>
              <option value="Gerente General / Dueño / Fundador">Dueño / Fundador / Gerente General (PYME)</option>
              <option value="Gerente de Marketing / Director Comercial">Gerente de Marketing / Comercial</option>
              <option value="Gerente de Operaciones / Proyectos">Gerente de Operaciones / Proyectos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Cantidad a Descubrir por Lote
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 5, label: '5 Empresas', desc: 'Rápido (20s)' },
                { count: 10, label: '10 Empresas', desc: 'Recomendado (40s)' },
                { count: 15, label: '15 Empresas', desc: 'Lote Mayor (60s)' },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setLimite(item.count)}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    limite === item.count
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-[#131f38] border-[#233458] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Descubriendo empresas y decisores con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Iniciar Prospección y Enviar al CRM</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 text-sm ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {feedback.tipo === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>{feedback.mensaje}</div>
          </div>
        )}
      </div>
    </div>
  );
}
