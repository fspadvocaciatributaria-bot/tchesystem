-- =============================================================================
-- FSP — Preferência de tema por usuário
-- =============================================================================
alter table profiles add column if not exists theme text not null default 'dark'
  check (theme in ('dark','light','system'));
