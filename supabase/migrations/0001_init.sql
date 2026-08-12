-- =============================================================================
-- FSP — Migração inicial (schema + enums + índices)
-- PostgreSQL / Supabase. Valores monetários: numeric(14,4). Timestamps: timestamptz.
-- RLS é habilitado em 0002_rls.sql.
-- =============================================================================

create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ---------- ENUMS ------------------------------------------------------------
create type member_role       as enum ('owner', 'admin', 'professional', 'staff');
create type periodicity        as enum ('monthly', 'weekly', 'yearly', 'daily', 'custom');
create type labor_model        as enum ('hourly', 'per_service', 'commission_percent', 'monthly_cost', 'daily_cost');
create type unit_measure       as enum ('unit', 'ml', 'liter', 'kg', 'gram', 'meter', 'box', 'pack', 'hour', 'other');
create type movement_type      as enum ('in', 'out', 'adjustment');
create type price_component_kind as enum ('labor', 'material', 'additional');
create type quote_status       as enum ('draft', 'sent', 'accepted', 'rejected', 'expired');
create type cash_direction     as enum ('in', 'out');

-- ---------- FUNÇÃO utilitária updated_at ------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

-- ---------- ORGANIZAÇÕES / USUÁRIOS -----------------------------------------
create table professions (            -- catálogo global pré-semeado (nichos)
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  is_active   boolean not null default true
);

create table organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  trade_name    text,
  doc_number    text,                 -- CNPJ/CPF (opcional)
  phone         text,
  email         text,
  address       text,
  profession_id uuid references professions(id),
  logo_path     text,                 -- Supabase Storage
  currency      text not null default 'BRL',
  -- parâmetros de produtividade e precificação (defaults; PRICING_RULES.md)
  working_days_per_month   numeric(6,2)  not null default 22,
  productive_hours_per_day numeric(6,2)  not null default 6,
  available_hours_per_day  numeric(6,2)  not null default 8,
  tax_rate                 numeric(7,4)  not null default 0,     -- fração (0.06 = 6%)
  margin_min               numeric(7,4)  not null default 0.10,
  margin_recommended       numeric(7,4)  not null default 0.30,
  margin_premium           numeric(7,4)  not null default 0.50,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint margins_ordered check (margin_min <= margin_recommended and margin_recommended <= margin_premium),
  constraint hours_sane check (productive_hours_per_day <= available_hours_per_day),
  constraint rates_nonneg check (tax_rate >= 0 and margin_min >= 0)
);
create trigger trg_org_updated before update on organizations for each row execute function set_updated_at();

-- Perfil espelha auth.users (Supabase). id = auth.uid()
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  created_at  timestamptz not null default now()
);

-- Associação usuário ↔ organização (define o papel do usuário na org)
create table memberships (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references profiles(id) on delete cascade,
  role            member_role not null default 'staff',
  created_at      timestamptz not null default now(),
  unique (organization_id, user_id)
);
create index idx_memberships_user on memberships(user_id);
create index idx_memberships_org  on memberships(organization_id);

-- Permissões por módulo (data-driven, não hardcoded)
create table module_permissions (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  membership_id   uuid not null references memberships(id) on delete cascade,
  module          text not null,     -- ex.: 'pricing', 'inventory', 'cashflow'
  can_read        boolean not null default true,
  can_write       boolean not null default false,
  unique (membership_id, module)
);
create index idx_modperm_org on module_permissions(organization_id);

-- ---------- PROFISSIONAIS E MÃO DE OBRA -------------------------------------
create table professionals (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  doc_number      text,
  phone           text,
  email           text,
  internal_code   text,
  profession_id   uuid references professions(id),
  specialty       text,
  bond_type       text,               -- tipo de vínculo
  notes           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_professionals_org on professionals(organization_id);
create trigger trg_prof_updated before update on professionals for each row execute function set_updated_at();

-- Tipos de mão de obra que um profissional fornece (ex.: tatuagem, retoque)
create table labor_types (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  description     text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index idx_labor_types_org on labor_types(organization_id);

-- Remuneração por (profissional × tipo de mão de obra) — modelo configurável
create table labor_rates (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  labor_type_id   uuid not null references labor_types(id) on delete cascade,
  model           labor_model not null,
  hourly_value      numeric(14,4),    -- model=hourly
  service_value     numeric(14,4),    -- model=per_service
  commission_percent numeric(7,4),    -- model=commission_percent (fração)
  monthly_value     numeric(14,4),    -- model=monthly_cost
  daily_value       numeric(14,4),    -- model=daily_cost
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint values_nonneg check (
    coalesce(hourly_value,0) >= 0 and coalesce(service_value,0) >= 0 and
    coalesce(commission_percent,0) >= 0 and coalesce(monthly_value,0) >= 0 and
    coalesce(daily_value,0) >= 0)
);
create index idx_labor_rates_org on labor_rates(organization_id);

-- ---------- FORNECEDORES / PRODUTOS / ESTOQUE -------------------------------
create table suppliers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  phone           text, email text, notes text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
create index idx_suppliers_org on suppliers(organization_id);

create table product_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null
);
create index idx_prodcat_org on product_categories(organization_id);

create table products (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  sku             text,
  category_id     uuid references product_categories(id),
  unit            unit_measure not null default 'unit',
  supplier_id     uuid references suppliers(id),
  acquisition_cost numeric(14,4) not null default 0,  -- último custo informado
  avg_cost         numeric(14,4) not null default 0,  -- custo médio ponderado (D-002)
  reference_price  numeric(14,4),
  stock_current    numeric(14,4) not null default 0,
  stock_min        numeric(14,4) not null default 0,
  stock_max        numeric(14,4),
  is_active        boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint costs_nonneg check (acquisition_cost >= 0 and avg_cost >= 0 and stock_current >= 0)
);
create index idx_products_org on products(organization_id);
create trigger trg_products_updated before update on products for each row execute function set_updated_at();

-- Histórico de movimentações; estoque atual é derivável deste histórico
create table inventory_movements (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  product_id      uuid not null references products(id) on delete cascade,
  type            movement_type not null,
  quantity        numeric(14,4) not null,          -- sempre > 0; 'type' define o sinal
  unit_cost       numeric(14,4),                    -- obrigatório em 'in'
  supplier_id     uuid references suppliers(id),
  reason          text,                             -- motivo/justificativa (obrigatória em adjustment)
  document_number text,
  related_service_id uuid,                           -- FK adicionada após services (0001b)
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  constraint qty_positive check (quantity > 0)
);
create index idx_invmov_org on inventory_movements(organization_id);
create index idx_invmov_product on inventory_movements(product_id);
create index idx_invmov_created on inventory_movements(created_at);

-- ---------- CUSTOS FIXOS E VARIÁVEIS ----------------------------------------
create table fixed_costs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  description     text not null,
  category        text,
  amount          numeric(14,4) not null,
  periodicity     periodicity not null default 'monthly',
  custom_factor   numeric(10,4),                    -- usado quando periodicity='custom'
  due_date        date,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint amount_nonneg check (amount >= 0),
  constraint custom_needs_factor check (periodicity <> 'custom' or custom_factor is not null)
);
create index idx_fixed_costs_org on fixed_costs(organization_id);
create trigger trg_fixed_updated before update on fixed_costs for each row execute function set_updated_at();

create table variable_costs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  description     text not null,
  category        text,
  amount          numeric(14,4) not null,
  is_active       boolean not null default true,
  notes           text,
  created_at      timestamptz not null default now(),
  constraint vcost_nonneg check (amount >= 0)
);
create index idx_variable_costs_org on variable_costs(organization_id);

-- ---------- CLIENTES --------------------------------------------------------
create table customers (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  doc_number      text,
  phone           text, email text, address text, notes text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_customers_org on customers(organization_id);
create trigger trg_customers_updated before update on customers for each row execute function set_updated_at();

-- ---------- SERVIÇOS E FORMAÇÃO DE PREÇO ------------------------------------
create table services (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  category        text,
  estimated_hours numeric(10,4) not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint hours_nonneg check (estimated_hours >= 0)
);
create index idx_services_org on services(organization_id);
create trigger trg_services_updated before update on services for each row execute function set_updated_at();

-- Uma formação de preço por serviço (versão vigente); snapshot dos parâmetros
create table service_price_formations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  service_id      uuid not null references services(id) on delete cascade,
  -- snapshot dos parâmetros no momento do cálculo (rastreabilidade)
  margin_min          numeric(7,4) not null,
  margin_recommended  numeric(7,4) not null,
  margin_premium      numeric(7,4) not null,
  tax_rate            numeric(7,4) not null default 0,
  commission_percent  numeric(7,4) not null default 0,
  fixed_cost_per_hour numeric(14,4) not null default 0,
  -- resultados calculados (persistidos para histórico/orçamento)
  cost_total       numeric(14,4) not null default 0,
  price_min        numeric(14,4) not null default 0,
  price_recommended numeric(14,4) not null default 0,
  price_premium    numeric(14,4) not null default 0,
  computed_at      timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (service_id)
);
create index idx_spf_org on service_price_formations(organization_id);
create trigger trg_spf_updated before update on service_price_formations for each row execute function set_updated_at();

create table service_price_components (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  formation_id    uuid not null references service_price_formations(id) on delete cascade,
  kind            price_component_kind not null,
  label           text not null,
  -- labor
  professional_id uuid references professionals(id),
  labor_rate_id   uuid references labor_rates(id),
  hours           numeric(10,4),
  -- material
  product_id      uuid references products(id),
  quantity        numeric(14,4),
  unit_cost       numeric(14,4),        -- custo médio no momento (snapshot)
  -- additional / valor calculado do componente
  amount          numeric(14,4) not null default 0,
  created_at      timestamptz not null default now()
);
create index idx_spc_formation on service_price_components(formation_id);
create index idx_spc_org on service_price_components(organization_id);

-- FK tardia: movimentação de estoque pode referenciar um serviço
alter table inventory_movements
  add constraint fk_invmov_service foreign key (related_service_id) references services(id) on delete set null;

-- ---------- ORÇAMENTOS ------------------------------------------------------
create table quotes (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id     uuid references customers(id),
  code            text,                 -- número/identificação do orçamento
  status          quote_status not null default 'draft',
  discount_amount numeric(14,4) not null default 0,
  subtotal        numeric(14,4) not null default 0,
  total           numeric(14,4) not null default 0,
  valid_until     date,
  terms           text,
  notes           text,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint quote_nonneg check (discount_amount >= 0 and subtotal >= 0 and total >= 0)
);
create index idx_quotes_org on quotes(organization_id);
create index idx_quotes_customer on quotes(customer_id);
create trigger trg_quotes_updated before update on quotes for each row execute function set_updated_at();

create table quote_items (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  quote_id        uuid not null references quotes(id) on delete cascade,
  service_id      uuid references services(id),
  formation_id    uuid references service_price_formations(id),
  description     text not null,
  quantity        numeric(14,4) not null default 1,
  unit_price      numeric(14,4) not null default 0,
  line_total      numeric(14,4) not null default 0,
  constraint qi_nonneg check (quantity >= 0 and unit_price >= 0 and line_total >= 0)
);
create index idx_quote_items_quote on quote_items(quote_id);
create index idx_quote_items_org on quote_items(organization_id);

-- ---------- FLUXO DE CAIXA --------------------------------------------------
create table cash_entries (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  direction       cash_direction not null,   -- 'in' = entrada, 'out' = saída
  category        text,
  description     text,
  amount          numeric(14,4) not null,
  entry_date      date not null default current_date,
  quote_id        uuid references quotes(id),
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  constraint cash_positive check (amount >= 0)
);
create index idx_cash_org on cash_entries(organization_id);
create index idx_cash_date on cash_entries(entry_date);

-- ---------- METAS -----------------------------------------------------------
create table goals (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  professional_id uuid references professionals(id),   -- null = meta da organização
  desired_profit_month numeric(14,4) not null default 0,
  planned_services     numeric(10,2),
  reference_month  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint goal_nonneg check (desired_profit_month >= 0)
);
create index idx_goals_org on goals(organization_id);
create trigger trg_goals_updated before update on goals for each row execute function set_updated_at();

-- ---------- CONFIGURAÇÕES E AUDITORIA ---------------------------------------
create table settings (
  organization_id uuid primary key references organizations(id) on delete cascade,
  data            jsonb not null default '{}'::jsonb,
  updated_at      timestamptz not null default now()
);

create table audit_logs (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid references profiles(id),
  table_name      text not null,
  record_id       uuid,
  action          text not null,        -- insert/update/delete/price_change/...
  old_row         jsonb,
  new_row         jsonb,
  created_at      timestamptz not null default now()
);
create index idx_audit_org on audit_logs(organization_id);
create index idx_audit_created on audit_logs(created_at);
