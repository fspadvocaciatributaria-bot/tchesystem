# CLAUDE.md — Constituição do TcheSystem

Guia lido no início de toda sessão, compartilhado pela equipe de agentes. TcheSystem =
SaaS multi-tenant de **formação de preços, orçamento, estoque e financeiro** para prestadores
de serviços (tatuadores, fotógrafos, mecânicos, etc.). No ar: https://tchesystem.netlify.app.

## 1. Princípios não negociáveis
1. **Máximo valor, mínimo custo** — a rota mais barata que resolve; reaproveitar antes de adicionar dependência.
2. **Aproveitar a estrutura atual** — extensões e adições, nunca recomeços; não recriar o que já funciona.
3. **Confiabilidade financeira** — regras de preço/financeiras em funções puras testadas; dinheiro em `numeric(14,4)`, arredonda só na exibição (pt-BR/BRL).
4. **Segurança por padrão** — multi-tenant com RLS em toda tabela; segredos fora do frontend.
5. **Entrega incremental verificável** — cada ciclo termina com feature testada; o CI protege o deploy.

## 2. Stack e Convenções
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS; TanStack Query; React Router; Recharts. i18n pt-BR.
- **Backend:** Supabase (PostgreSQL + Auth + **RLS** + Storage + RPC). Sem lógica de negócio no frontend — regras puras em `src/lib/` e `src/features/*/finance.ts`/etc.
- **Banco:** migrações versionadas em `supabase/migrations/` (nunca alterar schema sem migração); `snake_case`; monetário `numeric(14,4)`; timestamps `timestamptz`.
- **Código:** ESLint + Prettier; commits `type(scope): descrição` (Conventional Commits); validar sempre (`tsc --noEmit`, `npm test`, `npm run build`) e ler o diff antes de commitar.
- **Segredos:** só a chave anon no frontend, em `.env.local` (git-ignorado); no CI, via GitHub Secrets. Nunca commitar chaves.
- **Deploy:** GitHub Actions → Netlify, com **guarda de env** (aborta se o bundle sair sem `VITE_SUPABASE_URL`). `index.html` com `no-store`.

## 3. Regras de ouro do código
1. **Regra financeira vive em função pura** (`src/lib/pricing/`, `src/features/finance/finance.ts`) com teste. Nunca calcular preço/estoque/projeção no componente.
2. **RLS em todas as tabelas.** Todo dado tem `organization_id`. Operações críticas (estoque, baixas) via **RPC `SECURITY DEFINER`** (search_path fixo, grants restritos).
3. **Reaproveitar componentes:** `CrudManager`/`CrudForm`, `useResource`, `Modal`, `InfoTooltip`, `formatBRL`.
4. **Tema-aware:** cores via tokens (`text-strong`, `bg-ink`, `text-muted`…) — nunca `text-white` fixo. Tema claro/escuro por usuário.
5. **Rastreabilidade:** valores calculados exibem origem/fórmula em tooltip.

## 4. Estrutura
```
docs/            # ROADMAP_EVOLUCAO, progresso, decisoes (ADRs), PRICING_RULES, RLS, ARCHITECTURE, diretrizes-ui/
supabase/migrations/  # DDL versionado (schema, RLS, RPCs)
src/lib/pricing/ · src/features/finance/finance.ts   # ⭐ regras puras testadas
src/lib/money/ · src/lib/supabase/ · src/lib/nfe/
src/features/<dominio>/   # cadastros, pricing, quotes, inventory, finance, import, reports…
src/layouts/     # MobileLayout, DesktopLayout
.github/workflows/deploy.yml  # CI: testes + build + guarda de env + deploy
```

## 5. Memória e estado (ler antes de agir, atualizar ao concluir)
- `docs/ROADMAP_EVOLUCAO.md` — backlog priorizado (fonte da verdade do que falta).
- `docs/progresso.md` — estado atual: feito, em andamento, falhas e porquês.
- `docs/decisoes.md` — ADRs (decisões estruturais com rationale e custo).

## 6. Equipe de agentes (`.claude/agents/`)
| Agente | Papel | Modelo |
|--------|-------|--------|
| **dev-fullstack** | Implementação: features, hooks, migrações, RLS/RPC, parsers, testes | Sonnet |
| **ui-ux-master** | Interface, tema claro/escuro, estados, a11y, responsividade | Sonnet |
| **software-architect** | Arquitetura, ADRs, revisão (checklist 7 dimensões), roadmap, custo — read-only em produção | Opus |

Fronteiras garantidas por restrição de ferramentas (o architect não edita código de produção).
Ciclo: **planejar (architect) → executar (dev/ux) → revisar (architect) → registrar (todos)**.
Protocolo completo em `.claude/agents/protocolo-equipe.md`. Envolver o usuário só em: trade-off
de arquitetura de longo prazo, custo relevante (serviço pago), conflito entre agentes, ou
ambiguidade de requisito.

## 7. Fluxo padrão (todos os agentes)
1. Ler `docs/progresso.md` e `docs/ROADMAP_EVOLUCAO.md`.
2. Escopar o mínimo de arquivos; plan mode em mudanças transversais.
3. Implementar em passos pequenos — 1 commit por feature, com critérios de aceitação verificados.
4. Rodar validações e ler o diff; o push dispara o CI (a guarda de env aborta build sem chaves).
5. Atualizar `docs/progresso.md` e marcar o item do roadmap.
