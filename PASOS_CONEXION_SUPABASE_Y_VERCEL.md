# 🚀 Guía de Conexión: Supabase & Vercel (Sinoandina Revenue Machine)

La aplicación ya está construida, compilada y funcionando localmente en `http://localhost:3000`.

Para conectarla a tu nube de **Supabase** y **Vercel** (igual que en `promis.cl`), sigue estos sencillos pasos:

---

### Paso 1: Configurar la Base de Datos en Supabase (2 minutos)

1. Entra a tu cuenta en [Supabase Dashboard](https://supabase.com/dashboard).
2. Crea un nuevo proyecto (o usa el que tienes disponible) con el nombre: **`sinoandina-crm`**.
3. En el menú lateral izquierdo, haz clic en **`SQL Editor`** (icono `>_`).
4. Haz clic en **`New Query`**, copia y pega todo el contenido del archivo [`src/lib/schema.sql`](file:///c:/Proyectos/Scrpaing%20y%20Prospectos/src/lib/schema.sql) y dale al botón verde **`Run`**.
5. ¡Listo! Ya tienes creadas:
   * La tabla de **`profiles`** con el sistema de **250 créditos**.
   * La tabla de **`leads`** con todas las columnas comerciales.
   * La tabla de **`actividades`**.
   * La seguridad **RLS (Row Level Security)** que protege los datos de cada cliente.

---

### Paso 2: Obtener las Credenciales de Supabase

1. En Supabase, ve a **`Project Settings`** (icono de engranaje abajo a la izquierda) $\rightarrow$ **`API`**.
2. Copia estos dos valores:
   * **Project URL** (ej: `https://abcdefghijkl.supabase.co`)
   * **anon / public key** (ej: `eyJhbGciOi...`)
3. Pégalos en tu archivo local [`.env.local`](file:///c:/Proyectos/Scrpaing%20y%20Prospectos/.env.local):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

---

### Paso 3: Desplegar en Vercel (1 minuto)

Tienes dos formas súper rápidas:

#### Opción A: Vía GitHub (Recomendada)
1. Sube este repositorio a tu GitHub (ej: `github.com/tu-usuario/sinoandina-crm`).
2. Entra a [Vercel Dashboard](https://vercel.com/dashboard).
3. Clic en **`Add New...`** $\rightarrow$ **`Project`** e importa tu repositorio.
4. En la sección **Environment Variables**, agrega:
   * `NEXT_PUBLIC_SUPABASE_URL` = (tu URL de Supabase)
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key de Supabase)
   * `GEMINI_API_KEY` = tu_clave_gemini_aqui
5. Clic en **`Deploy`** y en 45 segundos tendrás tu app viva en:  
   👉 **`https://sinoandina-crm.vercel.app`** (o con tu dominio propio `app.sinoandina.cl`).

---

### ¿Cómo probarlo ahora mismo en tu computador?

El servidor de desarrollo ya está corriendo en tu máquina.  
Abre tu navegador y entra a:
👉 **`http://localhost:3000`**
