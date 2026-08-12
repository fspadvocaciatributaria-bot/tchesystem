-- =============================================================================
-- FSP — Row Level Security (RLS)
-- Isolamento por organização em TODAS as tabelas de dados. Nenhuma autorização
-- depende do frontend. Ver docs/RLS.md.
-- =============================================================================

-- Helper: organizações às quais o usuário autenticado pertence.
-- SECURITY DEFINER + search_path fixo para evitar recursão de política em memberships.
create or replace function auth_org_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select organization_id from memberships where user_id = auth.uid()
$$;

-- Helper: o usuário tem papel de escrita nesta organização?
create or replace function auth_can_write(org uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships
    where user_id = auth.uid() and organization_id = org
      and role in ('owner','admin','professional')
  )
$$;

-- ---------- profiles: cada um vê/edita o próprio -----------------------------
alter table profiles enable row level security;
create policy profiles_self_select on profiles for select using (id = auth.uid());
create policy profiles_self_upsert on profiles for insert with check (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());

-- ---------- professions: catálogo global somente-leitura ---------------------
alter table professions enable row level security;
create policy professions_read on professions for select using (true);

-- ---------- organizations ----------------------------------------------------
alter table organizations enable row level security;
create policy orgs_select on organizations for select
  using (id in (select auth_org_ids()));
create policy orgs_update on organizations for update
  using (id in (select auth_org_ids()) and auth_can_write(id));
-- criação de organização é feita via RPC create_organization() (0003), que também
-- insere a membership 'owner' atomicamente.

-- ---------- memberships ------------------------------------------------------
alter table memberships enable row level security;
create policy memberships_select on memberships for select
  using (organization_id in (select auth_org_ids()));
-- gestão de membros (insert/update/delete) via RPC com verificação de papel owner/admin.

-- =============================================================================
-- Macro para tabelas "padrão" com organization_id: SELECT p/ membros,
-- INSERT/UPDATE/DELETE p/ quem pode escrever na org.
-- (Aqui expandido explicitamente por tabela para clareza e auditabilidade.)
-- =============================================================================

-- Função DO para aplicar o padrão a uma lista de tabelas
do $$
declare t text;
  tbls text[] := array[
    'module_permissions','professionals','labor_types','labor_rates',
    'suppliers','product_categories','products','inventory_movements',
    'fixed_costs','variable_costs','customers','services',
    'service_price_formations','service_price_components','quotes','quote_items',
    'cash_entries','goals','settings','audit_logs'
  ];
begin
  foreach t in array tbls loop
    execute format('alter table %I enable row level security;', t);

    execute format($f$
      create policy %1$s_select on %1$I for select
        using (organization_id in (select auth_org_ids()));
    $f$, t);

    execute format($f$
      create policy %1$s_insert on %1$I for insert
        with check (organization_id in (select auth_org_ids()) and auth_can_write(organization_id));
    $f$, t);

    execute format($f$
      create policy %1$s_update on %1$I for update
        using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id));
    $f$, t);

    execute format($f$
      create policy %1$s_delete on %1$I for delete
        using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id));
    $f$, t);
  end loop;
end $$;

-- audit_logs: escrita apenas via função audit_log() (SECURITY DEFINER). Remove
-- as políticas de escrita direta criadas acima para torná-la append-only via RPC.
drop policy if exists audit_logs_insert on audit_logs;
drop policy if exists audit_logs_update on audit_logs;
drop policy if exists audit_logs_delete on audit_logs;
