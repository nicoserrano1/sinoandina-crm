'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw, Check } from 'lucide-react';
import { PipelineEtapa } from '@/lib/types';

interface ModalPersonalizarEtapasProps {
  isOpen: boolean;
  onClose: () => void;
  etapasActuales: PipelineEtapa[];
  onGuardarEtapas: (nuevasEtapas: PipelineEtapa[]) => void;
  onRestablecerDefecto: () => void;
}

const COLORES_DISPONIBLES = [
  'bg-blue-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-rose-500',
];

export default function ModalPersonalizarEtapas({
  isOpen,
  onClose,
  etapasActuales,
  onGuardarEtapas,
  onRestablecerDefecto
}: ModalPersonalizarEtapasProps) {
  const [etapas, setEtapas] = useState<PipelineEtapa[]>(etapasActuales);

  React.useEffect(() => {
    setEtapas(etapasActuales);
  }, [etapasActuales]);

  if (!isOpen) return null;

  const handleMover = (index: number, direccion: 'arriba' | 'abajo') => {
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= etapas.length) return;

    const copia = [...etapas];
    const temp = copia[index];
    copia[index] = copia[nuevoIndex];
    copia[nuevoIndex] = temp;
    setEtapas(copia);
  };

  const handleCambiarNombre = (index: number, nuevoNombre: string) => {
    const copia = [...etapas];
    copia[index] = { ...copia[index], nombre: nuevoNombre, id: nuevoNombre.trim() || copia[index].id };
    setEtapas(copia);
  };

  const handleCambiarColor = (index: number, color: string) => {
    const copia = [...etapas];
    copia[index] = { ...copia[index], dotColor: color };
    setEtapas(copia);
  };

  const handleEliminar = (index: number) => {
    if (etapas.length <= 2) {
      alert('Debes tener al menos 2 etapas en tu pipeline comercial.');
      return;
    }
    setEtapas(etapas.filter((_, i) => i !== index));
  };

  const handleAgregar = () => {
    const nuevoNombre = `Etapa ${etapas.length + 1}`;
    const nuevoColor = COLORES_DISPONIBLES[etapas.length % COLORES_DISPONIBLES.length];
    setEtapas([
      ...etapas,
      {
        id: nuevoNombre,
        nombre: nuevoNombre,
        dotColor: nuevoColor
      }
    ]);
  };

  const handleGuardar = () => {
    // Validar nombres no vacíos
    const invalidas = etapas.some(e => !e.nombre.trim());
    if (invalidas) {
      alert('Todas las etapas deben tener un nombre.');
      return;
    }
    onGuardarEtapas(etapas);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070d19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0C0F17] border border-white/[0.08] w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white">Personalizar Etapas del Pipeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adapta las columnas del embudo al proceso comercial exacto de tu empresa.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Etapas */}
        <div className="space-y-2.5 mb-5">
          {etapas.map((etapa, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 p-2 rounded-xl bg-[#11141D] border border-white/[0.06]"
            >
              {/* Controles de Reordenamiento */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMover(idx, 'arriba')}
                  className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition"
                  title="Subir"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === etapas.length - 1}
                  onClick={() => handleMover(idx, 'abajo')}
                  className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition"
                  title="Bajar"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* Selector de Color */}
              <div className="relative group">
                <div className={`w-3.5 h-3.5 rounded-full ${etapa.dotColor || 'bg-blue-500'} cursor-pointer ring-2 ring-white/10`} />
              </div>

              {/* Nombre de la Etapa */}
              <input
                type="text"
                value={etapa.nombre}
                onChange={(e) => handleCambiarNombre(idx, e.target.value)}
                placeholder="Nombre de la etapa..."
                className="flex-1 bg-transparent border-0 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 rounded-lg px-2 py-1"
              />

              {/* Botón Eliminar */}
              <button
                type="button"
                onClick={() => handleEliminar(idx)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Eliminar etapa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Botón Agregar Etapa */}
        <button
          type="button"
          onClick={handleAgregar}
          className="w-full mb-6 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03] text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agregar Nueva Etapa</span>
        </button>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('¿Restablecer las 6 etapas comerciales estándar?')) {
                onRestablecerDefecto();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer por Defecto</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
            >
              Guardar Etapas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
