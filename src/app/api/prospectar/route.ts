import { NextResponse } from 'next/server';
import { buscarEmpresasB2B } from '@/lib/gemini';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lead } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { criterio, limite = 10, decisorTipo, contextoOferta } = await req.json();

    if (!criterio || typeof criterio !== 'string') {
      return NextResponse.json({ error: 'Criterio de búsqueda es requerido' }, { status: 400 });
    }

    // Ejecutar inteligencia comercial y scraping con Gemini 3.8 Flash
    const empresasEncontradas = await buscarEmpresasB2B(criterio, limite, decisorTipo, contextoOferta);

    if (!empresasEncontradas || empresasEncontradas.length === 0) {
      return NextResponse.json({ 
        nuevos: 0, 
        mensaje: "No se encontraron nuevas empresas para este criterio." 
      });
    }

    const supabase = getServiceSupabase();
    let leadsGuardados: Lead[] = [];

    if (isSupabaseConfigured && supabase) {
      const recordsToInsert = empresasEncontradas.map((emp: any) => ({
        empresa: emp.nombre,
        url: emp.url || "",
        email: emp.email || (emp.url ? "contacto@" + emp.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : 'contacto@empresa.com'),
        decisor: emp.tomador_decision || "Directivo / Responsable",
        cargo: emp.cargo || decisorTipo || "Tomador de Decisión",
        telefono: emp.telefono || "",
        monto_clp: 0,
        partida: emp.area_interes || emp.partida || "",
        estado: "Nuevo",
        notas: emp.por_que_es_match || `Prospectado para: ${criterio}`
      }));

      const { data, error } = await supabase
        .from('leads')
        .insert(recordsToInsert)
        .select();

      if (error) {
        console.error("Error guardando en Supabase:", error);
      } else {
        leadsGuardados = data || [];
      }
    } else {
      // Fallback local
      leadsGuardados = empresasEncontradas.map((emp: any, index: number) => ({
        id: `auto-${Date.now()}-${index}`,
        empresa: emp.nombre,
        url: emp.url || "",
        email: emp.email || (emp.url ? "contacto@" + emp.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : 'contacto@empresa.com'),
        decisor: emp.tomador_decision || "Directivo / Responsable",
        cargo: emp.cargo || decisorTipo || "Tomador de Decisión",
        telefono: emp.telefono || "",
        monto_clp: 0,
        partida: emp.area_interes || emp.partida || "",
        estado: "Nuevo" as const,
        notas: emp.por_que_es_match || `Prospectado para: ${criterio}`,
        created_at: new Date().toISOString()
      }));
    }

    return NextResponse.json({
      success: true,
      nuevos: empresasEncontradas.length,
      mensaje: `Se descubrieron y agregaron ${empresasEncontradas.length} empresas al Pipeline.`,
      leads: leadsGuardados
    });
  } catch (err: any) {
    console.error("Error en API /prospectar:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
