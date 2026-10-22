import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { Lead } from '@/lib/types';
import { extractLinkedInFromNotes, injectLinkedInIntoNotes } from '@/lib/linkedin';

// Almacén en memoria como fallback si Supabase aún no está conectado
let localLeadsFallback: Lead[] = [
  {
    id: "lead-1",
    empresa: "Constructora Echeverría Izquierdo",
    url: "https://echeverriaizquierdo.cl",
    email: "adquisiciones@echeverriaizquierdo.cl",
    decisor: "Gerencia de Abastecimiento",
    cargo: "Jefe de Compras y Suministros",
    telefono: "+56 9 7890 1234",
    monto_clp: 45000000,
    partida: "Porcelanatos y Fachadas",
    estado: "Contactado",
    notas: "Reunión acordada para revisar catálogo DDP.",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lead-2",
    empresa: "Inmobiliaria Moller y Pérez-Cotapos",
    url: "https://moller.cl",
    email: "compras@moller.cl",
    decisor: "Felipe Larraín",
    cargo: "Director de Operaciones",
    telefono: "+56 9 6543 2109",
    monto_clp: 85000000,
    partida: "Grifería y Sanitarios",
    estado: "Seguimiento",
    notas: "Licitación abierta para proyecto en Las Condes.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lead-3",
    empresa: "Constructora Almagro",
    url: "https://almagro.cl",
    email: "suministros@almagro.cl",
    decisor: "Rodrigo Morales",
    cargo: "Jefe de Terminaciones",
    telefono: "+56 9 5432 1098",
    monto_clp: 32000000,
    partida: "Pisos Vinílicos SPC",
    estado: "Nuevo",
    notas: "Identificado en prospección automática.",
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads from Supabase:', error);
        return NextResponse.json({ leads: localLeadsFallback, source: 'local' });
      }

      const enrichedLeads = (data || []).map((l: any) => ({
        ...l,
        linkedin_url: extractLinkedInFromNotes(l.notas) || l.linkedin_url || undefined
      }));

      return NextResponse.json({ leads: enrichedLeads, source: 'supabase' });
    }

    return NextResponse.json({ leads: localLeadsFallback, source: 'local' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const linkedinUrl = body.linkedin_url || undefined;
    const finalNotas = linkedinUrl 
      ? injectLinkedInIntoNotes(body.notas || "", linkedinUrl)
      : (body.notas || "");

    const newLead: Lead = {
      id: "lead-" + Date.now(),
      empresa: body.empresa,
      url: body.url || "",
      email: body.email,
      decisor: body.decisor || "Equipo Directivo",
      cargo: body.cargo || "Dirección",
      telefono: body.telefono || "",
      monto_clp: Number(body.monto_clp) || 0,
      partida: body.partida || "",
      estado: body.estado || "Nuevo",
      notas: finalNotas,
      linkedin_url: linkedinUrl,
      created_at: new Date().toISOString()
    };

    const supabase = getServiceSupabase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          empresa: newLead.empresa,
          url: newLead.url,
          email: newLead.email,
          decisor: newLead.decisor,
          cargo: newLead.cargo,
          telefono: newLead.telefono,
          monto_clp: newLead.monto_clp,
          partida: newLead.partida,
          estado: newLead.estado,
          notas: newLead.notas
        }])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        lead: { ...data, linkedin_url: linkedinUrl } 
      });
    }

    localLeadsFallback.unshift(newLead);
    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, linkedin_url, ...updates } = body;

    if (linkedin_url !== undefined) {
      updates.notas = injectLinkedInIntoNotes(updates.notas, linkedin_url);
    }

    const supabase = getServiceSupabase();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        lead: { 
          ...data, 
          linkedin_url: extractLinkedInFromNotes(data.notas) || linkedin_url 
        } 
      });
    }

    const idx = localLeadsFallback.findIndex(l => l.id === id);
    if (idx !== -1) {
      localLeadsFallback[idx] = { 
        ...localLeadsFallback[idx], 
        ...updates, 
        linkedin_url: linkedin_url !== undefined ? linkedin_url : localLeadsFallback[idx].linkedin_url,
        updated_at: new Date().toISOString() 
      };
      return NextResponse.json({ success: true, lead: localLeadsFallback[idx] });
    }

    return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    const supabase = getServiceSupabase();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    localLeadsFallback = localLeadsFallback.filter(l => l.id !== id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
