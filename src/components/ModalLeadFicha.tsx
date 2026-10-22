'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Building2, 
  Mail, 
  MessageSquare, 
  Clock, 
  Send, 
  Phone,
  FileText,
  Sparkles
} from 'lucide-react';
import { Lead, LeadStatus, PipelineEtapa, Actividad } from '@/lib/types';
import { getLinkedInUrl, isGenericDecisor, extractLinkedInFromNotes } from '@/lib/linkedin';
import { generateExecutiveEmails, isGenericEmail, resolveLeadEmails, classifyPhone } from '@/lib/email-patterns';

interface ModalLeadFichaProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadActualizado: (lead: Lead) => void;
  onLeadDescartado: (id: string) => void;
  etapas?: PipelineEtapa[];
}

const ESTADOS_DISPONIBLES: LeadStatus[] = [
  'Nuevo',
  'Contactado',
  'Seguimiento',
  'En Reunión',
  'Cotizado',
  'Cerrado Ganado',
  'Descartado'
];

export default function ModalLeadFicha({
  lead,
  isOpen,
  onClose,
  onLeadActualizado,
  onLeadDescartado,
  etapas
}: ModalLeadFichaProps) {
  // Datos del Lead
  const [decisor, setDecisor] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [monto, setMonto] = useState('');
  const [partida, setPartida] = useState('');
  const [estado, setEstado] = useState<LeadStatus>('Nuevo');
  const [notas, setNotas] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Historial de Actividades
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loadingActividades, setLoadingActividades] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);

  // Cargar datos y actividades
  useEffect(() => {
    if (lead) {
      setDecisor(lead.decisor || '');
      setCargo(lead.cargo || '');
      setEmail(lead.email || '');
      setTelefono(lead.telefono || '');
      setMonto(lead.monto_clp ? String(lead.monto_clp) : '');
      setPartida(lead.partida || '');
      setEstado(lead.estado || 'Nuevo');
      setNotas(lead.notas || '');
      setLinkedinUrl(lead.linkedin_url || extractLinkedInFromNotes(lead.notas) || '');

      fetchActividades(lead.id);
    }
  }, [lead]);

  const fetchActividades = async (leadId: string) => {
    try {
      setLoadingActividades(true);
      const res = await fetch(`/api/actividades?lead_id=${leadId}`);
      const data = await res.json();
      if (data.actividades) {
        setActividades(data.actividades);
      }
    } catch (e) {
      console.error('Error cargando historial de actividades:', e);
    } finally {
      setLoadingActividades(false);
    }
  };

  if (!isOpen || !lead) return null;

  const activeLinkedinUrl = getLinkedInUrl({
    empresa: lead.empresa,
    decisor,
    cargo,
    linkedin_url: linkedinUrl,
    notas
  });
  const isGeneric = isGenericDecisor(decisor);
  const allLeadEmails = resolveLeadEmails({ email, decisor, url: lead.url });
  const phoneInfo = classifyPhone(telefono);

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          decisor,
          cargo,
          email,
          telefono,
          monto_clp: Number(monto) || 0,
          partida,
          estado,
          notas,
          linkedin_url: linkedinUrl.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.lead) {
        onLeadActualizado(data.lead);
        onClose();
      } else {
        alert(data.error || 'Error al actualizar');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDescartar = async () => {
    if (!confirm('¿Deseas descartar este prospecto del pipeline comercial?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          estado: 'Descartado'
        })
      });
      const data = await res.json();
      if (data.success) {
        onLeadDescartado(lead.id);
        onClose();
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    setGuardandoNota(true);
    try {
      const res = await fetch('/api/actividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          tipo: 'nota',
          descripcion: nuevaNota.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.actividad) {
        setActividades([data.actividad, ...actividades]);
        setNuevaNota('');
      }
    } catch (e: any) {
      alert('Error registrando nota: ' + e.message);
    } finally {
      setGuardandoNota(false);
    }
  };

  const renderBadgeTipo = (tipo: string) => {
    switch (tipo) {
      case 'correo':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
            <Mail className="w-3 h-3" />
            <span>Correo</span>
          </span>
        );
      case 'whatsapp':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <Phone className="w-3 h-3" />
            <span>WhatsApp</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <FileText className="w-3 h-3" />
            <span>Nota Interna</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C0F17] border border-white/[0.08] w-full max-w-4xl rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{lead.empresa}</h3>
                {lead.url && (
                  <a 
                    href={lead.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-400 hover:underline"
                  >
                    {lead.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Creado el {new Date(lead.created_at).toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido en 2 Columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Datos Comerciales del Prospecto */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Información de Contacto & Trato
              </span>

              <a
                href={activeLinkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 hover:underline"
                title={isGeneric ? "Buscar directivos en LinkedIn" : `Abrir perfil de ${decisor} en LinkedIn`}
              >
                <span className="font-bold">in</span>
                <span>{isGeneric ? "Buscar directivos en LinkedIn ➜" : `Abrir perfil de ${decisor} en LinkedIn ➜`}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tomador de Decisión</label>
                <input
                  type="text"
                  value={decisor}
                  onChange={(e) => setDecisor(e.target.value)}
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo</label>
                <input
                  type="text"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
            </div>

            {/* Enlace de Perfil de LinkedIn editable */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-sky-400">in</span>
                  <span>Enlace de Perfil en LinkedIn</span>
                </span>
                {activeLinkedinUrl && (
                  <a
                    href={activeLinkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Abrir perfil recomendado ↗</span>
                  </a>
                )}
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/... o enlace directo a su perfil"
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Principal</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Teléfono</label>
                  {phoneInfo.numero && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${phoneInfo.badgeColor}`} title={phoneInfo.descripcion}>
                      {phoneInfo.badgeLabel}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
            </div>

            {/* Transparencia y Múltiples Correos del Lead */}
            {allLeadEmails.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Correos Detectados vs Estimados por Patrón IA:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {allLeadEmails.length} opciones disponibles
                  </span>
                </div>

                <div className="space-y-1.5">
                  {allLeadEmails.map((item, idx) => {
                    const isSelected = email.toLowerCase() === item.email.toLowerCase();
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition ${
                          isSelected
                            ? 'bg-amber-500/[0.12] border-amber-500/40 ring-1 ring-amber-500/30'
                            : 'bg-[#11141D] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                              {item.email}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                              {item.badgeLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.descripcion}
                          </p>
                        </div>

                        {!isSelected ? (
                          <button
                            type="button"
                            onClick={() => setEmail(item.email)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[10px] font-bold border border-white/[0.08] transition flex-shrink-0"
                            title="Asignar como correo principal de este contacto"
                          >
                            Usar este
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 flex-shrink-0 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            <span>Principal ✓</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Estimado (CLP)</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estado en Pipeline</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as LeadStatus)}
                  className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition cursor-pointer"
                >
                  {etapas && etapas.length > 0 ? (
                    <>
                      {etapas.map((est) => (
                        <option key={est.id} value={est.id}>{est.nombre}</option>
                      ))}
                      <option value="Descartado">Descartado</option>
                    </>
                  ) : (
                    ESTADOS_DISPONIBLES.map((est) => (
                      <option key={est} value={est}>{est}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Área de Interés / Partida</label>
              <input
                type="text"
                value={partida}
                onChange={(e) => setPartida(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas Generales</label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl p-2.5 text-xs text-white outline-none transition resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleDescartar}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Descartar</span>
              </button>

              <button
                type="button"
                onClick={handleGuardar}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>

          {/* Columna Derecha: Historial de Comunicaciones & Actividad (Tipo Chat) */}
          <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                Historial de Comunicaciones ({actividades.length})
              </span>
            </div>

            {/* Timeline Thread */}
            <div className="flex-1 min-h-[260px] max-h-[340px] overflow-y-auto space-y-2.5 pr-1 mb-3">
              {loadingActividades ? (
                <div className="h-40 flex items-center justify-center text-xs text-slate-500">
                  Cargando historial...
                </div>
              ) : actividades.length === 0 ? (
                <div className="h-48 border border-dashed border-white/[0.06] rounded-xl flex flex-col items-center justify-center text-center p-4 text-xs text-slate-500">
                  <MessageSquare className="w-5 h-5 mb-1.5 text-slate-600" />
                  <p>No hay mensajes ni actividades registradas aún.</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    Envía un correo desde el Kanban o escribe una nota abajo para iniciar el historial.
                  </p>
                </div>
              ) : (
                actividades.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-[#11141D] border border-white/[0.06] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      {renderBadgeTipo(act.tipo)}
                      <span className="text-[10px] text-slate-500">
                        {new Date(act.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs whitespace-pre-wrap font-medium leading-relaxed">
                      {act.descripcion}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Input para agregar notas rápidas / bitácora */}
            <form onSubmit={handleAgregarNota} className="mt-auto pt-2 border-t border-white/[0.06] flex gap-2">
              <input
                type="text"
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                placeholder="Escribe una nota rápida o resumen de llamada..."
                className="flex-1 bg-[#11141D] border border-white/[0.08] focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={guardandoNota || !nuevaNota.trim()}
                className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold border border-white/[0.08] transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <Send className="w-3 h-3 text-amber-400" />
                <span>Registrar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
