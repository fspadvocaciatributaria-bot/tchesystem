# Decisões de Arquitetura (ADRs) — TcheSystem

> **Dono:** software-architect. Decisões estruturais registradas com contexto, alternativas, decisão, rationale e custo. Decisões de produto/fórmula financeira também em `docs/DECISIONS.md` e `docs/PRICING_RULES.md`.

## ADR-001 — Multi-tenant por `organization_id` + RLS obrigatório
**Contexto:** SaaS com múltiplas empresas; dados de uma jamais podem vazar para outra.
**Alternativas:** (a) filtrar só no frontend — rejeitada (inseguro); (b) schema por tenant — rejeitada (complexidade).
**Decisão:** toda tabela de dados tem `organization_id`; **RLS** em todas, com helpers `auth_org_ids()`/`auth_can_write()` (SECURITY DEFINER, search_path fixo). Verificado por teste de integração (anon não lê `organizations`).
**Custo:** baixo; segurança de primeira classe.

## ADR-002 — Regras financeiras em funções puras testáveis
**Contexto:** preço, custo médio, projeção e parcelamento não podem ter bug silencioso.
**Decisão:** lógica em `src/lib/pricing/` e `src/features/finance/finance.ts`, pura e coberta por testes; componentes só orquestram. Dinheiro em `numeric(14,4)`; arredonda só na exibição (pt-BR/BRL).
**Rationale:** pega erros cedo; dá confiança em cada deploy. **Custo:** marginal.

## ADR-003 — Margem sobre o preço + custo médio ponderado
**Decisão:** preço = `CUSTO / (1 − comissão − imposto − margem)` (margem sobre a receita); custo de material por **média ponderada**, recalculada na entrada via RPC. Confirmado com o proprietário. Detalhes em `docs/PRICING_RULES.md`.

## ADR-004 — Módulo financeiro reusa Fornecedores/Clientes
**Contexto:** o requisito pedia tabela `people` unificada; o sistema já tem `suppliers` e `customers`.
**Decisão:** título a pagar referencia Fornecedor; a receber referencia Cliente (tabelas existentes, enriquecidas com `doc_number`/`address`). Evita duplicar cadastro. Baixa/estorno via RPC atômica (`register_payment`/`reverse_payment`).
**Rationale:** preserva a estrutura; menos tabelas subutilizadas.

## ADR-005 — Deploy automático com guarda de env no CI
**Contexto:** um deploy publicou build **sem** `VITE_SUPABASE_URL` → app quebrava ao iniciar (tela branca).
**Decisão:** GitHub Actions roda testes+build; gera `.env.production` dos secrets; **verifica que a URL do Supabase está embutida no bundle e aborta o deploy se faltar**. Netlify recebe só builds válidos.
**Rationale:** transforma uma falha silenciosa em falha barrada; a versão boa permanece no ar. **Custo:** zero.

## ADR-006 — Cache-control para SPA (fim da tela branca)
**Decisão:** `index.html`/rotas com `Cache-Control: no-store`; assets com hash → `immutable`. Mais para-quedas no `index.html` que recarrega uma vez em falha de módulo. Evita o navegador reusar um `index.html` antigo apontando para asset inexistente.

## ADR-007 — Importação de XML fiscal reutiliza um parser único
**Decisão:** um parser puro (`lib/nfe/parseNfe.ts`, testado) alimenta tanto o estoque quanto o financeiro. No financeiro, o sentido (a pagar/receber) é detectado pelo CNPJ da empresa (`organizations.doc_number`); dedup por chave de acesso. Sem integração SEFAZ nesta fase (só o arquivo XML).

## ADR-008 — Fonte única de dados financeiros (Dashboard/Relatórios sobre `transactions`)
**Contexto:** o Dashboard e os Relatórios liam o `cash_entries` antigo, enquanto o módulo financeiro usa `transactions` → os mesmos KPIs apareciam divergentes.
**Decisão:** `transactions` é a fonte única. Migração idempotente (`0012`) converte `cash_entries` → `transactions` (pagos, com "Caixa Geral" padrão); Dashboard, Relatórios, seed demo e a trilha passam a ler/gravar `transactions`. A tabela `cash_entries` fica como histórico congelado (não deletada).
**Rationale:** consistência dos números exibidos (confiança do usuário); menos superfície de dados.
