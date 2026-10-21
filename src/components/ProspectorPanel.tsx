'use client';

import React, { useState } from 'react';
import { Search, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Lead } from '@/lib/types';

interface ProspectorPanelProps {
  onLeadsAgregados: (nuevosLeads: Lead[]) => void;
}

export default function ProspectorPanel({
  onLeadsAgregados
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
        setFeedback({
          tipo: 'success',
          mensaje: `Se descubrieron ${data.leads.length} empresas y se agregaron a la columna "Nuevos".`
        });
        setCriterio('');
      } else {
        setFeedback({
          tipo: 'error',
          mensaje: data.error || data.mensaje || 'Error ejecutando búsqueda.'
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
    <div className="max-w-xl mx-auto py-10">
      <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-8 shadow-xl">
        {/* Header Limpio */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400 mb-3.5">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Prospección de Empresas</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Descubre empresas activas y tomadores de decisión por industria para sumarlos a tu embudo comercial.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleProspectar} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sector o Industria
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                placeholder="Ej: Constructoras de edificación en Santiago, Clínicas privadas, Hoteles boutique"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tomador de Decisión Objetivo
            </label>
            <select
              value={decisorTipo}
              onChange={(e) => setDecisorTipo(e.target.value)}
              className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500/50 rounded-xl p-2.5 text-xs text-white outline-none transition cursor-pointer"
            >
              <option value="Jefe de Compras y Abastecimiento / Adquisiciones">Jefe de Compras y Abastecimiento</option>
              <option value="Gerente General / Dueño / Fundador">Gerente General / Dueño</option>
              <option value="Gerente de Marketing / Director Comercial">Gerente Comercial / Marketing</option>
              <option value="Gerente de Operaciones / Proyectos">Gerente de Operaciones / Proyectos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cantidad por Búsqueda
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { count: 5, label: '5 Empresas' },
                { count: 10, label: '10 Empresas' },
                { count: 15, label: '15 Empresas' },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setLimite(item.count)}
                  className={`p-2.5 rounded-xl border text-center transition text-xs font-medium ${
                    limite === item.count
                      ? 'bg-blue-600/15 border-blue-500/50 text-white font-semibold'
                      : 'bg-[#11141D] border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Buscando empresas y contactos...</span>
                </>
              ) : (
                <span>Iniciar Búsqueda y Agregar al Pipeline</span>
              )}
            </button>
          </div>
        </form>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`mt-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            {feedback.tipo === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            )}
            <div>{feedback.mensaje}</div>
          </div>
        )}
      </div>
    </div>
  );
}
