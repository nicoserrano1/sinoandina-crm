export type LeadStatus = 
  | 'Nuevo' 
  | 'Contactado' 
  | 'Seguimiento' 
  | 'En Reunión' 
  | 'Cotizado' 
  | 'Cerrado Ganado' 
  | 'Descartado';

export interface Lead {
  id: string;
  user_id?: string;
  empresa: string;
  url: string;
  email: string;
  decisor: string;
  cargo: string;
  telefono: string;
  monto_clp: number;
  partida: string;
  estado: LeadStatus;
  notas: string;
  created_at: string;
  updated_at?: string;
  dias_inactivo?: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  creditos_disponibles: number;
  creditos_totales: number;
  fecha_renovacion?: string;
}

export interface PipelineMetrics {
  total: number;
  nuevos: number;
  contactados: number;
  seguimiento: number;
  reunion: number;
  cotizados: number;
  ganados: number;
  descartados: number;
  valorPipeline: number;
  creditosDisponibles: number;
}

export interface ProspectarRequest {
  criterio: string;
  limite: number;
  decisorTipo: string;
}

export interface EmailGenerateRequest {
  lead: Lead;
  tipo: 'intro' | 'followup' | 'cotizacion';
  archivoAdjuntoUrl?: string;
}
