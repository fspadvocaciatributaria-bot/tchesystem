# Progresso do Projeto

> **Última atualização:** 12/08/2026. Este arquivo é a memória compartilhada da equipe de agentes: qualquer sessão começa lendo-o para retomar o trabalho sem perder contexto.

## Estado atual

O sistema possui três módulos especificados em prompts de requisitos profissionais, prontos para implementação (ou parcialmente implementados) pelo Claude Code:

| Módulo | Especificação | Situação |
|--------|---------------|----------|
| Financeiro | `prompt_claude_code_contas_a_pagar_receber.md` | Especificado — aguarda confirmação da stack real |
| Enriquecimento processual multi-fonte v3 | `prompt_lovable_v3_robusto_multi_caminho.md` | Especificado — 5 caminhos em cascata |
| IA de prazos | `prompt_lovable_ia_prazos.md` | Especificado — dias úteis CPC + férias forenses |

A ferramenta base é o sistema jurídico em desenvolvimento (ambiente Lovable/Claude Code), com formulário de processo em blocos: identificação (número CNJ, tribunal, vara, comarca, classe, assunto, rito, distribuição), partes (cliente vinculado, polo, outras partes), caracterização (valor, situação, prioridade, risco, área, fase, objeto) e gestão (responsável, observações, auditoria).

## Descobertas técnicas registradas

1. **Datajud (CNJ)** é a API pública oficial, gratuita, cobrindo 91 tribunais; defasagem de horas/dias; apenas processos públicos; autenticação por APIKey em header.
2. **PJe exige CAPTCHA** antes de qualquer detalhe (verificado ao vivo no TRT4, processo `0020473-18.2026.5.04.0791`): automação backend pura não passa; a solução robusta é o caminho de upload de extrato + IA ou sessão conectada do advogado.
3. **e-SAJ** permite consulta pública via POST em `cpopg/open.do`; estrutura estável, exige parser DOM com snapshot.
4. **Escavador Business** (`api.escavador.com/api/v2/processos/{numero}`, Bearer PAT) é a principal rota comercial; custo por crédito informado no header `Creditos-Utilizados`.
5. **Regras de prazo determinísticas** por código TPU (art. 219 CPC, dias úteis; art. 214 CPC, férias forenses 20/12–20/01) evitam chamadas de LLM na maioria dos casos — princípio de custo aplicado.

## Pendências imediatas

1. O usuário precisa confirmar a **stack real** do projeto (React + Supabase? outra?) para ajustar `CLAUDE.md` seção 2.
2. Primeira execução do ciclo: architect roda a revisão de estado (item 0.2 do roadmap).
3. Confirmar qual tribunal/domínio predomina na carteira de clientes para escolher o primeiro parser de portal público (item 1.2).

## Lições do ciclo anterior

- Prompts de requisitos com critérios de aceitação numerados permitem que os próprios agentes verifiquem a implementação — manter esse padrão para todo módulo novo.
- Separar dados tabulados oficiais de dados inferidos por IA (com selo de origem e confiança) foi uma decisão de produto central e deve ser preservada em todas as novas telas.
