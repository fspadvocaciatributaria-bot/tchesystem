-- =============================================================================
-- FSP — Controle de notas fiscais importadas (dedup por chave de acesso)
-- =============================================================================
create table if not exists imported_invoices (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  chave           text not null,
  model           text,
  numero          text,
  serie           text,
  emit_cnpj       text,
  emit_nome       text,
  total           numeric(14,4) not null default 0,
  issued_at       timestamptz,
  supplier_id     uuid references suppliers(id) on delete set null,
  items_count     integer not null default 0,
  created_by      uuid references profiles(id),
  created_at      timestamptz not null default now(),
  unique (organization_id, chave)
);
create index if not exists idx_imported_invoices_org on imported_invoices(organization_id);

alter table imported_invoices enable row level security;
create policy imported_invoices_select on imported_invoices for select
  using (organization_id in (select auth_org_ids()));
create policy imported_invoices_insert on imported_invoices for insert
  with check (organization_id in (select auth_org_ids()) and auth_can_write(organization_id));
create policy imported_invoices_delete on imported_invoices for delete
  using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id));
