import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Actividad } from '@/lib/types';

// Fallback local en memoria
let localActividadesFallback: Actividad[] = [];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('lead_id');

    if (!leadId) {
      return NextResponse.json({ error: 'lead_id es requerido' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo actividades de Supabase:', error);
        return NextResponse.json({ 
          actividades: localActividadesFallback.filter(a => a.lead_id === leadId) 
        });
      }

      return NextResponse.json({ actividades: data || [] });
    }

    const filtered = localActividadesFallback
      .filter(a => a.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ actividades: filtered });
  } catch (err: any) {
    console.error('Error en GET /api/actividades:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { lead_id, tipo, descripcion } = await req.json();

    if (!lead_id || !tipo || !descripcion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('actividades')
        .insert({
          lead_id,
          tipo,
          descripcion
        })
        .select()
        .single();

      if (error) {
        console.error('Error insertando actividad en Supabase:', error);
        // Fallback local
        const nueva: Actividad = {
          id: `act-${Date.now()}`,
          lead_id,
          tipo,
          descripcion,
          created_at: new Date().toISOString()
        };
        localActividadesFallback.unshift(nueva);
        return NextResponse.json({ success: true, actividad: nueva });
      }

      return NextResponse.json({ success: true, actividad: data });
    }

    const nueva: Actividad = {
      id: `act-${Date.now()}`,
      lead_id,
      tipo,
      descripcion,
      created_at: new Date().toISOString()
    };
    localActividadesFallback.unshift(nueva);

    return NextResponse.json({ success: true, actividad: nueva });
  } catch (err: any) {
    console.error('Error en POST /api/actividades:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
