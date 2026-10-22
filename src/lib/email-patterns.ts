/**
 * Generador Inteligente de Correos Corporativos Directos para Tomadores de Decisión
 * 
 * En B2B, el 95% de las empresas utilizan patrones estándar para sus directivos:
 * - nombre.apellido@empresa.com (~50% de las corporaciones)
 * - inicial.apellido@empresa.com (~30%)
 * - nombre@empresa.com (~10%)
 * - apellido@empresa.com (~5%)
 */

export interface EmailSugerido {
  email: string;
  patron: string;
  popularidad: string;
  esMasComun: boolean;
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

  // Evitar generar correos si el decisor es genérico
  const dLower = decisor.toLowerCase();
  if (
    dLower.includes('equipo directivo') ||
    dLower.includes('gerencia general') ||
    dLower.includes('dirección') ||
    dLower.includes('directorio') ||
    dLower.includes('jefatura') ||
    dLower.includes('responsable')
  ) {
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
    addEmail(`${firstName}@${domain}`, `${firstName}`, '10% (Fundador / Directo)');

    // 4. inicial.apellido@empresa.com (~5%)
    addEmail(`${firstInitial}.${lastName}@${domain}`, `${firstInitial}.${lastName}`, '5%');

    // 5. apellido@empresa.com (~3%)
    addEmail(`${lastName}@${domain}`, `${lastName}`, '3%');

    // Si tiene segundo apellido (ej: Jaime Besa Fernández)
    if (secondLastName) {
      addEmail(`${firstInitial}${lastName}${secondLastName.charAt(0)}@${domain}`, `${firstInitial}${lastName}${secondLastName.charAt(0)}`, 'Variante doble apellido');
    }
  } else {
    // Solo un nombre provisto
    addEmail(`${firstName}@${domain}`, `${firstName}`, 'Directo', true);
  }

  return results;
}
