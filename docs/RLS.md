# Modelo de Permissões e RLS — FSP

## Princípio
Segurança **nunca** depende do frontend. Toda leitura/escrita é filtrada por Row Level
Security no PostgreSQL/Supabase. Um usuário só enxerga dados das organizações às quais
pertence (via `memberships`).

## Papéis (`member_role`)
| Papel          | Acesso |
|----------------|--------|
| `owner`        | Total (inclui gestão de membros e exclusão da org). |
| `admin`        | Administrativo, conforme permissões por módulo. |
| `professional` | Escrita nos módulos operacionais permitidos. |
| `staff`        | Somente leitura por padrão; escrita liberada por `module_permissions`. |

Permissões finas por módulo em `module_permissions` (data-driven — `can_read`/`can_write`
por `module`). A combinação papel + permissão é configurável via dados, não hardcoded.

## Funções auxiliares (SECURITY DEFINER, `search_path=public`)
- `auth_org_ids()` → conjunto de `organization_id` do usuário atual. Usada em toda política
  de SELECT/INSERT/UPDATE/DELETE. `SECURITY DEFINER` evita recursão de política ao ler `memberships`.
- `auth_can_write(org)` → `true` se o usuário tem papel de escrita (`owner|admin|professional`) na org.

## Padrão de política por tabela (com `organization_id`)
```sql
SELECT  using (organization_id in (select auth_org_ids()))
INSERT  with check (organization_id in (select auth_org_ids()) and auth_can_write(organization_id))
UPDATE  using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id))
DELETE  using (organization_id in (select auth_org_ids()) and auth_can_write(organization_id))
```
Aplicado a todas as tabelas de dados em `0002_rls.sql`.

## Casos especiais
- `profiles`: cada usuário lê/edita apenas o próprio registro (`id = auth.uid()`).
- `professions`: catálogo global, somente leitura para todos os autenticados.
- `organizations`: criada **apenas** via RPC `create_organization()` (insere a membership
  `owner` na mesma transação); SELECT/UPDATE limitados aos membros.
- `memberships`: SELECT para membros da org; gestão de membros via RPC com verificação de papel.
- `audit_logs`: append-only; escrita só via `audit_log()`. Sem escrita direta.
- Estoque: alterado só via `register_inventory_movement()` (valida saldo, custo médio, permissão).

## Testes de segurança obrigatórios (FASE 6)
1. Usuário da org A **não** consegue ler nem escrever dados da org B (negado por RLS).
2. Usuário `staff` sem `can_write` **não** consegue alterar dados de módulo restrito.
3. Requisição **não autenticada** é negada em todas as tabelas.
4. Estoque não fica negativo; ajuste sem justificativa é rejeitado.
