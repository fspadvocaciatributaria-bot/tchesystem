# Roadmap de Evolução — Sistema Jurídico + Financeiro

> **Dono do documento:** software-architect. **Atualizado em:** 12/08/2026.
> Priorização pela regra do projeto: **máximo valor, mínimo custo**, com quociente valor/esforço. Itens vêm dos três módulos especificados (financeiro, enriquecimento v3, IA de prazos) e do benchmark de mercado.

## Prioridade P0 — Fundação (valor imediato, custo quase zero)

| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 0.1 | Instalar o pacote de agentes (`CLAUDE.md` + `.claude/agents/` + `docs/`) e rodar a primeira revisão de estado da base | architect | Alto | S | Estado compartilhado legível por qualquer sessão |
| 0.2 | Revisão de arquitetura do que já existe (tabelas, endpoints, prompts constantes) com relatório de dívida técnica | architect | Alto | M | Report em `docs/decisoes.md` com ações |
| 0.3 | Completar roteamento Datajud + enriquecimento automático da capa do processo (tribunal→classe→assunto→partes→valor) | dev-fullstack | Alto | M | Critérios 1–3 e 5 do prompt v3 |
| 0.4 | IA de prazos: regras TPU determinísticas + LLM para textos livres, dias úteis e férias forenses | dev-fullstack | Alto | M | Critérios 7–9 do prompt v3 |
| 0.5 | Importação XML de NFe/NFCe + lançamentos financeiros + deducação por chave de acesso | dev-fullstack | Alto | M | Critérios do prompt financeiro |

## Prioridade P1 — Robustez do enriquecimento (diferencial competitivo)

| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 1.1 | Upload de extrato do tribunal (PDF/HTML/texto) + parsing por IA + conferência lado a lado | dev-fullstack + ux | Alto | M | Critérios 3–6 do prompt v3 |
| 1.2 | Parsers de portais públicos com abort-on-captcha (e-SAJ primeiro, depois o sistema dominante da carteira do cliente) | dev-fullstack | Médio | M | Snapshots de HTML + graceful degradation |
| 1.3 | Painel "Precisa de ação" + indicador de completude do formulário | dev-fullstack + ux | Alto | S | Critérios 4 e 8 do prompt v3 |
| 1.4 | UX dos 5 estados do botão de busca + selos de origem por campo | ui-ux-master | Médio | S | Checklist de UI/UX pronto |
| 1.5 | Rotina diária: re-sync Datajud, análise em lote de movimentos, alertas 5d/1d/no dia/vencido | dev-fullstack | Alto | M | Alertas disparam sem intervenção humana |

## Prioridade P2 — Sessão do advogado e comércio (acesso a processos PJe)

| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 2.1 | `tribunais_config` + wizard "conectar tribunal" + bookmarklet de captura de página | dev-fullstack | Alto | M | Critério 9 do prompt v3 |
| 2.2 | Provedor Escavador/JUDIT atrás de ENV (feature flag; só habilita com credencial) | dev-fullstack | Médio | S | Nenhum custo sem credencial configurada |
| 2.3 | Modo manual assistido: colar texto de petição pré-preenche formulário via IA | dev-fullstack | Médio | S | Critério 11 do prompt v3 |

## Prioridade P3 — Evolução de mercado (benchmark contínuo)

| # | Item | Agente | Valor | Esforço | Verificação |
|---|------|--------|-------|---------|-------------|
| 3.1 | Benchmark: monitoramento de diários oficiais e webhooks (o que Astrea/SaaSJus fazem e a que custo) | architect | Médio | M | Proposta com custo/benefício em roadmap |
| 3.2 | Leitura de PDF de petições com IA (prazo de recurso, audiência, depósito judicial) | dev-fullstack | Médio | M | Critérios de aceitação definidos antes |
| 3.3 | Dashboard financeiro: KPIs, fluxo projetado por dia, relatórios por classificação/pessoa/exportação CSV | dev-fullstack + ux | Alto | M | Critérios do prompt financeiro |
| 3.4 | Jurimetria leve: tempo médio de conclusão por tribunal/classe a partir dos dados já coletados | architect + dev | Alto | M | Relatório com amostra real |
| 3.5 | Avaliação periódica de custo de LLM: modelos menores/caches/rotas determinísticas que substituam chamadas atuais | architect | Médio | S | Tabela de custo por 1000 invocações atualizada |

## Regras de gestão deste documento

1. Nenhum item entra em P0/P1 sem estimativa de valor e esforço e critérios de verificação.
2. Itens de mercado (P3) entram só com análise de custo/benefício escrita pelo architect.
3. A cada ciclo de trabalho, o architect reavalia as prioridades com base no progresso real registrado em `docs/progresso.md`.
4. Itens concluídos migram para `docs/historico.md` com o que foi aprendido (custo real, armadilhas) — memória de longo prazo da equipe.
