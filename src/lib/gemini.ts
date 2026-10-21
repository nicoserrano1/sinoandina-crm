import { GoogleGenAI } from '@google/genai';
import { Lead } from './types';

// Orden de modelos de alta disponibilidad para evitar errores 503 o 429
const FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash"
];

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta configurar GEMINI_API_KEY en variables de entorno.");
  return key;
}

export function extractCleanJson(rawText: string): any {
  if (!rawText) return null;
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function callGeminiWithFallback(prompt: string, jsonMode: boolean = true) {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode ? {
          temperature: 0.25
        } : {
          temperature: 0.3
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Aviso: Modelo ${model} no disponible (${err.message?.slice(0, 70)}), probando siguiente...`);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "Los servidores de IA están ocupados temporalmente. Por favor intenta en unos instantes.");
}

export async function buscarEmpresasB2B(
  query: string, 
  limite: number = 10, 
  decisorTipo?: string,
  contextoOferta?: string
) {
  const prompt = `
Actúa como director de inteligencia comercial B2B y scraping web corporativo para una empresa que busca cerrar acuerdos de alto valor.
Tu objetivo es encontrar ${limite} empresas u organizaciones comerciales reales, activas y líderes operando en el siguiente sector o búsqueda: "${query}".

${contextoOferta ? `Contexto de la empresa oferente / propuesta de valor o competidor de referencia: "${contextoOferta}". Prioriza empresas que tengan necesidad directa de este tipo de oferta.` : ""}

Perfil del tomador de decisión requerido: ${decisorTipo || "Directivo / Gerencia General / Responsable del Área"}.

Para cada empresa entrega información comercial verificable:
- nombre: Nombre comercial oficial.
- url: Sitio web oficial (https://...).
- tomador_decision: Nombre de la persona o jefatura específica del área según el cargo solicitado.
- cargo: Cargo exacto del tomador de decisión.
- email: Correo departamental o corporativo de contacto (ej: contacto@..., adquisiciones@..., gerencia@...).
- telefono: Teléfono de contacto comercial (+56 9 XXXX XXXX o formato local correspondiente).
- area_interes: Área, servicio o producto específico de su negocio que calza con esta búsqueda.
- por_que_es_match: Una frase concisa explicando por qué esta empresa es un cliente ideal para esta oferta.

Devuelve ÚNICAMENTE un JSON válido con la estructura:
{
  "empresas": [
    {
      "nombre": "Nombre de Empresa",
      "url": "https://empresa.com",
      "tomador_decision": "Nombre Decisor",
      "cargo": "Cargo del Decisor",
      "email": "contacto@empresa.com",
      "telefono": "+56 9 1234 5678",
      "area_interes": "Área de Interés",
      "por_que_es_match": "Razón por la cual calza con el perfil buscado."
    }
  ]
}
`;

  try {
    const rawText = await callGeminiWithFallback(prompt, true);
    const data = extractCleanJson(rawText);
    return data?.empresas || [];
  } catch (err: any) {
    console.error("Error en Gemini Prospector:", err.message);
    throw new Error("No se pudo completar la prospección con IA: " + err.message);
  }
}

export async function redactarEmailComercial(lead: Lead, tipo: 'intro' | 'followup' | 'cotizacion') {
  const optOutLine = "\n\n---\nSi no estás a cargo de esta área o no deseas recibir esta información, responde 'Baja' y no volveremos a escribirte.";

  let promptInstrucciones = "";

  if (tipo === "intro") {
    promptInstrucciones = `
Redacta un correo en frío corto (máximo 75 palabras) de prospección comercial B2B para ${lead.empresa}.
- Destinatario: ${lead.decisor} (${lead.cargo}).
- Propuesta de valor: Presentar una solución directa para su área de ${lead.partida || "operaciones comerciales"}, con condiciones claras y atención personalizada.
- Cierre suave: preguntar si podemos agendar una breve llamada de 10 minutos o enviar un dossier de presentación.
- Cumple con formato natural y profesional, cero palabras de spam publicitario.
`;
  } else if (tipo === "followup") {
    promptInstrucciones = `
Redacta un correo de SEGUIMIENTO ELEGANTE Y CORTO (máximo 45 palabras) para ${lead.decisor} en ${lead.empresa}.
- Hace unos días les enviamos información sobre nuestra propuesta comercial.
- Pregunta amablemente si tuvieron oportunidad de revisarlo o si actualmente están evaluando proveedores para sus proyectos.
- Tono ejecutivo entre profesionales.
`;
  } else {
    promptInstrucciones = `
Redacta un correo comercial de cotización y dossier para ${lead.decisor} en ${lead.empresa}.
- Adjuntamos la propuesta técnica y condiciones comerciales.
- Recordamos los beneficios clave y disponibilidad para resolver dudas técnicas.
`;
  }

  const prompt = `
${promptInstrucciones}

Responde ÚNICAMENTE en JSON:
{
  "asunto": "Asunto profesional y claro",
  "cuerpo": "Cuerpo del mensaje con saltos de línea \\n"
}
`;

  try {
    const rawText = await callGeminiWithFallback(prompt, true);
    const parsed = extractCleanJson(rawText);
    return {
      asunto: parsed?.asunto || `Propuesta comercial // ${lead.empresa}`,
      cuerpo: (parsed?.cuerpo || "") + optOutLine
    };
  } catch (err: any) {
    console.error("Error redactando con Gemini:", err.message);
    throw new Error("Error en redactor IA: " + err.message);
  }
}
