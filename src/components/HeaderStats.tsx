'use client';

import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
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
    <header className="h-14 border-b border-white/[0.06] bg-[#08090C] flex items-center justify-between px-7 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* KPI Total Activos */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-slate-400 bg-white/[0.03] border border-white/[0.05]">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Activos:</span>
          <span className="text-white font-semibold">{metrics.total}</span>
        </div>

        {/* KPI Nuevos */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-slate-400 bg-white/[0.03] border border-white/[0.05]">
          <span>Nuevos:</span>
          <span className="text-blue-400 font-semibold">{metrics.nuevos}</span>
        </div>

        {/* KPI Monto Pipeline */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-slate-300 bg-emerald-500/[0.08] border border-emerald-500/20">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pipeline:</span>
          <span className="text-emerald-400 font-bold">{formatearMonto(metrics.valorPipeline)}</span>
        </div>
      </div>
    </header>
  );
}
