# Progresso do Projeto — TcheSystem

> **Última atualização:** 12/08/2026. Memória compartilhada da equipe de agentes. Qualquer sessão começa lendo este arquivo (+ `ROADMAP_EVOLUCAO.md` e `decisoes.md`) para retomar sem perder contexto.

## Estado atual
Sistema **em produção e estável**. SaaS multi-tenant (React+TS+Vite+Tailwind, Supabase). No ar em **https://tchesystem.netlify.app** · repo `fspadvocaciatributaria-bot/tchesystem` · Supabase `agacxydgtwbbaqkdbhag`.

### Entregue e no ar
| Área | Situação |
|------|----------|
| Fundação (auth, layouts responsivos, tokens, roteamento) | ✅ |
| Cadastros (organização, profissionais, mão de obra, fornecedores, produtos, custos, clientes, serviços) | ✅ |
| Estoque com **custo médio ponderado** (RPC) + alertas | ✅ |
| **Formação de preço** (custo/mínimo/recomendado/premium + breakdown) — `lib/pricing` puro/testado | ✅ |
| Orçamentos (a partir do preço, desconto, print-ready, WhatsApp) | ✅ |
| Dashboard, Relatórios avançados | ✅ |
| Personalização: **tema claro/escuro** (por usuário), logo, tooltips de rastreabilidade, autocomplete de histórico | ✅ |
| Central de Ajuda + Trilha de Primeiros Passos | ✅ |
| Importação de **XML fiscal** (estoque **e** financeiro), dedup por chave | ✅ |
| Simulador "e se…", Minha Meta | ✅ |
| **Módulo Financeiro (Contas a Pagar/Receber)**: classificações, contas, lançamentos, parcelamento, baixa parcial, **estorno**, painel (saldo/projeção/vencidos), relatórios CSV/impressão | ✅ |
| Conta: troca de senha | ✅ |

### Infra / confiabilidade
- **Deploy automático** Netlify via GitHub Actions, com **guarda de env** (aborta se o bundle sair sem as chaves do Supabase → nunca publica versão quebrada).
- `index.html` com `Cache-Control: no-store` (fim da tela branca por cache) + auto-reload de para-quedas.
- **Monitor** agendado (a cada 2h): site + integridade do bundle + backend.
- Testes: `lib/pricing` (22) + money (4) + `finance.ts` (4) + parser NFe (6) + RLS integração (guardado). Total ~36 no CI.

## Pendências imediatas (ver ROADMAP)
1. Multa/juros automáticos na baixa de títulos vencidos (setting por classificação) — citado como opcional no requisito financeiro.
2. Migração dos lançamentos antigos do fluxo de caixa simples (`cash_entries`) para `transactions` (se houver dados legados).
3. PDF real do orçamento (hoje é impressão/print-ready).
4. Regenerar `database.types.ts` incluindo as tabelas financeiras (hoje acessadas via cast controlado).

## Lições registradas
- **Guarda de env no CI** foi essencial: a causa da "tela branca" era build sem `VITE_SUPABASE_URL`; a guarda impede reincidência.
- Reaproveitar `CrudManager`/`lib/pricing`/`finance.ts` acelerou muito e manteve consistência — manter esse padrão.
- Regras financeiras em funções puras testáveis pagam-se: pegaram bugs de expectativa e dão confiança em cada deploy.
