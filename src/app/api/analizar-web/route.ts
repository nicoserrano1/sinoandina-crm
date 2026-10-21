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
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'La URL del sitio web es requerida' }, { status: 400 });
    }

    // Normalizar URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    let webContent = '';

    // Scraping del sitio web de referencia
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(formattedUrl, {
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
        
        // Extraer texto limpio de títulos, metas y párrafos
        const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        
        // Remover scripts y estilos
        const cleanText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 4000); // Primeros 4000 caracteres con contenido relevante

        webContent = `Título: ${titleMatch ? titleMatch[1] : ''}\nMeta Descripción: ${metaMatch ? metaMatch[1] : ''}\nTexto extraído: ${cleanText}`;
      } else {
        webContent = `Sitio web: ${formattedUrl} (No respondió código 200, pero infiere por dominio)`;
      }
    } catch (scrapeErr: any) {
      console.warn("Aviso scraping HTML directo:", scrapeErr.message);
      webContent = `Sitio web de referencia: ${formattedUrl}`;
    }

    // Análisis del modelo comercial con Gemini 3.8 Flash
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Actúa como experto en prospección comercial B2B y estrategia de ventas corporativas.
Analiza el siguiente sitio web de una empresa o cliente de referencia:
URL: ${formattedUrl}

Contenido analizado:
${webContent}

Tu misión:
1. Identificar qué productos o servicios vende esta empresa (su propuesta de valor).
2. Definir cuál es su PERFIL DE CLIENTE IDEAL (ICP) B2B: ¿Quiénes son las empresas u organizaciones que necesitan contratarla o comprarle?
3. Generar entre 4 y 6 categorías e ideas EXACTAS de búsqueda para hacer scraping web y encontrar prospectos listos para comprar. Cada categoría debe ser concreta, orientada al mercado chileno o regional (ej: "Constructoras de edificación en altura en Santiago", "Empresas de climatización industrial en RM", "Distribuidores mayoristas de ferretería").
4. Sugerir el cargo del tomador de decisión clave para esta industria.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "empresa": "Nombre o rubro de la empresa",
  "propuesta_valor": "Resumen claro de lo que ofrece en 1 o 2 oraciones",
  "perfil_cliente_ideal": "Quiénes son sus mejores compradores B2B",
  "decisor_recomendado": "Jefe de Compras y Abastecimiento / Adquisiciones",
  "sugerencias_busqueda": [
    "Categoría 1 con ubicación o nicho específico",
    "Categoría 2 con ubicación o nicho específico",
    "Categoría 3 con ubicación o nicho específico",
    "Categoría 4 con ubicación o nicho específico"
  ]
}
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const parsed = JSON.parse(response.text || "{}");

    return NextResponse.json({
      success: true,
      url: formattedUrl,
      analisis: parsed
    });

  } catch (err: any) {
    console.error("Error en /api/analizar-web:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
