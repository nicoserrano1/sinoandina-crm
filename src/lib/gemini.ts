import { GoogleGenAI } from '@google/genai';
import { Lead } from './types';

const MODEL_NAME = "gemini-3.8-flash";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta configurar GEMINI_API_KEY en variables de entorno.");
  return key;
}

export async function buscarEmpresasB2B(
  query: string, 
  limite: number = 10, 
  decisorTipo?: string,
  contextoOferta?: string
) {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Actúa como director de inteligencia comercial B2B y scraping web corporativo para una empresa que busca cerrar acuerdos comerciales de alto valor.
Tu objetivo es encontrar ${limite} empresas u organizaciones comerciales reales, activas y líderes operando en el siguiente sector o búsqueda: "${query}".

${contextoOferta ? `Contexto de la empresa oferente / propuesta de valor: "${contextoOferta}". Prioriza empresas que tengan necesidad directa de este tipo de oferta.` : ""}

Perfil del tomador de decisión requerido: ${decisorTipo || "Jefatura de Compras / Abastecimiento o Gerencia General"}.

Para cada empresa entrega información comercial verificable en Chile / Latam:
- nombre: Nombre comercial oficial.
- url: Sitio web oficial (https://...).
- tomador_decision: Nombre de la persona o jefatura específica del área.
- cargo: Cargo exacto del decisor.
- email: Correo departamental o corporativo de contacto (ej: adquisiciones@dominio.cl, compras@dominio.cl, contacto@...).
- telefono: Teléfono de contacto en formato chileno (+56 9 XXXX XXXX o +56 2 XXXX XXXX).
- partida: Partida o área de compra estimada (ej: "Terminaciones y Revestimientos", "Cubicaciones", "Climatización", "Materiales de Obra Gruesa", "Suministros Industriales").
- por_que_es_match: Una frase corta de por qué es una excelente oportunidad comercial.

Devuelve ÚNICAMENTE un JSON válido con la estructura:
{
  "empresas": [
    {
      "nombre": "Empresa SpA",
      "url": "https://empresa.cl",
      "tomador_decision": "Juan Pérez",
      "cargo": "Gerente de Adquisiciones",
      "email": "adquisiciones@empresa.cl",
      "telefono": "+56 9 8765 4321",
      "partida": "Terminaciones",
      "por_que_es_match": "Constructora activa con proyectos habitacionales en la Región Metropolitana."
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data.empresas || [];
  } catch (err: any) {
    console.error("Error en Gemini Prospector:", err.message);
    throw new Error("No se pudo completar la prospección con IA: " + err.message);
  }
}

export async function redactarEmailComercial(lead: Lead, tipo: 'intro' | 'followup' | 'cotizacion') {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const optOutLine = "\n\n---\nSi no estás a cargo de adquisiciones o no deseas recibir información de suministro, responde 'Baja' y no volveremos a escribirte.";

  let promptInstrucciones = "";

  if (tipo === "intro") {
    promptInstrucciones = `
Redacta un correo en frío corto (máximo 75 palabras) de Sinoandina para ${lead.empresa}.
- Destinatario: ${lead.decisor} (${lead.cargo}).
- Propuesta de valor: Suministro directo desde China con entrega DDP en obra/bodega y FACTURA LOCAL EN CLP.
- Menciona que congelamos el tipo de cambio y flete marítimo desde el anticipo.
- Cierre suave: preguntar si podemos cotizar una partida ${lead.partida ? `de ${lead.partida}` : "de terminaciones/materiales"} de sus proyectos activos.
- Cumple con formato natural, cero palabras de spam publicitario.
`;
  } else if (tipo === "followup") {
    promptInstrucciones = `
Redacta un correo de SEGUIMIENTO ELEGANTE Y CORTO (máximo 45 palabras) de Sinoandina para ${lead.decisor} en ${lead.empresa}.
- Hace unos días les enviamos información sobre suministro directo desde fábrica en China con factura local en CLP y entrega DDP.
- Pregunta amablemente si tuvieron oportunidad de revisarlo o si actualmente están licitando materiales para sus obras.
- Tono ejecutivo entre profesionales.
`;
  } else {
    promptInstrucciones = `
Redacta un correo comercial de cotización y dossier para ${lead.decisor} en ${lead.empresa}.
- Adjuntamos la propuesta técnica y catálogo digital de suministro directo desde China con entrega DDP en Chile.
- Recordamos que todas las partidas se entregan con factura local en CLP y muestra física previa en Santiago.
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
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      asunto: parsed.asunto || `Sinoandina // Suministro DDP para ${lead.empresa}`,
      cuerpo: (parsed.cuerpo || "") + optOutLine
    };
  } catch (err: any) {
    console.error("Error redactando con Gemini:", err.message);
    throw new Error("Error en redactor IA: " + err.message);
  }
}
