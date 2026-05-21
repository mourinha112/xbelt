create extension if not exists "pgcrypto";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text,
  business_type text not null default 'Academia',
  owner_name text,
  email text,
  phone text,
  units_count integer not null default 1,
  status text not null default 'Trial',
  created_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  full_name text not null,
  role text not null check (role in ('xbeltAdmin', 'admin', 'manager', 'coach', 'reception', 'student')),
  student_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  city text,
  state text,
  created_at timestamptz not null default now()
);

create table if not exists staff_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'consultor',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists demo_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  business_type text not null,
  team_size text not null,
  message text,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  name text not null,
  email text not null,
  phone text not null,
  plan text not null,
  status text not null default 'Ativo',
  goal text,
  birth_date date,
  source text default 'painel',
  created_at timestamptz not null default now()
);

create table if not exists membership_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  billing_cycle text not null default 'monthly',
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  membership_plan_id uuid references membership_plans(id) on delete set null,
  status text not null default 'active',
  starts_on date not null default current_date,
  ends_on date,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete set null,
  contract_id uuid references contracts(id) on delete set null,
  amount numeric(10, 2) not null,
  method text not null default 'pix',
  status text not null default 'open',
  due_on date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  title text not null,
  coach_name text not null,
  room text,
  starts_at timestamptz not null,
  capacity integer not null default 20,
  created_at timestamptz not null default now()
);

create table if not exists class_bookings (
  id uuid primary key default gen_random_uuid(),
  class_session_id uuid not null references class_sessions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  status text not null default 'booked',
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  unique (class_session_id, student_id)
);

create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  title text not null,
  focus text,
  level text not null default 'intermediario',
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists workout_assignments (
  id uuid primary key default gen_random_uuid(),
  workout_template_id uuid references workout_templates(id) on delete set null,
  student_id uuid not null references students(id) on delete cascade,
  starts_on date not null default current_date,
  ends_on date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists physical_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  assessed_at timestamptz not null default now(),
  weight_kg numeric(6, 2),
  body_fat_percentage numeric(5, 2),
  lean_mass_kg numeric(6, 2),
  notes text,
  measurements jsonb not null default '{}'::jsonb
);

create table if not exists sales_leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  stage text not null default 'novo lead',
  source text default 'site',
  expected_amount numeric(10, 2),
  created_at timestamptz not null default now()
);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan_name text not null default 'Start',
  monthly_amount numeric(10, 2) not null default 149.00,
  status text not null default 'trial',
  started_at timestamptz not null default now(),
  renews_at timestamptz
);

alter table organizations enable row level security;
alter table user_profiles enable row level security;
alter table locations enable row level security;
alter table staff_members enable row level security;
alter table demo_leads enable row level security;
alter table students enable row level security;
alter table membership_plans enable row level security;
alter table contracts enable row level security;
alter table invoices enable row level security;
alter table class_sessions enable row level security;
alter table class_bookings enable row level security;
alter table workout_templates enable row level security;
alter table workout_assignments enable row level security;
alter table physical_assessments enable row level security;
alter table sales_leads enable row level security;
alter table support_tickets enable row level security;
alter table subscriptions enable row level security;

create policy "demo leads can be created publicly"
  on demo_leads for insert
  to anon
  with check (true);

create policy "authenticated users can read demo leads"
  on demo_leads for select
  to authenticated
  using (true);

create policy "authenticated users can manage organizations"
  on organizations for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage profiles"
  on user_profiles for all
  to authenticated
  using (true)
  with check (true);

create policy "prototype can create organizations with anon key"
  on organizations for insert
  to anon
  with check (true);

create policy "authenticated users can manage locations"
  on locations for all
  to authenticated
  using (true)
  with check (true);

create policy "prototype can create locations with anon key"
  on locations for insert
  to anon
  with check (true);

create policy "authenticated users can manage staff"
  on staff_members for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage students"
  on students for all
  to authenticated
  using (true)
  with check (true);

create policy "prototype can create students with anon key"
  on students for insert
  to anon
  with check (true);

create policy "authenticated users can manage plans"
  on membership_plans for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage contracts"
  on contracts for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage invoices"
  on invoices for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage agenda"
  on class_sessions for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage bookings"
  on class_bookings for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage workouts"
  on workout_templates for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage workout assignments"
  on workout_assignments for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage assessments"
  on physical_assessments for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage sales leads"
  on sales_leads for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage support tickets"
  on support_tickets for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage subscriptions"
  on subscriptions for all
  to authenticated
  using (true)
  with check (true);

insert into organizations (name, business_type)
values ('Xbelt Demo Fitness', 'Academia')
on conflict do nothing;

insert into membership_plans (name, price, billing_cycle, description)
values
  ('Start Mensal', 149.00, 'monthly', 'Acesso livre e app do aluno'),
  ('Performance', 249.00, 'monthly', 'Treino, avaliacao e recorrencia'),
  ('Black Anual', 2388.00, 'yearly', 'Contrato anual com vantagens premium')
on conflict do nothing;
