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

Para cada empresa entrega información comercial verificable:
- nombre: Nombre comercial oficial.
- url: Sitio web oficial (https://...).
- tomador_decision: Nombre de la persona o jefatura específica del área según el cargo solicitado.
- cargo: Cargo exacto del tomador de decisión.
- email: Correo departamental o corporativo de contacto (ej: contacto@..., adquisiciones@..., gerencia@...).
- telefono: Teléfono de contacto comercial (+56 9 XXXX XXXX o formato local correspondiente).
- area_interes: Área, servicio o producto específico de su negocio que calza con esta búsqueda (ej: "Transformación Digital", "Servicios Legales Corporativos", "Insumos Médicos", "Suministros Industriales", "Capacitación", "Infraestructura").
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
