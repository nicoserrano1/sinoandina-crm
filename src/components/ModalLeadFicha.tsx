'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Building2 } from 'lucide-react';
import { Lead, LeadStatus, PipelineEtapa } from '@/lib/types';

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
  const [decisor, setDecisor] = useState('');
  const [cargo, setCargo] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [monto, setMonto] = useState('');
  const [partida, setPartida] = useState('');
  const [estado, setEstado] = useState<LeadStatus>('Nuevo');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

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
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

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
          notas
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

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C0F17] border border-white/[0.08] w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-white">{lead.empresa}</h3>
            </div>
            {lead.url && (
              <a 
                href={lead.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-blue-400 hover:underline mt-0.5 inline-block"
              >
                {lead.url}
              </a>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tomador de Decisión</label>
              <input
                type="text"
                value={decisor}
                onChange={(e) => setDecisor(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monto Estimado (CLP)</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estado en Pipeline</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as LeadStatus)}
                className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Partida / Producto de Interés</label>
            <input
              type="text"
              value={partida}
              onChange={(e) => setPartida(e.target.value)}
              className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notas y Bitácora Comercial</label>
            <textarea
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-[#11141D] border border-white/[0.08] focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none transition resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-between gap-3 border-t border-white/[0.06]">
            <button
              onClick={handleDescartar}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Descartar</span>
            </button>

            <button
              onClick={handleGuardar}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
