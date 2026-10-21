import { NextResponse } from 'next/server';
import { buscarEmpresasB2B } from '@/lib/gemini';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lead } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { criterio, limite = 10, decisorTipo } = await req.json();

    if (!criterio || typeof criterio !== 'string') {
      return NextResponse.json({ error: 'Criterio de búsqueda es requerido' }, { status: 400 });
    }

    // Ejecutar inteligencia comercial con Gemini 3.8 Flash
    const empresasEncontradas = await buscarEmpresasB2B(criterio, limite, decisorTipo);

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
        email: emp.email || "adquisiciones@" + (emp.url ? emp.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : 'empresa.cl'),
        decisor: emp.tomador_decision || "Jefatura de Abastecimiento",
        cargo: emp.cargo || "Gerente de Adquisiciones",
        telefono: emp.telefono || "",
        monto_clp: 0,
        partida: "",
        estado: "Nuevo",
        notas: `Prospectado automáticamente con IA para sector: ${criterio}`
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
        email: emp.email || "adquisiciones@" + (emp.url ? emp.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : 'empresa.cl'),
        decisor: emp.tomador_decision || "Jefatura de Abastecimiento",
        cargo: emp.cargo || "Gerente de Adquisiciones",
        telefono: emp.telefono || "",
        monto_clp: 0,
        partida: "",
        estado: "Nuevo" as const,
        notas: `Prospectado con IA para: ${criterio}`,
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
