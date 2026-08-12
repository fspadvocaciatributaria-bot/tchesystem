-- =============================================================================
-- FSP — Endurecimento de permissões de funções (resposta ao database linter)
-- =============================================================================

-- Fixa search_path da função de trigger (evita search_path mutável).
alter function set_updated_at() set search_path = public;

-- audit_log e handle_new_user não devem ser chamáveis pela API pública.
-- São usadas internamente por triggers / funções SECURITY DEFINER (rodam como owner).
revoke execute on function audit_log(uuid, text, uuid, text, jsonb, jsonb) from public;
revoke execute on function handle_new_user() from public;

-- create_organization e register_inventory_movement: apenas usuários autenticados.
revoke execute on function create_organization(text, uuid) from public;
grant execute on function create_organization(text, uuid) to authenticated;

revoke execute on function register_inventory_movement(uuid, uuid, movement_type, numeric, numeric, uuid, text, text, uuid) from public;
grant execute on function register_inventory_movement(uuid, uuid, movement_type, numeric, numeric, uuid, text, text, uuid) to authenticated;

-- Nota: auth_org_ids() e auth_can_write() permanecem executáveis por anon/authenticated
-- porque são referenciadas nas políticas RLS e só expõem dados do próprio usuário.
