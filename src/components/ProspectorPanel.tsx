'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Building2,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Search,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { Lead } from '@/lib/types';
import { getLinkedInUrl, isGenericDecisor } from '@/lib/linkedin';
import { resolveLeadEmails, classifyPhone } from '@/lib/email-patterns';

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
  // Wizard Step Control (1, 2, 3)
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);

  // Paso 1: Entrada de Referencia (Web o Descripción)
  const [modoReferencia, setModoReferencia] = useState<'web' | 'texto'>('web');
  const [inputWeb, setInputWeb] = useState('sinoandina.cl');
  const [inputDescripcion, setInputDescripcion] = useState('');
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [analisisIA, setAnalisisIA] = useState<AnalisisIA | null>(null);
  const [errorAnalisis, setErrorAnalisis] = useState<string | null>(null);

  // Paso 2: Estrategia Seleccionada & Decisor
  const [criterio, setCriterio] = useState('');
  const [decisorCargo, setDecisorCargo] = useState('Jefe de Adquisiciones / Gerente de Operaciones');
  const [anguloSeleccionado, setAnguloSeleccionado] = useState<number | null>(null);

  // Paso 3: Ejecución de Scraping & Resultados
  const [limite, setLimite] = useState(10);
  const [loadingScraping, setLoadingScraping] = useState(false);
  const [leadsDescubiertos, setLeadsDescubiertos] = useState<Lead[]>([]);
  const [feedbackScraping, setFeedbackScraping] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  // Acción Paso 1: Analizar Sitio Web o Referencia
  const handleAnalizarReferencia = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = modoReferencia === 'web' 
      ? { url: inputWeb.trim() } 
      : { descripcion: inputDescripcion.trim() };

    if (modoReferencia === 'web' && !inputWeb.trim()) {
      alert('Ingresa la dirección web de tu empresa, competidor o cliente modelo.');
      return;
    }
    if (modoReferencia === 'texto' && !inputDescripcion.trim()) {
      alert('Describe brevemente lo que vende tu empresa o servicio.');
      return;
    }

    setLoadingAnalisis(true);
    setErrorAnalisis(null);

    try {
      const res = await fetch('/api/analizar-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.analisis) {
        setAnalisisIA(data.analisis);
        
        // Pre-cargar valores inteligentes para el Paso 2
        if (data.analisis.decisores_sugeridos && data.analisis.decisores_sugeridos.length > 0) {
          setDecisorCargo(data.analisis.decisores_sugeridos[0]);
        }
        if (data.analisis.angulos_prospeccion && data.analisis.angulos_prospeccion.length > 0) {
          setCriterio(data.analisis.angulos_prospeccion[0].query);
          setAnguloSeleccionado(0);
        }

        // Avanzar al Paso 2 automáticamente
        setPasoActual(2);
      } else {
        setErrorAnalisis(data.error || 'No se pudo analizar la referencia. Puedes continuar con búsqueda directa.');
      }
    } catch (err: any) {
      setErrorAnalisis('Error de conexión con la IA: ' + err.message);
    } finally {
      setLoadingAnalisis(false);
    }
  };

  // Saltar análisis y configurar búsqueda libre directamente en Paso 2
  const handleSaltarPaso1 = () => {
    if (!criterio) {
      setCriterio('Empresas y corporativos en Santiago');
    }
    setPasoActual(2);
  };

  // Acción Paso 2: Confirmar parámetros y avanzar a Ejecución
  const handleContinuarAPaso3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterio.trim()) {
      alert('Debes definir un criterio de búsqueda.');
      return;
    }
    setPasoActual(3);
  };

  // Acción Paso 3: Ejecutar Scraping y Prospección en Vivo
  const handleEjecutarScraping = async () => {
    setLoadingScraping(true);
    setFeedbackScraping(null);
    setLeadsDescubiertos([]);

    try {
      const res = await fetch('/api/prospectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criterio: criterio.trim(),
          limite,
          decisorTipo: decisorCargo.trim(),
          contextoOferta: analisisIA 
            ? `${analisisIA.empresa_detectada}: ${analisisIA.propuesta_valor}`
            : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.leads) {
        onLeadsAgregados(data.leads);
        setLeadsDescubiertos(data.leads);
        setFeedbackScraping({
          tipo: 'success',
          mensaje: `¡Excelente! Se descubrieron ${data.leads.length} empresas y se sumaron en tiempo real a tu Pipeline Comercial.`
        });
      } else {
        setFeedbackScraping({
          tipo: 'error',
          mensaje: data.error || data.mensaje || 'No se encontraron empresas con este criterio.'
        });
      }
    } catch (err: any) {
      setFeedbackScraping({
        tipo: 'error',
        mensaje: 'Error de conexión: ' + err.message
      });
    } finally {
      setLoadingScraping(false);
    }
  };

  // Reiniciar Wizard desde cero
  const handleReiniciar = () => {
    setPasoActual(1);
    setAnalisisIA(null);
    setCriterio('');
    setLeadsDescubiertos([]);
    setFeedbackScraping(null);
    setErrorAnalisis(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Stepper Header (Progreso en 3 Pasos Clave) */}
      <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Prospección Guiada con Inteligencia Artificial
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sigue el orden de 3 pasos para recolectar clientes con máxima precisión.
            </p>
          </div>
          {pasoActual > 1 && (
            <button
              onClick={handleReiniciar}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.04] transition"
              title="Comenzar nueva prospección"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Empezar de nuevo</span>
            </button>
          )}
        </div>

        {/* Indicador de 3 Pasos */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Paso 1 Indicator */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
            pasoActual === 1 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold' 
              : pasoActual > 1
                ? 'bg-white/[0.03] border-white/[0.08] text-slate-300'
                : 'bg-white/[0.02] border-white/[0.04] text-slate-600'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              pasoActual === 1 
                ? 'bg-amber-500 text-slate-950' 
                : pasoActual > 1 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-white/[0.06] text-slate-500'
            }`}>
              {pasoActual > 1 ? '✓' : '1'}
            </div>
            <span className="truncate">1. Referencia</span>
          </div>

          {/* Paso 2 Indicator */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
            pasoActual === 2 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold' 
              : pasoActual > 2
                ? 'bg-white/[0.03] border-white/[0.08] text-slate-300'
                : 'bg-white/[0.02] border-white/[0.04] text-slate-600'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              pasoActual === 2 
                ? 'bg-amber-500 text-slate-950' 
                : pasoActual > 2 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-white/[0.06] text-slate-500'
            }`}>
              {pasoActual > 2 ? '✓' : '2'}
            </div>
            <span className="truncate">2. Estrategia & Decisor</span>
          </div>

          {/* Paso 3 Indicator */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
            pasoActual === 3 
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold' 
              : 'bg-white/[0.02] border-white/[0.04] text-slate-600'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              pasoActual === 3 ? 'bg-amber-500 text-slate-950' : 'bg-white/[0.06] text-slate-500'
            }`}>
              3
            </div>
            <span className="truncate">3. Recolección & Leads</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PASO 1: PUNTO DE REFERENCIA (Web de competencia, cliente modelo o propia) */}
      {/* ========================================================================= */}
      {pasoActual === 1 && (
        <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Paso 1 de 3
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              ¿Qué referencia tomaremos para perfilar a tus clientes ideales?
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              La IA analizará esta referencia para detectar qué empresas tienen necesidad de compra y qué directivos toman las decisiones. Puedes usar:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-[11px] text-slate-300">
              <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <strong className="text-white block mb-0.5">🌐 Competidor Líder:</strong>
                Para clonar y captar clientes que ya le compran a tu competencia.
              </li>
              <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <strong className="text-white block mb-0.5">⭐ Cliente Modelo:</strong>
                Una empresa que amas como cliente y quieres buscar más similares.
              </li>
              <li className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <strong className="text-white block mb-0.5">🏢 Tu Propia Web:</strong>
                Para extraer tus compradores naturales y decisores clave.
              </li>
            </ul>
          </div>

          {/* Selector de Modo */}
          <div className="flex items-center gap-1 bg-[#11141D] p-1 rounded-xl border border-white/[0.08] text-xs max-w-xs">
            <button
              type="button"
              onClick={() => setModoReferencia('web')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                modoReferencia === 'web' ? 'bg-white/[0.08] text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sitio Web de Referencia
            </button>
            <button
              type="button"
              onClick={() => setModoReferencia('texto')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                modoReferencia === 'texto' ? 'bg-white/[0.08] text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Describir en Texto
            </button>
          </div>

          <form onSubmit={handleAnalizarReferencia} className="space-y-4">
            {modoReferencia === 'web' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL del Sitio Web de Referencia
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inputWeb}
                    onChange={(e) => setInputWeb(e.target.value)}
                    placeholder="Ej: sinoandina.cl, empresa-competidora.com, cliente-modelo.cl"
                    className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Describe qué solución o producto se vende
                </label>
                <textarea
                  rows={3}
                  required
                  value={inputDescripcion}
                  onChange={(e) => setInputDescripcion(e.target.value)}
                  placeholder="Ej: 'Suministramos materiales de terminación e importación directa desde fábrica para constructoras e inmobiliarias' o 'Software SaaS de nóminas para pymes de 20 a 100 empleados'..."
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition resize-none"
                />
              </div>
            )}

            {errorAnalisis && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorAnalisis}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaltarPaso1}
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Saltar análisis y configurar búsqueda libre ➜
              </button>

              <button
                type="submit"
                disabled={loadingAnalisis}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_2px_12px_rgba(245,158,11,0.25)] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingAnalisis ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Analizando modelo y compradores...</span>
                  </>
                ) : (
                  <>
                    <span>Analizar Referencia y Avanzar al Paso 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 2: ESTRATEGIA DE PROSPECCIÓN & DECISOR (Validación Inteligente)     */}
      {/* ========================================================================= */}
      {pasoActual === 2 && (
        <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Paso 2 de 3
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Afinar el Segmento de Mercado y Tomador de Decisión
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Selecciona uno de los ángulos estratégicos generados o ajusta los parámetros a tu preferencia.
            </p>
          </div>

          {/* Resumen del Diagnóstico de la Referencia */}
          {analisisIA && (
            <div className="p-3.5 rounded-xl bg-[#11141D] border border-white/[0.06] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Referencia: {analisisIA.empresa_detectada || inputWeb}</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  Perfil Analizado
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-slate-400 font-medium">Propuesta:</strong> {analisisIA.propuesta_valor}
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                <strong className="text-slate-400 font-medium">Compradores Ideales:</strong> {analisisIA.perfil_cliente_ideal}
              </p>
            </div>
          )}

          <form onSubmit={handleContinuarAPaso3} className="space-y-4">
            {/* A) Selección de Ángulo Estratégico */}
            {analisisIA?.angulos_prospeccion && analisisIA.angulos_prospeccion.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>Elige un Ángulo Estratégico para esta Búsqueda:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analisisIA.angulos_prospeccion.map((ang, idx) => {
                    const isSelected = anguloSeleccionado === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setAnguloSeleccionado(idx);
                          setCriterio(ang.query);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/[0.12] border-amber-500/50 ring-1 ring-amber-500/40'
                            : 'bg-[#11141D] border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className={isSelected ? 'text-amber-300' : 'text-slate-200'}>
                            {ang.enfoque}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-white font-medium mt-1 truncate">
                          "{ang.query}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {ang.justificacion}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Criterio de Búsqueda Editable */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Criterio o Sector de Prospección (Editable)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={criterio}
                  onChange={(e) => {
                    setCriterio(e.target.value);
                    setAnguloSeleccionado(null);
                  }}
                  placeholder="Ej: Constructoras en Santiago con proyectos habitacionales"
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* B) Tomador de Decisión */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Área Directiva o Perfil de Interés (Opcional)</span>
                </label>
                <span className="text-[10px] text-slate-500">
                  Cero nombres inventados · Búsqueda LinkedIn integrada
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                No es necesario forzar un cargo único. La IA explorará cargos directivos variados y te dará un enlace directo a LinkedIn para cada empresa.
              </p>

              {/* Chips sugeridos por la IA */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => setDecisorCargo('')}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    !decisorCargo
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-semibold'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  ✨ Cargos variados (Recomendado)
                </button>
                {analisisIA?.decisores_sugeridos && analisisIA.decisores_sugeridos.map((dec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDecisorCargo(dec)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      decisorCargo === dec
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 font-semibold'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                    }`}
                  >
                    {dec}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={decisorCargo}
                onChange={(e) => setDecisorCargo(e.target.value)}
                placeholder="Opcional: ej. Gerente de Operaciones, Director de Compras... (o déjalo en blanco)"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Botones de Navegación */}
            <div className="pt-3 flex items-center justify-between gap-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setPasoActual(1)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al Paso 1</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center gap-2"
              >
                <span>Avanzar a Recolección</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASO 3: EJECUCIÓN DE SCRAPING & RESULTADOS EN VIVO                        */}
      {/* ========================================================================= */}
      {pasoActual === 3 && (
        <div className="bg-[#0C0F17] border border-white/[0.06] rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Paso 3 de 3
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Lanzar Prospección & Recolectar Empresas
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Confirmaremos los parámetros y el explorador saldrá a recolectar empresas activas, datos y decisores.
            </p>
          </div>

          {/* Resumen de la Orden de Prospección */}
          <div className="p-4 rounded-xl bg-[#11141D] border border-white/[0.06] space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-slate-400">Sector / Criterio:</span>
              <strong className="text-white text-right font-semibold">{criterio}</strong>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-slate-400">Área / Cargo de Interés:</span>
              <strong className="text-amber-300 font-semibold">
                {decisorCargo || 'Cargos Directivos Variados (Sin restricción)'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Destino:</span>
              <span className="text-emerald-400 font-semibold">Columna "Nuevos" en Pipeline</span>
            </div>
          </div>

          {/* Cantidad de Empresas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cantidad de Empresas a Recolectar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { count: 5, label: '5 Empresas' },
                { count: 10, label: '10 Empresas' },
                { count: 15, label: '15 Empresas' },
                { count: 20, label: '20 Empresas' }
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

          {/* Botón de Ejecución */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleEjecutarScraping}
              disabled={loadingScraping}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_2px_15px_rgba(245,158,11,0.3)] transition hover:scale-[1.005] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingScraping ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Recolectando empresas activas, sitios web y decisores...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Iniciar Prospección y Enviar al Pipeline ({limite} Empresas)</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback */}
          {feedbackScraping && (
            <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              feedbackScraping.tipo === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}>
              {feedbackScraping.tipo === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div>{feedbackScraping.mensaje}</div>
            </div>
          )}

          {/* Resultados en Vivo */}
          {leadsDescubiertos.length > 0 && (
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Empresas Recolectadas ({leadsDescubiertos.length})
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Listas en tu Kanban
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leadsDescubiertos.map((lead, idx) => {
                  const linkedinUrl = getLinkedInUrl(lead);
                  const isGeneric = isGenericDecisor(lead.decisor);

                  return (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#11141D] border border-white/[0.06] flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white truncate">{lead.empresa}</span>
                          {lead.url && (
                            <a
                              href={lead.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-amber-400 p-0.5 transition"
                              title="Sitio web oficial"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-slate-200 truncate">
                              {lead.decisor}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {lead.cargo}
                            </p>
                          </div>

                          <a
                            href={linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-[#0077B5]/15 hover:bg-[#0077B5]/30 border border-[#0077B5]/30 text-sky-400 text-[10px] font-bold flex items-center gap-1 transition flex-shrink-0"
                            title={isGeneric ? `Buscar directivos de ${lead.empresa} en LinkedIn` : `Abrir perfil de ${lead.decisor} (${lead.empresa}) en LinkedIn`}
                          >
                            <span>in</span>
                            <span>{isGeneric ? "LinkedIn" : "Ver perfil"}</span>
                          </a>
                        </div>

                        {lead.partida && (
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-amber-300 font-medium border border-white/[0.06]">
                            {lead.partida}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-white/[0.04] space-y-1 text-[10px]">
                        {(() => {
                          const emails = resolveLeadEmails(lead);
                          const phone = classifyPhone(lead.telefono);

                          return (
                            <>
                              {emails.length > 0 && (
                                <div className="flex items-center justify-between gap-1 text-slate-300">
                                  <span className="truncate">{emails[0].email}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${emails[0].badgeColor}`}>
                                    {emails[0].badgeLabel}
                                  </span>
                                </div>
                              )}
                              {emails.length > 1 && (
                                <div className="flex items-center justify-between gap-1 text-slate-400 pl-2">
                                  <span className="truncate">{emails[1].email}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${emails[1].badgeColor}`}>
                                    {emails[1].badgeLabel}
                                  </span>
                                </div>
                              )}
                              {phone.numero && (
                                <div className="flex items-center justify-between gap-1 text-slate-400 pt-0.5">
                                  <span className="truncate">{phone.numero}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border flex-shrink-0 ${phone.badgeColor}`}>
                                    {phone.badgeLabel}
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navegación Inferior */}
          <div className="pt-3 flex items-center justify-between border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setPasoActual(2)}
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ajustar Criterio (Paso 2)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
