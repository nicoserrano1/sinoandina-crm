'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Building2,
  Users,
  Compass,
  ArrowUpRight,
  RotateCcw
} from 'lucide-react';
import { Lead } from '@/lib/types';

interface ProspectorPanelProps {
  onLeadsAgregados: (nuevosLeads: Lead[]) => void;
}

interface AnguloProspeccion {
  enfoque: string;
  query: string;
  justificacion: string;
}

interface AnalisisIA {
  empresa_detectada: string;
  propuesta_valor: string;
  perfil_cliente_ideal: string;
  decisores_sugeridos: string[];
  angulos_prospeccion: AnguloProspeccion[];
}

export default function ProspectorPanel({
  onLeadsAgregados
}: ProspectorPanelProps) {
  // Parámetros de búsqueda activa
  const [criterio, setCriterio] = useState('');
  const [decisorCargo, setDecisorCargo] = useState('Gerente General / Tomador de Decisión');
  const [limite, setLimite] = useState(10);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [leadsDescubiertos, setLeadsDescubiertos] = useState<Lead[]>([]);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Entrada de Inteligencia Universal: Web o Descripción
  const [modoEntrada, setModoEntrada] = useState<'web' | 'texto'>('web');
  const [inputWeb, setInputWeb] = useState('');
  const [inputDescripcion, setInputDescripcion] = useState('');
  const [loadingIA, setLoadingIA] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<AnalisisIA | null>(null);
  const [errorIA, setErrorIA] = useState<string | null>(null);

  // Analizar con IA (Universal para cualquier industria)
  const handleGenerarEstrategiaIA = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryPayload = modoEntrada === 'web' ? { url: inputWeb.trim() } : { descripcion: inputDescripcion.trim() };

    if (modoEntrada === 'web' && !inputWeb.trim()) {
      alert('Ingresa una dirección web para analizar.');
      return;
    }
    if (modoEntrada === 'texto' && !inputDescripcion.trim()) {
      alert('Describe brevemente lo que vende tu empresa o servicio.');
      return;
    }

    setLoadingIA(true);
    setErrorIA(null);

    try {
      const res = await fetch('/api/analizar-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryPayload)
      });

      const data = await res.json();
      if (data.success && data.analisis) {
        setAnalisisIA(data.analisis);
        // Si hay sugerencias de cargos, pre-seleccionar el primero
        if (data.analisis.decisores_sugeridos && data.analisis.decisores_sugeridos.length > 0) {
          setDecisorCargo(data.analisis.decisores_sugeridos[0]);
        }
      } else {
        setErrorIA(data.error || 'No se pudo generar la estrategia comercial.');
      }
    } catch (err: any) {
      setErrorIA('Error al conectar con el cerebro de IA: ' + err.message);
    } finally {
      setLoadingIA(false);
    }
  };

  // Ejecutar Prospección
  const handleProspectar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterio.trim()) {
      alert('Ingresa un criterio o sector para buscar empresas.');
      return;
    }

    setLoadingBusqueda(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/prospectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criterio: criterio.trim(),
          limite,
          decisorTipo: decisorCargo.trim(),
          contextoOferta: analisisIA ? `${analisisIA.empresa_detectada}: ${analisisIA.propuesta_valor}` : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.leads) {
        onLeadsAgregados(data.leads);
        setLeadsDescubiertos(data.leads);
        setFeedback({
          tipo: 'success',
          mensaje: `Se descubrieron ${data.leads.length} empresas y se agregaron automáticamente a tu Pipeline Comercial.`
        });
      } else {
        setFeedback({
          tipo: 'error',
          mensaje: data.error || data.mensaje || 'No se encontraron empresas con este criterio.'
        });
      }
    } catch (err: any) {
      setFeedback({
        tipo: 'error',
        mensaje: 'Error de conexión: ' + err.message
      });
    } finally {
      setLoadingBusqueda(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Encabezado General */}
      <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Explorador de Mercado B2B
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                  Universal
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                La IA analiza tu propuesta de valor y genera múltiples ángulos de prospección adaptados a cualquier rubro o industria.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: Cerebro Comercial con IA (Entrada Universal) */}
      <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white tracking-tight">
              1. Entrenar a la IA con tu Negocio (Opcional pero recomendado)
            </h3>
          </div>

          {/* Selector de Modo */}
          <div className="flex items-center gap-1 bg-[#11141D] p-1 rounded-xl border border-white/[0.08] text-xs">
            <button
              type="button"
              onClick={() => setModoEntrada('web')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                modoEntrada === 'web' ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Por Sitio Web
            </button>
            <button
              type="button"
              onClick={() => setModoEntrada('texto')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                modoEntrada === 'texto' ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Por Descripción
            </button>
          </div>
        </div>

        {/* Input dinámico según modo */}
        <form onSubmit={handleGenerarEstrategiaIA} className="mt-4 space-y-3">
          {modoEntrada === 'web' ? (
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputWeb}
                onChange={(e) => setInputWeb(e.target.value)}
                placeholder="Ingresa cualquier URL (ej: tuempresa.com, clínica, agencia, fábrica, SaaS, estudio...)"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          ) : (
            <div>
              <textarea
                rows={2}
                value={inputDescripcion}
                onChange={(e) => setInputDescripcion(e.target.value)}
                placeholder="Describe brevemente qué vende tu negocio o solución (ej: 'Software de nóminas para pymes de 20 a 200 empleados' o 'Agencia de marketing médico' o 'Distribuidor de packaging sustentable')"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition resize-none"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loadingIA}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-xs transition flex items-center gap-2 disabled:opacity-40"
            >
              {loadingIA ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                  <span>Analizando modelo y diseñando estrategias...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Analizar y Generar Opciones con IA</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorIA && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorIA}</span>
          </div>
        )}

        {/* Panel de Estrategias y Decisores de IA */}
        {analisisIA && (
          <div className="mt-5 p-4 rounded-xl bg-[#11141D] border border-amber-500/20 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <span className="text-xs font-bold text-white">
                  Estrategia Comercial: {analisisIA.empresa_detectada}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {analisisIA.propuesta_valor}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalisisIA(null)}
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Limpiar análisis"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Decisores Recomendados por la IA para esta oferta */}
            {analisisIA.decisores_sugeridos && analisisIA.decisores_sugeridos.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-amber-400" />
                  Tomadores de decisión identificados para tu oferta (haz clic para seleccionar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analisisIA.decisores_sugeridos.map((dec, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDecisorCargo(dec)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        decisorCargo === dec
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-semibold'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {dec}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Múltiples Ángulos de Prospección Generados */}
            {analisisIA.angulos_prospeccion && analisisIA.angulos_prospeccion.length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-amber-400" />
                  Ángulos y segmentos de mercado sugeridos (haz clic en cualquiera para autocompletar):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analisisIA.angulos_prospeccion.map((ang, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCriterio(ang.query);
                        document.getElementById('form-busqueda-directa')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-amber-500/[0.08] border border-white/[0.06] hover:border-amber-500/30 text-left transition group"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-300 flex items-center gap-1">
                          <span>{ang.enfoque}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium mt-1 truncate">
                        "{ang.query}"
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {ang.justificacion}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: Formulario de Búsqueda Libre & Ejecución */}
      <div id="form-busqueda-directa" className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white tracking-tight">
            2. Configurar y Ejecutar Prospección
          </h3>
        </div>

        <form onSubmit={handleProspectar} className="space-y-4">
          {/* Criterio Libre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sector, Rubro o Búsqueda Específica
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                placeholder="Escribe libremente cualquier sector (ej: Bufetes de abogados tributarios, Clínicas dentales en Viña del Mar, Fintechs en Chile, Empresas de packaging...)"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cargo / Tomador de Decisión Libre */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tomador de Decisión Objetivo (Escribe o elige)
              </label>
              <input
                type="text"
                value={decisorCargo}
                onChange={(e) => setDecisorCargo(e.target.value)}
                placeholder="Ej: Gerente de TI, Director Médico, Jefe de Operaciones, Dueño, CFO..."
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
              />
            </div>

            {/* Cantidad de Empresas */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cantidad de Empresas a Recolectar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { count: 5, label: '5' },
                  { count: 10, label: '10' },
                  { count: 15, label: '15' },
                  { count: 20, label: '20' }
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setLimite(item.count)}
                    className={`py-2 px-1 rounded-xl border text-center transition text-xs font-medium ${
                      limite === item.count
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-semibold'
                        : 'bg-[#11141D] border-white/[0.08] text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botón de Ejecución */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingBusqueda || !criterio.trim()}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_2px_12px_rgba(245,158,11,0.25)] transition hover:scale-[1.005] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingBusqueda ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Explorando mercado y recolectando empresas activas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Iniciar Prospección y Sumar al Pipeline</span>
                </>
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

        {/* Previsualización en Vivo de Leads Recién Descubiertos */}
        {leadsDescubiertos.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Empresas agregadas recientemente ({leadsDescubiertos.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {leadsDescubiertos.map((lead, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-[#11141D] border border-white/[0.06] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                      <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{lead.empresa}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {lead.decisor} <span className="text-slate-500">· {lead.cargo}</span>
                    </p>
                    {lead.partida && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400">
                        {lead.partida}
                      </span>
                    )}
                  </div>
                  {lead.email && (
                    <span className="text-[10px] text-blue-400 mt-2 truncate block">
                      {lead.email}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
