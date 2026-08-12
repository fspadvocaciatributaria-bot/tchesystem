# FSP — Formação de Preços & Gestão para Prestadores de Serviços

Plataforma web (SaaS) que ajuda o profissional a descobrir **quanto cobrar** por um serviço —
cobrindo custos, mão de obra e a margem de lucro desejada — e depois transforma esse preço em
orçamento, controla estoque e materiais, registra o fluxo de caixa e mostra se o negócio dá lucro.

> Nichos: tatuador, fotógrafo, barbeiro, cabeleireiro, manicure, mecânico, eletricista,
> marceneiro, designer, videomaker, esteticista e outros. Multi-tenant e responsivo
> (desktop, tablet e celular).

## Stack
Supabase (PostgreSQL, Auth, RLS, Storage) · React + TypeScript + Vite · Tailwind CSS ·
TanStack Query · React Router · Recharts · Zod · Vitest.

## Status
✅ **FASE 0** (planejamento) e **FASE 1** (fundação) concluídas. App React+TS+Vite compila,
26 testes passam, motor de precificação (`src/lib/pricing`) implementado, auth + layouts
responsivos + roteamento prontos. Próxima: **FASE 2 — Cadastros**.

## Documentação
| Documento | Conteúdo |
|-----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitetura, stack, estrutura de pastas |
| [docs/DATABASE.md](docs/DATABASE.md) | Modelo de dados, ERD, decisões de modelagem |
| [docs/SCREENS.md](docs/SCREENS.md) | Mapa de telas e fluxo de navegação |
| [docs/PRICING_RULES.md](docs/PRICING_RULES.md) | **Fórmulas financeiras** (fonte da verdade) |
| [docs/RLS.md](docs/RLS.md) | Permissões e Row Level Security |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Registro de decisões (ADR) |
| [CLAUDE.md](CLAUDE.md) | Guia para desenvolvimento |

## Desenvolvimento local (a partir da FASE 1)
Pré-requisitos: Node 18+, conta Supabase.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env.local   # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Aplicar o schema no seu projeto Supabase
#    (via Supabase CLI ou colando as migrations no SQL Editor, na ordem 0001→0002→0003)

# 4. Rodar
npm run dev        # aplicação em http://localhost:5173
npm test           # testes (Vitest)
npm run build      # build de produção
```

## Configuração do Supabase
1. Crie um projeto em https://supabase.com.
2. Em **Project Settings → API**, copie a `URL` e a chave `anon` para o `.env.local`.
3. Aplique as migrations de `supabase/migrations/` na ordem numérica.
4. (Opcional) Rode o seed de `supabase/seed/` para dados demonstrativos.

## Deploy
Build estático (`npm run build`) servido por Vercel, Netlify ou Cloudflare Pages.
Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do host.
Detalhes ao final da FASE 6.

## Segurança
RLS em todas as tabelas · isolamento por organização · validação Zod + constraints no banco ·
auditoria (`audit_logs`) · segredos fora do repositório. Ver [docs/RLS.md](docs/RLS.md).
