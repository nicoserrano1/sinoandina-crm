import { NextResponse } from 'next/server';
import { buscarEmpresasB2B } from '@/lib/gemini';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lead } from '@/lib/types';
import { getLinkedInUrl, injectLinkedInIntoNotes } from '@/lib/linkedin';
import { generateExecutiveEmails, isGenericEmail } from '@/lib/email-patterns';

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
      const recordsToInsert = empresasEncontradas.map((emp: any) => {
        const decisor = emp.tomador_decision || "Equipo Directivo";
        const cargo = emp.cargo || (decisorTipo && decisorTipo.trim() !== '' ? decisorTipo : "Dirección");
        const linkedinUrl = emp.linkedin_url || getLinkedInUrl({
          empresa: emp.nombre,
          decisor,
          cargo
        });

        const directOptions = generateExecutiveEmails(decisor, emp.url || emp.email);
        const resolvedEmail = emp.email || (directOptions[0]?.email) || (emp.url ? "contacto@" + emp.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : 'contacto@empresa.com');

        return {
          empresa: emp.nombre,
          url: emp.url || "",
          email: resolvedEmail,
          decisor,
          cargo,
          telefono: emp.telefono || "",
          monto_clp: 0,
          partida: emp.area_interes || emp.partida || "",
          estado: "Nuevo",
          notas: injectLinkedInIntoNotes(
            emp.por_que_es_match || `Prospectado para: ${criterio}`,
            linkedinUrl
          )
        };
      });

      const { data, error } = await supabase
        .from('leads')
        .insert(recordsToInsert)
        .select();

      if (error) {
        console.error("Error guardando en Supabase:", error);
      } else {
        // Enriquecer con linkedin_url en el payload retornado
        leadsGuardados = (data || []).map((lead: any, i: number) => ({
          ...lead,
          linkedin_url: recordsToInsert[i]?.notas ? getLinkedInUrl(recordsToInsert[i]) : undefined
        }));
      }
    } else {
      // Fallback local
      leadsGuardados = empresasEncontradas.map((emp: any, index: number) => {
        const decisor = emp.tomador_decision || "Equipo Directivo";
        const cargo = emp.cargo || (decisorTipo && decisorTipo.trim() !== '' ? decisorTipo : "Dirección");
        const linkedinUrl = emp.linkedin_url || getLinkedInUrl({
          empresa: emp.nombre,
          decisor,
          cargo
        });

        const directOptions = generateExecutiveEmails(decisor, emp.url || emp.email);
        const resolvedEmail = emp.email || (directOptions[0]?.email) || (emp.url ? "contacto@" + emp.url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : 'contacto@empresa.com');

        return {
          id: `auto-${Date.now()}-${index}`,
          empresa: emp.nombre,
          url: emp.url || "",
          email: resolvedEmail,
          decisor,
          cargo,
          telefono: emp.telefono || "",
          monto_clp: 0,
          partida: emp.area_interes || emp.partida || "",
          estado: "Nuevo" as const,
          notas: injectLinkedInIntoNotes(
            emp.por_que_es_match || `Prospectado para: ${criterio}`,
            linkedinUrl
          ),
          linkedin_url: linkedinUrl,
          created_at: new Date().toISOString()
        };
      });
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
