/**
 * Utilidades para vinculación y apertura directa de perfiles de personas en LinkedIn
 */

/**
 * Limpia el nombre de la empresa para búsquedas en LinkedIn
 * Remueve sufijos legales como SpA, S.A., Limitada, Ltda, Chile
 */
export function cleanCompanyName(company: string): string {
  if (!company) return '';
  return company
    .replace(/\b(SpA|S\.A\.|S\.A|Limitada|Ltda\.?|Chile|Group|Holding)\b/gi, '')
    .trim();
}

/**
 * Determina si el texto del decisor es un nombre propio real o una etiqueta genérica
 */
export function isGenericDecisor(decisor?: string): boolean {
  if (!decisor) return true;
  const d = decisor.trim().toLowerCase();
  return (
    d.length < 3 ||
    d.includes('equipo directivo') ||
    d.includes('gerencia general') ||
    d.includes('dirección') ||
    d.includes('directorio') ||
    d.includes('jefatura') ||
    d.includes('responsable') ||
    d.includes('contacto') ||
    d.includes('por definir')
  );
}

/**
 * Extrae la URL de LinkedIn si está embebida en las notas
 */
export function extractLinkedInFromNotes(notas?: string): string | null {
  if (!notas) return null;
  const match = notas.match(/\[LinkedIn\]:\s*(https?:\/\/[^\s\n\r]+)/i);
  return match ? match[1].trim() : null;
}

/**
 * Inyecta o actualiza la URL de LinkedIn dentro del campo notas
 */
export function injectLinkedInIntoNotes(notas?: string, linkedinUrl?: string): string {
  const baseNotes = (notas || '').replace(/\[LinkedIn\]:[^\n\r]*/gi, '').trim();
  if (!linkedinUrl || !linkedinUrl.trim()) return baseNotes;
  return baseNotes ? `${baseNotes}\n[LinkedIn]: ${linkedinUrl.trim()}` : `[LinkedIn]: ${linkedinUrl.trim()}`;
}

/**
 * Genera la URL más precisa y directa para abrir el perfil de la persona recomendada en LinkedIn:
 * 1. Si existe URL directa de perfil (ej: https://www.linkedin.com/in/... o search URL precomputada), la usa directamente.
 * 2. Si el decisor es una persona real (ej: "Rafael Valdivieso", "Paulo Bezanilla"),
 *    apunta a la búsqueda de personas en LinkedIn con su NOMBRE COMPLETO y EMPRESA,
 *    haciendo que LinkedIn abra el perfil exacto de esa persona como resultado principal.
 * 3. Si no hay persona específica ("Equipo Directivo"), busca directivos clave de la empresa.
 */
export function getLinkedInUrl(lead: {
  empresa: string;
  decisor?: string;
  cargo?: string;
  linkedin_url?: string;
  notas?: string;
}): string {
  // 1. URL explícita ya provista (de lead o de notas)
  if (lead.linkedin_url && lead.linkedin_url.startsWith('http')) {
    return lead.linkedin_url;
  }
  const fromNotes = extractLinkedInFromNotes(lead.notas);
  if (fromNotes) return fromNotes;

  const cleanCompany = cleanCompanyName(lead.empresa);
  const decisor = lead.decisor?.trim() || '';

  // 2. Si es una persona real recomendada, abrir a esa persona directamente
  if (!isGenericDecisor(decisor)) {
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(decisor + ' ' + cleanCompany)}`;
  }

  // 3. Fallback genérico para la empresa
  const cargo = lead.cargo && !isGenericDecisor(lead.cargo) ? lead.cargo : 'gerente OR director OR fundador';
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(cleanCompany + ' ' + cargo)}`;
}
