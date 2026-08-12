# Pacote de Agentes para o Claude Code — Instalação e Uso

Este pacote transforma o Claude Code em uma **equipe de três especialistas** (Dev Full-Stack, UI/UX Master e Arquiteto de Software) que mantém e evolui a sua ferramenta jurídica e financeira de forma autônoma, otimizada em custo e alinhada às melhores práticas de mercado de 2026.

## 1. O que há no pacote

| Arquivo | Papel |
|---------|-------|
| `CLAUDE.md` | **Constituição do projeto.** O Claude Code lê automaticamente no início de toda sessão. Contém a descrição do sistema, os princípios de custo, as convenções de stack, as regras de otimização de recursos e as regras de memória compartilhada. |
| `.claude/agents/dev-fullstack.md` | Agente de **implementação**: backend, integrações (Datajud, portais, APIs comerciais), parsers XML/PDF, rotinas agendadas. Roda no modelo Sonnet (equilíbrio qualidade/custo). |
| `.claude/agents/ui-ux-master.md` | Agente de **interface e experiência**: padrões visuais, estados de tela, acessibilidade, selos de origem de dados, dashboards. Implementa mudanças locais e escreve diretrizes formais para o dev. |
| `.claude/agents/software-architect.md` | Agente de **arquitetura**: revisa toda entrega de código com checklist de 7 dimensões (incluindo custo), mantém o roadmap priorizado, registra ADRs e faz benchmark de mercado. Roda no modelo Opus (só quando realmente necessário — é o maior custo). |
| `.claude/agents/protocolo-equipe.md` | **Protocolo de colaboração**: fluxo planejar→executar→revisar→registrar, fronteiras garantidas por restrição de ferramentas, regras de quando envolver você. |
| `docs/ROADMAP_EVOLUCAO.md` | Backlog priorizado (valor/esforço) dos três módulos: financeiro, enriquecimento v3 e IA de prazos, mais itens de benchmark de mercado. |
| `docs/progresso.md` | Memória de curto prazo: o que foi feito, o que está pendente, lições aprendidas. |
| `docs/decisoes.md` | Memória de longo prazo: ADRs com rationale e custo estimado. |

## 2. Instalação (2 minutos)

1. **Extraia o conteúdo de `.claude/`** para a raiz do repositório do seu projeto (no Lovable, use o modo de desenvolvimento com acesso ao código ou o painel de arquivos do projeto).
2. **Coloque o `CLAUDE.md`** na raiz do repositório.
3. **Coloque a pasta `docs/`** na raiz do repositório.
4. No `CLAUDE.md`, **ajuste a seção 2 (Stack e Convenções)** para a stack real do seu projeto — este é o único campo obrigatório, pois foi deixado parametrizável.

> **Nota sobre o Lovable:** o Lovable não expõe a pasta `.claude/` diretamente no editor padrão. As definições de agente funcionam como **prompts estruturados de persona**: cole o conteúdo de cada arquivo na conversa do Lovable no início da sessão correspondente (ex.: "Aja como o software-architect conforme este arquivo..."), ou use o Claude Code diretamente no código exportado, onde o pacote funciona integralmente com subagents, hooks e restrições de ferramentas.

## 3. Como usar no dia a dia

O uso depende do seu nível de autonomia desejado. Na forma **assistida**, você continua no controle e apenas distribui tarefas usando os agentes: "dev-fullstack: implemente a importação de extrato do PJe" ou "software-architect: revise a última rodada e priorize o backlog". Na forma **semi-autônoma**, inicie a sessão com o comando padrão da equipe — o Claude Code lê o protocolo, o architect assume o planejamento da rodada, e a equipe executa o ciclo completo, parando apenas quando precisar de você (trade-off de custo, decisão de assinatura comercial, conflito ou ambiguidade).

Independentemente do modo, as regras de custo estão embutidas: fontes gratuitas antes de pagas, rotas determinísticas antes de chamadas de LLM, cache e deduplicação obrigatórios, e o architect com Opus reservado para decisões (não para implementação rotineira).

## 4. Primeiro ciclo sugerido

Ao instalar, o primeiro item do roadmap já está preparado: o architect roda a **revisão de estado da base** (item 0.1/0.2) e devolve um relatório da arquitetura atual com a dívida técnica e o plano da primeira rodada de implementação. Você só precisa confirmar a stack no `CLAUDE.md` (seção 2) antes disso.

## 5. Boas práticas de mercado aplicadas no pacote

O desenho segue os padrões validados para agentes de código em produção: CLAUDE.md como memória permanente do projeto; restrição de ferramentas como fronteira de papel (mais confiável que instrução textual); o padrão Initializer + Coding Agent (arquivos de roadmap/progresso que dão orientação imediata a cada sessão, sem refazer análise); fan-out para subagents em trabalhos paralelos; hooks de validação; plan mode antes de mudanças grandes; e verificação sempre (typecheck, lint, testes e leitura de diff).
