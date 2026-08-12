# Decisões de Arquitetura (ADRs)

> **Dono:** software-architect. Toda decisão estrutural relevante do sistema é registrada aqui com contexto, alternativas, decisão e rationale.

## ADR-001 — Enriquecimento processual em 5 caminhos em cascata

**Data:** 12/08/2026. **Decisor:** especificado pelo proprietário, validado por análise técnica.

**Contexto:** Processos de tribunais como o PJe (ex.: TRT4) bloqueiam acesso automatizado com CAPTCHA; fontes gratuitas (Datajud) não cobrem todos os detalhes; APIs comerciais têm custo recorrente. O escritório precisa do máximo de informação com o mínimo de custo.

**Alternativas consideradas:** (a) scraping com resolução automática de captcha — rejeitada: instável, contorna barreira de segurança do tribunal, viola termos de uso; (b) depender só de API comercial — rejeitada: custo recorrente alto; (c) esperar dados chegarem — rejeitada: perde vantagem competitiva.

**Decisão:** orquestração provider-agnostic em cascata: Datajud → portais públicos (abort-on-captcha) → sessão conectada do advogado (login manual único + bookmarklet de captura) → APIs comerciais (somente com credencial em ENV) → upload de extrato do tribunal + IA. Merge canônico com origem por campo.

**Rationale:** cada caminho tem custo marginal decrescente e complementaridade real; o fluxo híbrido (extrato + IA) dá cobertura total a custo zero recorrente. Restrições por ferramenta garantem que nenhum caminho "ilegítimo" seja automatizado.

**Custo estimado:** zero recorrente em operação normal; créditos comerciais apenas se habilitados.

## ADR-002 — Dados inferidos por IA são sempre sugestões, nunca dados oficiais

**Data:** 12/08/2026. **Decisor:** proprietário (requisito de produto).

**Contexto:** O sistema usa LLM para inferir rito, fase, situação, risco, polo e resumos. Em domínio jurídico, uma data de prazo errada tem consequência grave.

**Decisão:** toda inferência de IA recebe selo de origem, score de confiança, badge "Revisar" abaixo de 0.7, e confirmação humana converte a origem para "manual". Metadados de auditoria (prompt, resposta bruta, modelo) persistidos por inferência.

**Rationale:** mantém o benefício da automação sem transferir risco de alucinação para o usuário final; atende expectativa de auditabilidade de escritório.

**Custo estimado:** marginal (campos de auditoria JSON).

## ADR-003 — Equipe multi-agente com fronteiras garantidas por restrição de ferramentas

**Data:** 12/08/2026. **Decisor:** proprietário + prática de mercado.

**Contexto:** A evolução contínua do sistema exige papéis especializados (implementação, UI/UX, arquitetura) coordenados sem supervisão constante.

**Decisão:** três agentes com arquivos de definição em `.claude/agents/`, fronteira de escrita garantida pela lista de ferramentas de cada um (architect read-only em produção), memória compartilhada via `docs/` (roadmap, progresso, ADRs, diretrizes UI) e ciclo padrão planejar→executar→revisar→registrar.

**Rationale:** restrição de ferramenta é garantia mecânica onde instrução textual é sugestão; o estado compartilhado em arquivos permite retomar trabalho entre sessões; o architect com Opus concentra as decisões de custo e estrutura.

**Custo estimado:** zero; reduz custo de retrabalho por retrabalho evitado.

## ADR-004 — Cache e deduplicação obrigatórios em toda fonte externa

**Data:** 12/08/2026. **Decisor:** especificação do proprietário (regra de custo).

**Contexto:** Consultas repetidas ao mesmo processo geram custo (créditos comerciais, tokens de LLM) e risco de duplicação de movimentações.

**Decisão:** cache de 1 hora por número consultado; deduplicação de movimentações por hash (`data + nome + complemento normalizado`); re-importação de extrato é no-op; rotinas diárias são incrementais, nunca reprocessam tudo.

**Rationale:** protege custo e integridade com custo de implementação mínimo.
