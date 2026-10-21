'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { Lead } from '@/lib/types';

interface ModalNuevoLeadProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreado: (lead: Lead) => void;
}

export default function ModalNuevoLead({
  isOpen,
  onClose,
  onLeadCreado
}: ModalNuevoLeadProps) {
  const [empresa, setEmpresa] = useState('');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [decisor, setDecisor] = useState('');
  const [cargo, setCargo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [monto, setMonto] = useState('');
  const [partida, setPartida] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim() || !email.trim()) {
      alert('Empresa y Email son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa: empresa.trim(),
          url: url.trim(),
          email: email.trim(),
          decisor: decisor.trim() || 'Jefatura de Abastecimiento',
          cargo: cargo.trim() || 'Gerente de Adquisiciones',
          telefono: telefono.trim(),
          monto_clp: Number(monto) || 0,
          partida: partida.trim(),
          notas: notas.trim(),
          estado: 'Nuevo'
        })
      });

      const data = await res.json();
      if (data.success && data.lead) {
        onLeadCreado(data.lead);
        onClose();
      } else {
        alert(data.error || 'Error creando prospecto');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0c1527] border border-[#1a2744] w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1a2744]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-white">Nuevo Prospecto Manual</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#162238] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre de la Empresa *</label>
            <input
              type="text"
              required
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ej: Constructora Moller SpA"
              className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sitio Web</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://moller.cl"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Corporativo *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adquisiciones@moller.cl"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tomador de Decisión</label>
              <input
                type="text"
                value={decisor}
                onChange={(e) => setDecisor(e.target.value)}
                placeholder="Ej: Andrés Vial"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej: Gerente de Compras"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Monto Estimado (CLP)</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 25000000"
                className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Partida / Producto de Interés</label>
            <input
              type="text"
              value={partida}
              onChange={(e) => setPartida(e.target.value)}
              placeholder="Ej: Porcelanato 60x120, Sanitarios, Mobiliario"
              className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notas Comerciales / Bitácora</label>
            <textarea
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles sobre proyectos activos, fechas de licitación o contacto previo..."
              className="w-full bg-[#131f38] border border-[#233458] focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : '💾 Guardar Prospecto en Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
