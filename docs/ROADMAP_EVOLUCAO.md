# Roadmap de Evolução — TcheSystem

> **Dono:** software-architect. **Atualizado em:** 12/08/2026.
> Priorização pela regra do projeto: **máximo valor, mínimo custo** (quociente valor/esforço). Esforço: S/M/L.

## P0 — Fechar lacunas do que já existe (alto valor, baixo custo)
| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 0.1 | ✅ Regenerar `database.types.ts` com as tabelas financeiras e remover os casts `as any` | dev-fullstack | Médio | S | `tsc` sem casts nas hooks financeiras |
| 0.2 | Multa/juros automáticos na baixa de vencidos (setting `late_fee_percent`, `interest_monthly_percent`) | dev-fullstack | Alto | M | Baixa de título vencido sugere multa+juros calculados |
| 0.3 | ✅ (reescopado) Migração dos `cash_entries` legados → `transactions` (pagos), com conta padrão | dev-fullstack | Médio | M | Lançamentos antigos aparecem no painel financeiro |
| 0.4 | PDF real do orçamento (@react-pdf/renderer) com logo e layout profissional | dev-fullstack + ux | Alto | M | Botão "Baixar PDF" gera arquivo fiel ao print |

## P1 — Diferencial e produtividade
| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 1.1 | Central de Notificações / alertas (estoque mínimo, vencidos, meta em risco) com sino no header | dev-fullstack + ux | Alto | M | Alertas aparecem sem ação do usuário |
| 1.2 | Fluxo de caixa projetado por dia (gráfico + saldo acumulado) na tela financeira | dev-fullstack + ux | Alto | M | Curva de saldo projetado por dia no período |
| 1.3 | Papéis/permissões finas por módulo (usar `module_permissions`) | dev-fullstack | Médio | M | Usuário "consulta" não vê botões de escrita |
| 1.4 | Envio de orçamento por e-mail (Resend + edge function) | dev-fullstack | Médio | M | E-mail enviado com o orçamento; sem custo sem credencial |

## P2 — Escala e evolução
| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 2.1 | PWA (instalável, offline básico) | dev-fullstack + ux | Médio | M | App instala e abre offline a shell |
| 2.2 | Domínio próprio (ex.: tchesystem.com.br) + HTTPS | architect + dev | Médio | S | Site no domínio próprio com cert válido |
| 2.3 | Métodos de custeio adicionais (PEPS/último preço) sem quebrar schema | dev-fullstack | Baixo | M | Config por organização; custo médio segue default |
| 2.4 | Multi-usuário por organização (convites) | dev-fullstack | Médio | M | Convidar colaborador; RLS respeita papel |

## P3 — Mercado/benchmark (só com custo/benefício escrito)
| # | Item | Agente | Valor | Esforço |
|---|------|--------|-------|---------|
| 3.1 | Integração de pagamentos/assinatura (Stripe) para monetizar | architect | Alto | L |
| 3.2 | IA para sugerir classificação de despesas na importação XML | architect + dev | Médio | M |
| 3.3 | Comparativo de período no dashboard (mês vs mês anterior) | dev-fullstack | Médio | S |

## Regras de gestão
1. Nenhum item entra em P0/P1 sem valor, esforço e critérios de verificação.
2. Itens de mercado (P3) entram só com análise de custo/benefício escrita pelo architect.
3. A cada ciclo, o architect reavalia prioridades com base em `docs/progresso.md`.
4. Itens concluídos migram para o histórico em `progresso.md` com o que se aprendeu.
