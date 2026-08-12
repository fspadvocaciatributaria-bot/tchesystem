# TcheSystem — Formação de Preços & Gestão para Prestadores de Serviços

Plataforma web (SaaS) que ajuda o profissional a descobrir **quanto cobrar** por um serviço —
cobrindo custos, mão de obra e a margem de lucro desejada — e depois transforma esse preço em
orçamento, controla estoque e materiais, registra o fluxo de caixa e mostra se o negócio dá lucro.

> Nichos: tatuador, fotógrafo, barbeiro, cabeleireiro, manicure, mecânico, eletricista,
> marceneiro, designer, videomaker, esteticista e outros. Multi-tenant e responsivo
> (desktop, tablet e celular).

## Stack
Supabase (PostgreSQL, Auth, RLS, Storage) · React + TypeScript + Vite · Tailwind CSS ·
TanStack Query · React Router · Recharts · Zod · Vitest.

## Link público
🌐 **App no ar:** **https://tchesystem.netlify.app** (Netlify)
Espelho: https://fspadvocaciatributaria-bot.github.io/tchesystem/ (GitHub Pages, branch `gh-pages`)

## Status
✅ **MVP completo** (FASES 0–6). Backend Supabase provisionado e conectado; app React+TS+Vite
compila, testes passam (lógica financeira + RLS), RLS verificado contra o banco real.

### Funcionalidades
- **Autenticação** (Supabase Auth) e **multi-tenancy** com RLS em todas as tabelas
- **Onboarding**: cria organização (proprietário) e escolhe profissão/nicho
- **Cadastros**: profissionais, mão de obra, fornecedores, produtos, custos fixos/variáveis, clientes, serviços
- **Estoque**: entradas/saídas/ajustes via RPC com **custo médio ponderado** e alerta de mínimo
- **Formação de preço** (núcleo): mão de obra + materiais + rateio de custo fixo → **custo / mínimo / recomendado / premium** com breakdown explicável
- **Minha Meta**: simulador de faturamento necessário / hora / dia / nº de serviços
- **Orçamentos**: criados a partir do preço formado, com desconto, alerta de preço abaixo do mínimo e **visão profissional print-ready**
- **Fluxo de caixa** com períodos e indicadores; **Dashboard** executivo com KPIs e gráfico
- **Dados demonstrativos** (Studio Black) carregáveis em Configurações
- Layouts responsivos distintos (desktop sidebar / mobile bottom-nav)

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
Build estático (`npm run build` → `dist/`) servido por Vercel, Netlify ou Cloudflare Pages.

1. Faça push do repositório para o GitHub e conecte ao host.
2. Build command: `npm run build` · Output: `dist`.
3. Configure as variáveis de ambiente no painel do host:
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. **SPA routing** já configurado: `vercel.json` (rewrites) e `public/_redirects` (Netlify/Cloudflare)
   garantem que rotas do React Router não retornem 404.

Após o deploy, envie o link público para sócios/testadores. O cadastro exige confirmação de
e-mail (padrão do Supabase); para testes rápidos, é possível desativar em
Authentication → Providers → Email no painel do Supabase.

> **Nota:** este repositório já está conectado a um projeto Supabase provisionado (com o schema,
> RLS e seed aplicados). As credenciais ficam em `.env.local` (não versionado).

## Segurança
RLS em todas as tabelas · isolamento por organização · validação Zod + constraints no banco ·
auditoria (`audit_logs`) · segredos fora do repositório. Ver [docs/RLS.md](docs/RLS.md).
