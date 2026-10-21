import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = "gemini-3.8-flash";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta configurar GEMINI_API_KEY en variables de entorno.");
  return key;
}

export async function POST(req: Request) {
  try {
    const { url, descripcion } = await req.json();

    if (!url && !descripcion) {
      return NextResponse.json({ 
        error: 'Debes proporcionar una URL o una descripción de tu negocio/oferta.' 
      }, { status: 400 });
    }

    let webContent = '';
    let targetUrl = '';

    // Si se envió una URL, hacer scraping ligero de contenido
    if (url && typeof url === 'string' && url.trim()) {
      targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const html = await response.text();
          const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
          const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
          
          const cleanText = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 4500);

          webContent = `Título: ${titleMatch ? titleMatch[1] : ''}\nMeta Descripción: ${metaMatch ? metaMatch[1] : ''}\nTexto extraído: ${cleanText}`;
        }
      } catch (err: any) {
        console.warn("Aviso scraping web:", err.message);
        webContent = `Sitio web de referencia: ${targetUrl}`;
      }
    }

    // Si se envió descripción directa, sumarla al contexto
    if (descripcion && typeof descripcion === 'string') {
      webContent = `${webContent ? webContent + '\n\n' : ''}Descripción del usuario sobre su oferta:\n"${descripcion.trim()}"`;
    }

    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Actúa como director global de inteligencia de mercado B2B, prospección multicanal y estrategia de ventas corporativas.
Tu objetivo es analizar cualquier empresa o propuesta de valor (sin importar su industria: software, salud, servicios legales, manufactura, importación, agencias, logística, retail, educación, construcción, etc.) y diseñar un plan de prospección comercial 100% a medida.

Contexto de la empresa o sitio web a analizar:
${webContent}

Instrucciones:
1. Resumen de la oferta: Qué vende, cuál es el valor diferencial y a qué mercado apunta.
2. Perfil de Cliente Ideal (ICP): Qué tipo de empresas compran esta oferta y por qué.
3. Tomadores de Decisión: 4 a 6 cargos o roles específicos que tienen el presupuesto y poder de compra para este servicio/producto en particular (ej. en software puede ser CTO o CISO; en salud puede ser Director Médico; en logística puede ser Gerente de Operaciones; en educación puede ser Vicerrector; en construcción puede ser Jefe de Compras).
4. Ángulos de Búsqueda y Scraping: 6 ángulos de prospección diversos, cada uno atacando un segmento distinto del mercado para que el usuario tenga múltiples opciones donde prospectar:
   - "Corporativos / Grandes Cuentas"
   - "Empresas Medianas en Expansión"
   - "Nicho Específico / Alta Demanda"
   - "Oportunidad Geográfica / Regional"
   - "Industria Adyacente / Clientes No Obvios"
   - "Sustitución de Proveedores Actuales"

Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura:
{
  "empresa_detectada": "Nombre o concepto de la empresa",
  "propuesta_valor": "Resumen claro de la propuesta de valor (máx 25 palabras)",
  "perfil_cliente_ideal": "Quiénes son los clientes ideales que compran esta solución",
  "decisores_sugeridos": [
    "Cargo 1 específico",
    "Cargo 2 específico",
    "Cargo 3 específico",
    "Cargo 4 específico"
  ],
  "angulos_prospeccion": [
    {
      "enfoque": "Corporativos",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Por qué este segmento tiene presupuesto"
    },
    {
      "enfoque": "Empresas Medianas",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Por qué es una venta más ágil"
    },
    {
      "enfoque": "Nicho de Alta Demanda",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Por qué necesitan esta solución con urgencia"
    },
    {
      "enfoque": "Regional / Territorial",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Oportunidad por concentración geográfica"
    },
    {
      "enfoque": "Industria Adyacente",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Segmento poco explotado por la competencia"
    },
    {
      "enfoque": "Sustitución de Proveedor",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Empresas insatisfechas con alternativas caras"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.25
      }
    });

    const parsed = JSON.parse(response.text || "{}");

    return NextResponse.json({
      success: true,
      url: targetUrl || null,
      analisis: parsed
    });

  } catch (err: any) {
    console.error("Error en /api/analizar-web:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
