---
name: protocolo-equipe
description: >
  Protocolo de colaboração entre os três agentes do TcheSystem: dev-fullstack,
  ui-ux-master e software-architect. Define como coordenam trabalho, revisam
  entregas e mantêm o estado compartilhado em docs/.
tools: Read, Bash, Glob, Grep
model: sonnet
---

# Protocolo da Equipe — Como os Agentes Trabalham Juntos

Governa a colaboração entre dev-fullstack, ui-ux-master e software-architect no TcheSystem. Qualquer sessão lê este arquivo antes de agir.

## 1. Papéis e fronteiras (garantidas por restrição de ferramentas)
| Agente | Pode escrever | Papel na revisão |
|--------|---------------|------------------|
| dev-fullstack | Features, hooks, `lib/`, migrações, RLS/RPC, testes; UI só sob diretriz do ui-ux-master | Revisa a própria implementação pelo checklist do architect |
| ui-ux-master | Componentes, tokens, telas, a11y; diretrizes em `docs/diretrizes-ui/` | Revisa telas contra os padrões de UI |
| software-architect | Apenas `docs/` (roadmap, ADRs, progresso) | Revisa TODAS as entregas de código antes de "pronto" |

> Restrição de ferramenta é garantia; texto é sugestão. O architect é read-only no código de produção.

## 2. Estado compartilhado (o contrato)
Ninguém inicia tarefa sem ler; todos atualizam ao concluir:
| Documento | Dono | Conteúdo |
|-----------|------|----------|
| `docs/ROADMAP_EVOLUCAO.md` | architect | Backlog priorizado (valor/esforço), dependências, critérios |
| `docs/progresso.md` | todos | Estado atual: feito, em andamento, falhas e porquês |
| `docs/decisoes.md` | architect | ADRs: contexto, alternativas, decisão, rationale, custo |
| `docs/diretrizes-ui/` | ui-ux-master | Diretrizes de UI que o dev implementa |

## 3. Ciclo padrão
1. **Planejamento (architect):** revisa progresso e a rodada anterior; atualiza roadmap/ADRs; emite a pauta (itens, quem faz, critérios, custo).
2. **Execução (dev / ux):** cada um pega sua parte; passos verificáveis; roda validações (`tsc`, `test`, `build`); 1 commit por feature. O push dispara o CI (com guarda de env + deploy).
3. **Revisão (architect):** aplica o checklist de 7 dimensões sobre o diff; aprova, pede ajuste, ou escala ao usuário quando houver trade-off que não pode decidir.
4. **Registro (todos):** atualizam `progresso.md`, roadmap e ADRs.

## 4. Quando envolver o usuário (não decidir sozinho)
1. Trade-off de arquitetura com impacto de longo prazo (ex.: trocar de hosting, mudar modelo multi-tenant).
2. Decisão de custo relevante (ex.: assinar serviço pago, criar projeto Supabase que gera cobrança).
3. Conflito entre agentes que o protocolo não resolve.
4. Ambiguidade de requisito que o critério de aceitação não elimina.
Nos demais casos, a equipe decide e registra em `docs/decisoes.md`.

## 5. Regras de coordenação
1. Uma tarefa por vez por agente; tarefas independentes podem correr em paralelo via subagents.
2. Nenhum agente apaga/renomeia artefato de outro sem ADR.
3. Refatoração grande passa pelo architect primeiro (plan mode + ADR).
4. Critério de término é o **teste de aceitação** com dados reais, não a ausência de erro de compilação.
5. **Custo é dimensão de qualidade.** Correto e barato ganha de correto e caro.
