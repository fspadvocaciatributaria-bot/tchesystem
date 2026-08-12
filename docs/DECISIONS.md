# Registro de Decisões (ADR) — FSP

Decisões de produto/arquitetura, especialmente as que **alteram o resultado financeiro**.
Formato: contexto → decisão → impacto. Decisões marcadas 🟡 **aguardam confirmação do usuário**
antes da FASE 3 (formação de preço).

---

### D-001 — Base de conversão de periodicidade ✅
Ano = 365.25 dias (média com bissextos), 52 semanas. Fatores mensais em [PRICING_RULES.md](PRICING_RULES.md) §1.
**Impacto:** diferenças pequenas no rateio; escolha documentada e testável.

### D-002 — Método de custeio de material ✅
**Custo médio ponderado**, recalculado a cada entrada. Saídas/ajustes não mexem no custo médio.
Schema preparado para PEPS/último preço no futuro (colunas `avg_cost` + histórico completo).
**Impacto:** custo do material no serviço usa `avg_cost` vigente.

### D-003 — Tratamento de impostos ✅ (confirmado 2026-08-11)
**Decisão:** um campo único `tax_rate` (fração) por organização, aplicado como imposto
sobre a **receita** de cada serviço (modelo compatível com Simples Nacional simplificado —
alíquota efetiva sobre faturamento). Fórmula-mestra: `P = CUSTO / (1 − c − t − m)`.
Evolui para faixas do Simples (anexo/RBT12) no futuro sem quebra de schema.
**Impacto:** muda o preço final; parametrizado por organização.

### D-004 — Margem sobre preço (markup na receita) ✅ (confirmado 2026-08-11)
**Decisão:** margem como fração **do preço de venda** (ex.: 30% = o lucro é 30% do preço),
tornando comissão, impostos e lucro aditivos no denominador: `P = CUSTO / (1 − c − t − m)`.
Descartada a margem sobre custo por não compor linearmente com comissão/impostos percentuais.
**Impacto:** define o preço final.

### D-005 — Custos variáveis na meta de lucro ✅ (confirmado 2026-08-11)
**Decisão:** na fórmula de faturamento necessário (§9), numerador = custos fixos + lucro alvo;
custos variáveis de material entram por-serviço no ticket médio, não no cálculo da meta global,
evitando dupla contagem.
**Impacto:** meta global não sobre-conta material.

### D-006 — Margens padrão ✅ (ajustável)
`margin_min=10%`, `margin_recommended=30%`, `margin_premium=50%` como defaults por organização,
editáveis em Configurações. Regra `min ≤ rec ≤ premium` validada no banco e no frontend.

### D-007 — Formatação monetária ✅
`Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})` no frontend; banco armazena
`numeric(14,4)`. Arredondamento só na exibição (2 casas).

---

> D-003, D-004 e D-005 **confirmadas pelo usuário em 2026-08-11** com as opções recomendadas.
> O `lib/pricing` implementa exatamente essas regras, mantendo os parâmetros configuráveis
> por organização (mudanças futuras são de dados, não de código).
