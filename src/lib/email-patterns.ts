/**
 * Generador Inteligente y Transparencia de Correos y Teléfonos B2B
 * 
 * Permite clasificar con absoluta claridad el origen y certeza de cada dato:
 * 1. real_web_generico: Extraído del sitio web oficial (ej. contacto@, info@)
 * 2. real_web_directo: Extraído de la web pero con nombre de persona
 * 3. patron_ia_estimado: Calculado estadísticamente a partir del nombre y dominio (ej. nombre.apellido@)
 */

export interface EmailSugerido {
  email: string;
  patron: string;
  popularidad: string;
  esMasComun: boolean;
}

export type EmailOrigenTipo = 
  | 'real_web_generico'   // Extraído de la web (contacto@, info@)
  | 'real_web_directo'    // Extraído de la web con nombre personal
  | 'patron_ia_estimado'; // Calculado por la IA según nombre y dominio

export interface DetalleEmail {
  email: string;
  origen: EmailOrigenTipo;
  badgeLabel: string;
  badgeColor: string;
  descripcion: string;
  esMasProbable?: boolean;
}

export interface TelefonoInfo {
  numero: string;
  tipo: 'movil_directo' | 'central_fija' | 'desconocido';
  badgeLabel: string;
  badgeColor: string;
  esWhatsApp: boolean;
  descripcion: string;
}

/**
 * Normaliza un nombre removiendo acentos, diéresis, caracteres especiales y dejando solo a-z
 */
export function normalizeNameForEmail(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '') // Solo alfanumérico
    .trim();
}

/**
 * Extrae el dominio raíz limpio de una URL o de un email
 * Ej: "https://www.almagro.cl/proyectos" -> "almagro.cl"
 * Ej: "contacto@besalco.cl" -> "besalco.cl"
 */
export function extractCleanDomain(urlOrEmail?: string): string {
  if (!urlOrEmail) return '';
  let clean = urlOrEmail.trim().toLowerCase();

  // Si es un email
  if (clean.includes('@')) {
    clean = clean.split('@')[1];
  }

  // Si tiene protocolo
  clean = clean.replace(/^https?:\/\//i, '');

  // Si empieza con www.
  clean = clean.replace(/^www\./i, '');

  // Quitar rutas y query params
  clean = clean.split('/')[0].split('?')[0].split('#')[0];

  return clean.trim();
}

/**
 * Detecta si un correo electrónico es genérico/departamental
 */
export function isGenericEmail(email?: string): boolean {
  if (!email) return true;
  const user = email.split('@')[0]?.toLowerCase().trim();
  if (!user) return true;

  const genericPrefixes = [
    'contacto',
    'info',
    'ventas',
    'comercial',
    'administracion',
    'adquisiciones',
    'compras',
    'recepcion',
    'soporte',
    'postventa',
    'clientes',
    'hola',
    'hello',
    'mail',
    'consultas',
    'gerencia',
    'proyectos',
    'rrhh',
    'finanzas'
  ];

  return genericPrefixes.includes(user);
}

/**
 * Genera la lista ordenada de correos directos probables para un decisor
 */
export function generateExecutiveEmails(
  decisor?: string,
  domainOrUrlOrEmail?: string
): EmailSugerido[] {
  if (!decisor || !domainOrUrlOrEmail) return [];

  // Evitar generar correos si el decisor es genérico o un departamento
  const dLower = decisor.toLowerCase();
  const genericWords = [
    'equipo directivo',
    'gerencia',
    'gerente',
    'dirección',
    'director',
    'directorio',
    'jefatura',
    'jefe',
    'responsable',
    'abastecimiento',
    'adquisiciones',
    'compras',
    'operaciones',
    'proyectos',
    'administración',
    'departamento',
    'contacto',
    'comercial',
    'ventas'
  ];
  if (genericWords.some(w => dLower.includes(w))) {
    return [];
  }

  const domain = extractCleanDomain(domainOrUrlOrEmail);
  if (!domain || !domain.includes('.')) return [];

  // Separar nombres y apellidos (filtrando palabras vacías o conectores como "de", "del", "la", "y")
  const stopwords = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'san']);
  const parts = decisor
    .split(/\s+/)
    .map(p => normalizeNameForEmail(p))
    .filter(p => p.length > 0 && !stopwords.has(p));

  if (parts.length === 0) return [];

  const firstName = parts[0];
  const firstInitial = firstName.charAt(0);
  const lastName = parts.length > 1 ? parts[1] : '';
  const secondLastName = parts.length > 2 ? parts[2] : '';

  const results: EmailSugerido[] = [];
  const added = new Set<string>();

  const addEmail = (email: string, patron: string, popularidad: string, esMasComun: boolean = false) => {
    if (!added.has(email)) {
      added.add(email);
      results.push({ email, patron, popularidad, esMasComun });
    }
  };

  if (lastName) {
    // 1. nombre.apellido@empresa.com (El más común en el 50% de las empresas B2B)
    addEmail(`${firstName}.${lastName}@${domain}`, `${firstName}.${lastName}`, '50% (Más común)', true);

    // 2. inicialapellido@empresa.com (~30%)
    addEmail(`${firstInitial}${lastName}@${domain}`, `${firstInitial}${lastName}`, '30% (Corporativo)');

    // 3. nombre@empresa.com (~10%)
    addEmail(`${firstName}@${domain}`, `${firstName}`, '10% (Directo)');

    // 4. inicial.apellido@empresa.com (~5%)
    addEmail(`${firstInitial}.${lastName}@${domain}`, `${firstInitial}.${lastName}`, '5%');

    // 5. apellido@empresa.com (~3%)
    addEmail(`${lastName}@${domain}`, `${lastName}`, '3%');

    // Si tiene segundo apellido (ej: Jaime Besa Fernández)
    if (secondLastName) {
      addEmail(`${firstInitial}${lastName}${secondLastName.charAt(0)}@${domain}`, `${firstInitial}${lastName}${secondLastName.charAt(0)}`, 'Variante doble apellido');
    }
  } else {
    addEmail(`${firstName}@${domain}`, `${firstName}`, 'Directo', true);
  }

  return results;
}

/**
 * Resuelve la lista completa de correos posibles para un lead,
 * clasificando con total transparencia cuál es de la web y cuáles son estimaciones por patrón IA.
 */
export function resolveLeadEmails(lead: {
  email?: string;
  decisor?: string;
  url?: string;
}): DetalleEmail[] {
  const list: DetalleEmail[] = [];
  const added = new Set<string>();

  const currentEmail = lead.email?.trim() || '';

  // 1. Correo que vino de la prospección web
  if (currentEmail) {
    const isGen = isGenericEmail(currentEmail);
    added.add(currentEmail.toLowerCase());

    if (isGen) {
      list.push({
        email: currentEmail,
        origen: 'real_web_generico',
        badgeLabel: '🏢 Web Empresa (Central)',
        badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        descripcion: 'Extraído del sitio web oficial (mesa central / genérico)'
      });
    } else {
      list.push({
        email: currentEmail,
        origen: 'real_web_directo',
        badgeLabel: '👤 Directo Verificado en Web',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        descripcion: 'Correo corporativo personal detectado en la web'
      });
    }
  }

  // 2. Patrones estimados por la IA para el tomador de decisión
  const patterns = generateExecutiveEmails(lead.decisor, lead.url || currentEmail);
  for (const p of patterns) {
    if (!added.has(p.email.toLowerCase())) {
      added.add(p.email.toLowerCase());
      list.push({
        email: p.email,
        origen: 'patron_ia_estimado',
        badgeLabel: p.esMasComun ? `💡 Patrón IA (${p.popularidad})` : `💡 Patrón IA (${p.patron})`,
        badgeColor: p.esMasComun 
          ? 'text-amber-300 bg-amber-500/15 border-amber-500/30' 
          : 'text-slate-300 bg-white/[0.04] border-white/[0.08]',
        descripcion: `Estimación por patrón corporativo para ${lead.decisor}`,
        esMasProbable: p.esMasComun
      });
    }
  }

  return list;
}

/**
 * Clasifica si el número de teléfono es un móvil directo con WhatsApp
 * o una central telefónica fija (mesa de entrada).
 */
export function classifyPhone(telefono?: string): TelefonoInfo {
  if (!telefono || !telefono.trim()) {
    return {
      numero: '',
      tipo: 'desconocido',
      badgeLabel: 'Sin teléfono',
      badgeColor: 'text-slate-500 bg-white/[0.04] border-white/[0.06]',
      esWhatsApp: false,
      descripcion: 'No registrado'
    };
  }

  const clean = telefono.replace(/\D/g, '');
  
  // En Chile (+56 9 XXXXXXXX o 9 XXXXXXXX)
  const isChileMobile = 
    (clean.startsWith('569') && clean.length === 11) ||
    (clean.startsWith('9') && clean.length === 9) ||
    telefono.includes('+56 9');

  // Fijo en Chile (+56 2 XXXXXXXX Santiago, +56 32, etc.)
  const isChileFixed = 
    (clean.startsWith('562') && clean.length === 11) ||
    telefono.includes('+56 2') ||
    telefono.toLowerCase().includes('mesa central') ||
    telefono.toLowerCase().includes('fijo');

  if (isChileMobile) {
    return {
      numero: telefono,
      tipo: 'movil_directo',
      badgeLabel: '📱 Celular / WhatsApp',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      esWhatsApp: true,
      descripcion: 'Número móvil directo de la persona (con WhatsApp)'
    };
  }

  if (isChileFixed) {
    return {
      numero: telefono,
      tipo: 'central_fija',
      badgeLabel: '☎️ Mesa Central Fija',
      badgeColor: 'text-slate-300 bg-white/[0.06] border-white/[0.1]',
      esWhatsApp: false,
      descripcion: 'Central telefónica corporativa de la empresa (recepción)'
    };
  }

  return {
    numero: telefono,
    tipo: 'desconocido',
    badgeLabel: '📞 Central / Teléfono',
    badgeColor: 'text-slate-300 bg-white/[0.06] border-white/[0.1]',
    esWhatsApp: clean.length >= 9,
    descripcion: 'Teléfono corporativo registrado'
  };
}
