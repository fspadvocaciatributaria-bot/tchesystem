-- =============================================================================
-- FSP — Revoga EXECUTE de anon/authenticated em funções internas
-- (Supabase concede EXECUTE por padrão a anon/authenticated; revogar de PUBLIC não basta.)
-- =============================================================================

-- Funções internas — nunca chamadas pela API. Bloqueadas para ambos os papéis.
revoke execute on function audit_log(uuid, text, uuid, text, jsonb, jsonb) from anon, authenticated;
revoke execute on function handle_new_user() from anon, authenticated;

-- RPCs de negócio — apenas usuários autenticados (removidas do anon).
revoke execute on function create_organization(text, uuid) from anon;
revoke execute on function register_inventory_movement(uuid, uuid, movement_type, numeric, numeric, uuid, text, text, uuid) from anon;

-- Avisos remanescentes do linter (aceitos):
--  * create_organization / register_inventory_movement executáveis por 'authenticated':
--    INTENCIONAL — são as RPCs do app; validam auth.uid()/auth_can_write() internamente.
--  * auth_org_ids() / auth_can_write() executáveis por anon/authenticated:
--    INTENCIONAL — helpers usados nas políticas RLS; expõem apenas dados do próprio usuário.
