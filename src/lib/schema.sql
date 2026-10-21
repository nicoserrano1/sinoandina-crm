-- ==============================================================================
-- SINOANDINA REVENUE MACHINE / SAAS CRM - ESQUEMA DE BASE DE DATOS SUPABASE
-- ==============================================================================
-- Instrucciones:
-- 1. Ve a tu proyecto en Supabase (https://supabase.com/dashboard)
-- 2. Entra a "SQL Editor" en el menú izquierdo (icono >_)
-- 3. Haz clic en "New query", pega todo este código y dale al botón verde "Run"
-- ==============================================================================

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 2. Tabla de Perfiles y Créditos de Usuario
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  plan text default 'starter' check (plan in ('starter', 'pro', 'enterprise')),
  creditos_disponibles int default 250,
  creditos_totales int default 250,
  fecha_renovacion timestamp with time zone default (now() + interval '30 days'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de Prospectos / Leads CRM
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  empresa text not null,
  url text default '',
  email text not null,
  decisor text default 'Jefatura de Abastecimiento',
  cargo text default 'Gerente de Adquisiciones',
  telefono text default '',
  monto_clp numeric default 0,
  partida text default '',
  estado text default 'Nuevo' check (estado in ('Nuevo', 'Contactado', 'Seguimiento', 'En Reunión', 'Cotizado', 'Cerrado Ganado', 'Descartado')),
  notas text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabla de Actividades y Bitácora
create table if not exists public.actividades (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references public.leads on delete cascade not null,
  user_id uuid references auth.users on delete cascade,
  tipo text not null check (tipo in ('correo', 'whatsapp', 'nota', 'cambio_etapa')),
  descripcion text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Índices para acelerar búsquedas y filtros
create index if not exists idx_leads_user on public.leads(user_id);
create index if not exists idx_leads_estado on public.leads(estado);
create index if not exists idx_leads_empresa on public.leads(empresa);

-- 6. Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.actividades enable row level security;

-- 7. Políticas de Acceso (Permiten lectura y escritura inmediata)
drop policy if exists "Acceso perfiles" on public.profiles;
create policy "Acceso perfiles" on public.profiles for all using (true) with check (true);

drop policy if exists "Acceso leads" on public.leads;
create policy "Acceso leads" on public.leads for all using (true) with check (true);

drop policy if exists "Acceso actividades" on public.actividades;
create policy "Acceso actividades" on public.actividades for all using (true) with check (true);

-- 8. Datos iniciales de demostración para Sinoandina
insert into public.leads (empresa, url, email, decisor, cargo, telefono, monto_clp, partida, estado, notas)
values 
  ('Constructora Echeverría Izquierdo', 'https://echeverriaizquierdo.cl', 'adquisiciones@echeverriaizquierdo.cl', 'Gerencia de Abastecimiento', 'Jefe de Compras y Suministros', '+56 9 7890 1234', 45000000, 'Porcelanatos y Fachadas', 'Contactado', 'Reunión acordada para revisar catálogo DDP con factura local en CLP.'),
  ('Inmobiliaria Moller y Pérez-Cotapos', 'https://moller.cl', 'compras@moller.cl', 'Felipe Larraín', 'Director de Operaciones', '+56 9 6543 2109', 85000000, 'Grifería y Sanitarios', 'Seguimiento', 'Licitación abierta para proyecto residencial en Las Condes.'),
  ('Constructora Almagro', 'https://almagro.cl', 'suministros@almagro.cl', 'Rodrigo Morales', 'Jefe de Terminaciones', '+56 9 5432 1098', 32000000, 'Pisos Vinílicos SPC', 'Nuevo', 'Prospectado con IA para suministro directo de contenedores.');
