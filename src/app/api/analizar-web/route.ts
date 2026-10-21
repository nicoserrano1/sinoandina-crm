import { NextResponse } from 'next/server';
import { callGeminiWithFallback, extractCleanJson } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { url, descripcion } = await req.json();

    if (!url && !descripcion) {
      return NextResponse.json({ 
        error: 'Debes ingresar un sitio web de referencia o una descripción del negocio.' 
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
        const timeoutId = setTimeout(() => controller.abort(), 6000);

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
            .slice(0, 3500);

          webContent = `Título: ${titleMatch ? titleMatch[1] : ''}\nMeta Descripción: ${metaMatch ? metaMatch[1] : ''}\nTexto extraído: ${cleanText}`;
        }
      } catch (err: any) {
        console.warn("Aviso scraping web:", err.message);
        webContent = `Sitio web de referencia: ${targetUrl}`;
      }
    }

    // Si se envió descripción directa, sumarla al contexto
    if (descripcion && typeof descripcion === 'string') {
      webContent = `${webContent ? webContent + '\n\n' : ''}Descripción del usuario sobre la oferta/referencia:\n"${descripcion.trim()}"`;
    }

    const prompt = `
Actúa como director global de inteligencia de mercado B2B y prospección corporativa.
Analiza la siguiente referencia de mercado (puede ser el sitio web de la empresa, un competidor líder a emular, o un cliente modelo):
${webContent}

Tu misión es identificar quiénes son los compradores B2B y qué cargos deciden la compra.
Genera un análisis en formato JSON estricto con:
1. "empresa_detectada": Nombre de la empresa o concepto central.
2. "propuesta_valor": Qué producto o servicio ofrece en 1 frase directa.
3. "perfil_cliente_ideal": Quiénes son las empresas u organizaciones que compran esta solución y por qué.
4. "decisores_sugeridos": Lista de 4 a 6 cargos específicos con poder de compra (ej: "Jefe de Adquisiciones", "Gerente de Operaciones", "Director Médico", "CTO", "Gerente de Finanzas", etc.).
5. "angulos_prospeccion": Lista de 4 opciones de búsqueda concretas y variadas:
   - "Grandes Corporativos / Cuentas Clave"
   - "Empresas Medianas en Crecimiento"
   - "Nicho de Máxima Urgencia"
   - "Oportunidad Territorial / Regional"

Devuelve ÚNICAMENTE un JSON válido con esta estructura:
{
  "empresa_detectada": "Nombre o rubro de referencia",
  "propuesta_valor": "Resumen claro de la propuesta de valor",
  "perfil_cliente_ideal": "Quiénes compran esta solución",
  "decisores_sugeridos": [
    "Cargo 1 específico",
    "Cargo 2 específico",
    "Cargo 3 específico",
    "Cargo 4 específico"
  ],
  "angulos_prospeccion": [
    {
      "enfoque": "Grandes Corporativos",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Por qué este segmento tiene presupuesto"
    },
    {
      "enfoque": "Empresas Medianas en Crecimiento",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Ciclo de venta más corto y ágil"
    },
    {
      "enfoque": "Nicho de Máxima Urgencia",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Alta necesidad inmediata de resolver este problema"
    },
    {
      "enfoque": "Oportunidad Territorial",
      "query": "Búsqueda concreta para encontrar empresas",
      "justificacion": "Concentración por área geográfica"
    }
  ]
}
`;

    const rawText = await callGeminiWithFallback(prompt, true);
    const parsed = extractCleanJson(rawText);

    if (!parsed) {
      throw new Error("No se pudo interpretar la respuesta de la IA.");
    }

    return NextResponse.json({
      success: true,
      url: targetUrl || null,
      analisis: parsed
    });

  } catch (err: any) {
    console.error("Error en /api/analizar-web:", err);
    return NextResponse.json({ 
      error: "El servicio de IA tardó en responder. Por favor intenta de nuevo en unos segundos." 
    }, { status: 500 });
  }
}
