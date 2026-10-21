'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Target, 
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { Lead } from '@/lib/types';

interface ProspectorPanelProps {
  onLeadsAgregados: (nuevosLeads: Lead[]) => void;
}

interface WebAnalisisResult {
  empresa: string;
  propuesta_valor: string;
  perfil_cliente_ideal: string;
  decisor_recomendado: string;
  sugerencias_busqueda: string[];
}

const NICHOS_POPULARES = [
  { label: '🏗️ Constructoras Habitacionales RM', query: 'Constructoras de edificación y vivienda en Santiago' },
  { label: '🏢 Desarrolladoras Inmobiliarias', query: 'Desarrolladoras y oficinas inmobiliarias en Chile' },
  { label: '🏭 Plantas e Industrias Productivas', query: 'Empresas industriales y fábricas manufactureras en Santiago' },
  { label: '❄️ Climatización & Obras Técnicas', query: 'Empresas de climatización, HVAC e instalaciones sanitarias' },
  { label: '🏥 Clínicas & Centros Médicos', query: 'Clínicas privadas y centros hospitalarios en Chile' },
  { label: '📦 Operadores Logísticos', query: 'Centros de distribución y empresas de bodegaje industrial' },
];

export default function ProspectorPanel({
  onLeadsAgregados
}: ProspectorPanelProps) {
  // Estados para Búsqueda
  const [criterio, setCriterio] = useState('');
  const [decisorTipo, setDecisorTipo] = useState('Jefe de Compras y Abastecimiento / Adquisiciones');
  const [limite, setLimite] = useState(10);
  const [loadingBusqueda, setLoadingBusqueda] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Estados para Analizador de Sitio Web
  const [webUrl, setWebUrl] = useState('');
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [analisisWeb, setAnalisisWeb] = useState<WebAnalisisResult | null>(null);
  const [errorAnalisis, setErrorAnalisis] = useState<string | null>(null);

  // Analizar sitio web de referencia
  const handleAnalizarWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl.trim()) {
      alert('Ingresa una dirección web para analizar');
      return;
    }

    setLoadingAnalisis(true);
    setErrorAnalisis(null);
    setAnalisisWeb(null);

    try {
      const res = await fetch('/api/analizar-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webUrl.trim() })
      });

      const data = await res.json();
      if (data.success && data.analisis) {
        setAnalisisWeb(data.analisis);
        // Si el análisis sugiere un tomador de decisión, sugerirlo
        if (data.analisis.decisor_recomendado) {
          setDecisorTipo(data.analisis.decisor_recomendado);
        }
      } else {
        setErrorAnalisis(data.error || 'No se pudo analizar el sitio web.');
      }
    } catch (err: any) {
      setErrorAnalisis('Error de conexión al analizar: ' + err.message);
    } finally {
      setLoadingAnalisis(false);
    }
  };

  // Ejecutar Prospección
  const handleProspectar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterio.trim()) {
      alert('Ingresa el rubro o tipo de empresas a buscar');
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
          decisorTipo,
          contextoOferta: analisisWeb ? analisisWeb.propuesta_valor : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.leads) {
        onLeadsAgregados(data.leads);
        setFeedback({
          tipo: 'success',
          mensaje: `¡Éxito! Se descubrieron ${data.leads.length} empresas y se agregaron automáticamente a la columna "Nuevos" de tu Pipeline.`
        });
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
      setLoadingBusqueda(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header General */}
      <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Explorador B2B & Scraping
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Colmena Scout
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Recolecta prospectos calificados en tu mercado y agrégalos en tiempo real a tu embudo comercial.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MÓDULO 1: Analizador de Sitio Web de Referencia */}
      <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              1. Analizar Sitio Web de Referencia (Tu Empresa o Cliente Modelo)
            </h3>
            <p className="text-[11px] text-slate-400">
              Ingresa el enlace de tu sitio web (o el de un cliente/competidor) para que el explorador entienda qué ofreces y te dé ideas exactas de búsqueda.
            </p>
          </div>
        </div>

        {/* Input de URL */}
        <form onSubmit={handleAnalizarWeb} className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
              placeholder="Ej: sinoandina.cl, constructora-moller.cl, tu-empresa.com"
              className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loadingAnalisis || !webUrl.trim()}
            className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loadingAnalisis ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                <span>Analizando web...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Analizar y Extraer Ideas</span>
              </>
            )}
          </button>
        </form>

        {/* Error en Análisis */}
        {errorAnalisis && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorAnalisis}</span>
          </div>
        )}

        {/* Resultado del Análisis Inteligente */}
        {analisisWeb && (
          <div className="mt-4 p-4 rounded-xl bg-[#11141D] border border-amber-500/20 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">
                  Diagnóstico Comercial: {analisisWeb.empresa || webUrl}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                Análisis Completado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Propuesta de Valor Detectada
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {analisisWeb.propuesta_valor}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Perfil de Cliente Ideal (ICP)
                </span>
                <p className="text-slate-300 leading-relaxed font-medium">
                  {analisisWeb.perfil_cliente_ideal}
                </p>
              </div>
            </div>

            {/* Ideas de Búsqueda Recomendadas */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-amber-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Ideas sugeridas para prospectar (haz clic en cualquiera para autocompletar):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analisisWeb.sugerencias_busqueda?.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCriterio(sug);
                      // Scroll suave al formulario de búsqueda
                      document.getElementById('form-prospeccion')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-left text-xs px-3 py-1.5 rounded-lg bg-amber-500/[0.08] hover:bg-amber-500/[0.18] border border-amber-500/20 text-amber-200 transition flex items-center gap-1.5 hover:scale-[1.01]"
                  >
                    <span>+</span>
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MÓDULO 2: Formulario de Prospección & Scraping */}
      <div id="form-prospeccion" className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">
              2. Parámetros de Búsqueda y Scraping
            </h3>
            <p className="text-[11px] text-slate-400">
              Escribe el sector objetivo o selecciona una de las ideas sugeridas para iniciar la recolección.
            </p>
          </div>
        </div>

        {/* Nichos Rápidos Populares */}
        <div className="mb-4">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
            Sugerencias Populares B2B
          </span>
          <div className="flex flex-wrap gap-1.5">
            {NICHOS_POPULARES.map((nicho, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCriterio(nicho.query)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                  criterio === nicho.query
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-semibold'
                    : 'bg-[#11141D] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {nicho.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleProspectar} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sector o Criterio de Búsqueda
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                placeholder="Ej: Constructoras de edificación en altura en Santiago"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tomador de Decisión Objetivo
              </label>
              <select
                value={decisorTipo}
                onChange={(e) => setDecisorTipo(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl p-2.5 text-xs text-white outline-none transition cursor-pointer"
              >
                <option value="Jefe de Compras y Abastecimiento / Adquisiciones">Jefe de Compras y Abastecimiento</option>
                <option value="Gerente de Operaciones / Proyectos / Obra">Gerente de Operaciones / Proyectos</option>
                <option value="Gerente General / Dueño / Fundador">Gerente General / Fundador</option>
                <option value="Gerente Comercial / Director de Ventas">Gerente Comercial / Ventas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cantidad de Empresas a Recolectar
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 5, label: '5 Empresas' },
                  { count: 10, label: '10 Empresas' },
                  { count: 15, label: '15 Empresas' },
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingBusqueda || !criterio.trim()}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_2px_12px_rgba(245,158,11,0.25)] transition hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingBusqueda ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Recolectando empresas, sitios web y decisores...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Recolectar y Agregar al Pipeline</span>
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
      </div>
    </div>
  );
}
