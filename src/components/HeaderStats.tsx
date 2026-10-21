'use client';

import React from 'react';
import { TrendingUp, Users, ShieldCheck, MailCheck } from 'lucide-react';
import { PipelineMetrics } from '@/lib/types';

interface HeaderStatsProps {
  title: string;
  metrics: PipelineMetrics;
}

export default function HeaderStats({ title, metrics }: HeaderStatsProps) {
  const formatearMonto = (num: number) => {
    return '$' + num.toLocaleString('es-CL') + ' CLP';
  };

  return (
    <header className="h-16 border-b border-[#1a2744] bg-[#0c1527] flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* KPI Total Activos */}
        <div className="flex items-center gap-2 bg-[#111c33] border border-[#1a2744] px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Activos:</span>
          <span className="text-white font-bold">{metrics.total}</span>
        </div>

        {/* KPI Nuevos */}
        <div className="flex items-center gap-2 bg-[#111c33] border border-[#1a2744] px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300">
          <span>🆕 Nuevos:</span>
          <span className="text-cyan-400 font-bold">{metrics.nuevos}</span>
        </div>

        {/* KPI Monto Pipeline */}
        <div className="flex items-center gap-2 bg-[#111c33] border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pipeline:</span>
          <span className="text-emerald-400 font-bold">{formatearMonto(metrics.valorPipeline)}</span>
        </div>

        {/* Antispam Badge */}
        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-300">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Anti-Spam 100% Google</span>
        </div>
      </div>
    </header>
  );
}
