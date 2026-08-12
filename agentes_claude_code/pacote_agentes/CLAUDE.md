# CLAUDE.md — Constituição do Projeto (Sistema Jurídico + Financeiro)

> **Como instalar:** copie este arquivo para a raiz do repositório do projeto (ou use como custom instructions no Claude Code). Ele é lido automaticamente no início de toda sessão e é compartilhado pelos três agentes especializados deste pacote.

## 1. O Projeto

Sistema integrado de gestão para escritório de advocacia, com dois domínios principais:

| Domínio | Descrição | Status |
|---------|-----------|--------|
| **Jurídico** | Cadastro de processos com enriquecimento multi-fonte (Datajud, portais de tribunal, sessão do advogado, APIs comerciais, upload de extrato) e IA de extração de prazos e datas | Especificado (prompts v3), em implementação |
| **Financeiro** | Contas a pagar/receber, fluxo de caixa projetado, importação XML de NFe/NFCe, classificações de receitas/despesas, cadastros de bancos e contas | Especificado, em implementação |

Princípios não negociáveis do produto, definidos pelo proprietário:

1. **Máximo de valor, mínimo de custo** — usar sempre a rota mais barata que resolve (fontes gratuitas antes de pagas; modelos baratos antes de caros; reaproveitar infraestrutura existente antes de adicionar dependências novas).
2. **Aproveitar a estrutura atual** — nunca recriar o que já funciona; extensões e adições, nunca recomeços.
3. **Confiabilidade jurídica** — dados inferidos por IA são sempre sugestões com confiança e badge "Revisar"; dados oficiais são a fonte da verdade.
4. **Entrega incremental** — cada ciclo termina com uma funcionalidade testável e verificável pelos critérios de aceitação.

## 2. Stack e Convenções

*(AJUSTE ESTA SEÇÃO para a stack real do seu projeto — ex.: React + TypeScript + Tailwind + Supabase/Postgres, ou a stack do Lovable. O Claude Code respeitará o que estiver aqui.)*

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, i18n pt-BR
- **Backend:** Edge Functions (ou o backend padrão do projeto), strict typing, sem lógica de negócio no frontend
- **Banco:** PostgreSQL — migrações versionadas, nunca alterar schema sem migração; nomes `snake_case`
- **Código:** Prettier + ESLint; commits convenção `type(scope): descrição`; hooks de validação após cada Write/Edit
- **Secrets:** chaves de API (Datajud, Escavador, etc.) somente em variáveis de ambiente; jamais no frontend ou em commits

## 3. Regras de Otimização de Recursos (custo de tokens e dinheiro)

1. **Contexto escopo primeiro:** leia apenas os arquivos necessários à tarefa; aponte arquivos específicos com `@` em vez de "investigue o código todo".
2. **Plan mode antes de editar** em qualquer mudança que cruze múltiplos arquivos ou módulos; mudanças triviais podem ser feitas direto.
3. **Subagents para trabalhos paralelos** (ex.: escrever parsers de vários tribunais, rodar critérios de aceitação por módulo).
4. **Hooks e scripts em vez de regras de texto:** validações determinísticas (lint, tests, typecheck) rodam sempre; regras comportamentais só orientam.
5. **IA/LLM com parcimônia:** usar apenas onde não há solução determinística; sempre com `structured output`, cache por hash do conteúdo e retry limitado (máx. 2).
6. **Fontes de dados em cascata:** gratuitas primeiro (Datajud → portais públicos), comerciais só habilitadas via ENV; cache de 1 hora por consulta.

## 4. Memória e Estado do Projeto

Antes de começar qualquer tarefa, os agentes DEVEM ler e depois atualizar:

- `docs/ROADMAP_EVOLUCAO.md` — backlog priorizado com critérios de verificação (fonte da verdade do que falta construir)
- `docs/progresso.md` — status atual: o que foi feito, o que está em andamento, o que falhou e por quê
- `docs/decisoes.md` — ADRs (Architecture Decision Records): decisões relevantes com contexto, alternativas e rationale

## 5. Fluxo de Trabalho Padrão (todos os agentes)

1. Ler `docs/progresso.md` e `docs/ROADMAP_EVOLUCAO.md` para orientação imediata.
2. Entender o escopo da tarefa e escopar o contexto (mínimo de arquivos possível).
3. Em plan mode quando aplicável, propor o plano antes de editar.
4. Implementar em pequenos passos verificáveis (1 commit por feature).
5. Rodar as validações (typecheck, lint, testes do escopo) e verificar o diff.
6. Atualizar `docs/progresso.md` e `docs/ROADMAP_EVOLUCAO.md` com o resultado.

## 6. Equipe de Agentes

Este projeto é mantido por três agentes especializados. Cada um tem seu arquivo de definição em `.claude/agents/`:

| Agente | Arquivo | Papel |
|--------|---------|-------|
| **dev-fullstack** | `.claude/agents/dev-fullstack.md` | Implementação: backend, integrações, parsers, rotinas, banco |
| **ui-ux-master** | `.claude/agents/ui-ux-master.md` | Interfaces, experiência do usuário, acessibilidade, padrões visuais |
| **software-architect** | `.claude/agents/software-architect.md` | Arquitetura, decisões técnicas, revisões, análise de custo, roadmap |

Regras de fronteira (garantidas por restrição de ferramentas, não apenas por texto): o dev-fullstack pode modificar código de implementação e UI sob diretriz do ui-ux-master; o software-architect é read-only no código de produção (analisa e propõe, não implementa diretamente em produção sem aprovação). O protocolo completo de colaboração está em `.claude/agents/protocolo-equipe.md`.
