'use client';

import React from 'react';
import { Check, Zap, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';

interface PlanesPanelProps {
  creditosActuales: number;
  onRecargar: (creditos: number) => void;
}

export default function PlanesPanel({ creditosActuales, onRecargar }: PlanesPanelProps) {
  const planes = [
    {
      nombre: 'Starter',
      precio: '$25.000',
      periodo: 'CLP / mes',
      creditos: 250,
      descripcion: 'Ideal para emprendedores y consultores independientes en prospección activa.',
      features: [
        '250 Créditos de Prospección IA / mes',
        'Pipeline CRM Kanban completo',
        'Ficha 360° y notas comerciales',
        'Botón directo a WhatsApp (+56 9)',
        'Redactor IA con opt-out legal'
      ],
      popular: false,
      btnText: 'Elegir Plan Starter'
    },
    {
      nombre: 'Pro Comercial',
      precio: '$55.000',
      periodo: 'CLP / mes',
      creditos: 800,
      descripcion: 'Para empresas con vendedores activos que necesitan flujo constante de reuniones.',
      features: [
        '800 Créditos de Prospección IA / mes',
        'Todo lo del Plan Starter',
        'Detector inteligente de inactividad (+3d)',
        'Redactor de cotizaciones y dossiers',
        'Métricas de pipeline en tiempo real',
        'Soporte prioritario por WhatsApp'
      ],
      popular: true,
      btnText: 'Plan Recomendado'
    },
    {
      nombre: 'Escala B2B',
      precio: '$99.000',
      periodo: 'CLP / mes',
      creditos: 2000,
      descripcion: 'Para equipos comerciales de alto volumen y agencias de generación de leads.',
      features: [
        '2.000 Créditos de Prospección IA / mes',
        'Todo lo del Plan Pro',
        'Exportación ilimitada a CSV / Excel',
        'Asesoría en configuración SPF/DKIM/DMARC',
        'Múltiples usuarios por empresa'
      ],
      popular: false,
      btnText: 'Contactar para Escala'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Tienes {creditosActuales} créditos disponibles en tu cuenta</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Planes & Facturación SaaS</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
          Facturación local en pesos chilenos con Factura con IVA deducible de impuestos.
        </p>
      </div>

      {/* Grid de Planes */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {planes.map((plan) => (
          <div
            key={plan.nombre}
            className={`rounded-3xl p-7 flex flex-col justify-between border transition relative ${
              plan.popular
                ? 'bg-gradient-to-b from-[#131f38] to-[#0c1527] border-blue-500 shadow-2xl shadow-blue-500/20'
                : 'bg-[#0c1527] border-[#1a2744]'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Más Popular en Chile
              </span>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{plan.nombre}</h3>
              <p className="text-xs text-slate-400 mb-5">{plan.descripcion}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-extrabold text-white">{plan.precio}</span>
                <span className="text-xs text-slate-400">{plan.periodo}</span>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onRecargar(plan.creditos);
                alert(`¡Simulación de pago exitosa! Se han agregado ${plan.creditos} créditos a tu saldo.`);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-[#162238] hover:bg-[#1e293b] text-white border border-[#233458]'
              }`}
            >
              <span>{plan.btnText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Banner de Auditoría Anti-Spam */}
      <div className="p-6 rounded-3xl bg-[#0c1527] border border-[#1a2744] flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Compliance Anti-Spam Oficial de Google Workspace</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Tus correos incluyen encabezado limpio, cláusula de opt-out y cero adjuntos pesados en frío para asegurar 100% bandeja principal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
