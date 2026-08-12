# CLAUDE.md — FSP (Formação de Preços & Gestão)

Guia de projeto para o Claude Code. Leia antes de codificar.

## O que é
SaaS multi-tenant de **formação de preços**, orçamento, custos, estoque e gestão financeira
para prestadores de serviços (tatuadores, fotógrafos, mecânicos, etc.). Cadeia conceitual:
`Formação de preço → Serviço → Orçamento → Cliente`. O produto responde "quanto preciso cobrar",
não "aqui está uma calculadora".

## Stack
Supabase (PostgreSQL + Auth + RLS + Storage) · React 18 + TypeScript + Vite · Tailwind ·
TanStack Query · React Router · Recharts · Zod · Vitest + Testing Library · ESLint/Prettier.

## Regras de ouro
1. **Toda regra financeira vive em `src/lib/pricing/`** como função pura, com teste unitário.
   Nunca calcule preço/estoque "no componente". Fórmulas: `docs/PRICING_RULES.md`.
2. **RLS em todas as tabelas.** Nenhuma autorização depende do frontend. Ver `docs/RLS.md`.
   Todo dado carrega `organization_id`.
3. **Dinheiro**: `numeric(14,4)` no banco; nunca `float` para dinheiro. Exibição pt-BR/BRL
   via `Intl.NumberFormat`. Arredonda só na apresentação.
4. **Estoque** só muda via RPC `register_inventory_movement()` (saldo + custo médio + auditoria).
5. **Segredos** nunca no código nem no commit. Frontend só usa a chave anon (`VITE_*`).
6. **Decisões financeiras** que mudam resultado: registre em `docs/DECISIONS.md` e, se alteram
   o número final, confirme com o usuário. Não invente fórmula silenciosamente.

## Estrutura
```
docs/                     # ARCHITECTURE, DATABASE, SCREENS, PRICING_RULES, RLS, DECISIONS
supabase/migrations/      # DDL versionado (0001 schema, 0002 rls, 0003 functions)
supabase/seed/            # dados demo (Studio Black, FotoLab)
src/lib/pricing/          # ⭐ lógica financeira pura + testes
src/lib/money/            # formatação BRL
src/lib/supabase/         # cliente + tipos
src/features/<dominio>/   # módulos por domínio
src/layouts/              # MobileLayout, DesktopLayout
```

## Convenções
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **Componentes**: função + hooks; dados via TanStack Query em `hooks/`; acesso a dados em `services/`.
- **Validação**: Zod no frontend + CHECK constraints no banco (defesa em profundidade).
- **Cores** (Tailwind tokens): `gold` (lucro/metas/premium), `critical` (vermelho: alertas/erros),
  `success` (verde: OK), `muted` (cinza). Base preto/preto-fosco. Não exagerar nas cores.
- **Testes** antes de concluir cada fase: pricing, estoque, orçamentos, RLS/segurança.

## Fluxo de trabalho por fases
Ver `docs/` e a lista de tarefas. FASE 0 (planejamento) → 1 (fundação) → 2 (cadastros) →
3 (formação de preço) → 4 (orçamentos) → 5 (financeiro/dashboard) → 6 (testes/segurança/deploy).
Rode a suíte de testes e corrija falhas antes de dar cada fase por concluída.
