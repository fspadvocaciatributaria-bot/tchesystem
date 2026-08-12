# Regras e Fórmulas de Formação de Preço

> **Fonte da verdade** das regras financeiras. Toda fórmula aqui deve ter implementação
> correspondente em `src/lib/pricing/` com teste unitário. Nada de fórmula "escondida" em componente.
> Mudanças de regra que alteram resultado devem ser registradas em [DECISIONS.md](DECISIONS.md).

Todos os valores monetários são `numeric(14,4)` no banco e manipulados como números em
reais (não centavos) no `lib/pricing`. Arredondamento **apenas na apresentação** (2 casas, pt-BR),
nunca no meio do cálculo.

---

## 1. Conversão de periodicidade → base mensal

Para somar custos com periodicidades diferentes, converte-se tudo para **valor mensal equivalente**.

| Periodicidade   | Fator (× valor) → mensal            |
|-----------------|--------------------------------------|
| `monthly`       | `1`                                  |
| `weekly`        | `52 / 12` = `4.33333…`               |
| `yearly`        | `1 / 12` = `0.08333…`                |
| `daily`         | `365.25 / 12` = `30.4375`            |
| `custom`        | fator informado pelo usuário (`custom_factor`) |

```
valorMensal(valor, periodicidade) = valor × fator(periodicidade)
```

> **Decisão D-001:** usamos 365.25 dias/ano (média com anos bissextos) e 52 semanas/ano.

---

## 2. Custo fixo mensal total e rateio por hora produtiva

```
custoFixoMensalTotal = Σ valorMensal(custoFixo_i)   (apenas custos ativos)
```

**Horas produtivas mensais** = horas realmente faturáveis no mês, definidas nas configurações
da organização (ou por profissional):

```
horasProdutivasMes = diasTrabalhadosMes × horasProdutivasPorDia
```

`horasProdutivasPorDia` ≤ `horasDisponiveisPorDia` (produtivas descontam pausas, deslocamento, etc.).

**Custo fixo por hora produtiva:**

```
custoFixoHora = custoFixoMensalTotal / horasProdutivasMes      (se horasProdutivasMes > 0)
```

**Rateio de custo fixo para um serviço** de duração `horasServico`:

```
rateioFixoServico = custoFixoHora × horasServico
```

> **Guarda:** se `horasProdutivasMes == 0`, `custoFixoHora = 0` e o sistema emite alerta
> ("Defina suas horas produtivas para ratear custos fixos"). Nunca dividir por zero.

---

## 3. Componentes de custo de um serviço

Um serviço em formação acumula componentes. O **custo total de execução** é:

```
custoMaoDeObra   = Σ custoMaoDeObra_i        (ver §4)
custoMateriais   = Σ (qtdUsada_i × custoUnitario_i)   (ver §5)
custoAdicional   = Σ custosAdicionais_i       (deslocamento, taxas, etc.)
rateioFixo       = rateioFixoServico          (§2)

CUSTO = custoMaoDeObra + custoMateriais + custoAdicional + rateioFixo
```

`CUSTO` é o piso absoluto: abaixo dele o serviço dá prejuízo antes mesmo de comissão/impostos.

---

## 4. Mão de obra — modelos de remuneração

Cada componente de mão de obra tem um `modelo` e produz um custo:

| Modelo               | Cálculo do custo do componente                          |
|----------------------|---------------------------------------------------------|
| `hourly`             | `horas × valorHora`                                     |
| `per_service`        | `valorFixoServico`                                      |
| `commission_percent` | ver §6 (depende do preço → resolvido no cálculo do preço) |
| `monthly_cost`       | rateado por hora: `(custoMensal / horasProdutivasMes) × horas` |
| `daily_cost`         | rateado por hora: `(custoDiario / horasProdutivasDia) × horas`  |

> **Comissão percentual** não entra em `custoMaoDeObra` fixo — ela incide sobre o **preço de venda**
> e por isso é tratada como custo proporcional ao preço (§6), resolvida junto com impostos.

---

## 5. Custo real de material (custo médio ponderado)

> **Decisão D-002:** método de custeio = **custo médio ponderado**, recalculado a cada entrada.
> Estrutura preparada para PEPS/último preço no futuro sem quebra de schema.

A cada **entrada** de estoque:

```
novoCustoMedio = (estoqueAtual × custoMedioAtual + qtdEntrada × custoUnitEntrada)
                 / (estoqueAtual + qtdEntrada)
```

Custo do material consumido em um serviço:

```
custoMaterialServico = qtdUsada × custoMedioAtual
```

Saídas e ajustes **não** alteram o custo médio (apenas quantidade).

---

## 6. Preço, comissão e impostos (custos proporcionais ao preço)

Comissão percentual e impostos incidem sobre o **preço de venda** `P`, criando dependência circular
(o preço depende deles e eles dependem do preço). Resolvemos algebricamente.

Sejam:
- `CUSTO` = custo de execução (§3), já **excluindo** comissão percentual e impostos.
- `c` = soma das alíquotas de **comissão percentual** (fração, ex.: 0.30).
- `t` = soma das alíquotas de **impostos** sobre venda (fração, ex.: 0.06 Simples). Ver **D-003**.
- `m` = margem de lucro desejada como fração **sobre o preço** (markup sobre receita). Ver **D-004**.

Queremos que, no preço `P`:

```
P = CUSTO + c·P + t·P + m·P
P · (1 − c − t − m) = CUSTO
```

**Fórmula-mestra do preço:**

```
P = CUSTO / (1 − c − t − m)          exige (c + t + m) < 1
```

> **Guarda:** se `(c + t + m) ≥ 1`, o preço é impossível (margem+encargos consomem 100%+).
> O sistema bloqueia e explica: "A soma de comissão + impostos + margem precisa ser menor que 100%."

Decomposição no preço `P` (para o breakdown visual):

```
comissaoValor = c · P
impostoValor   = t · P
lucroValor     = m · P
custoValor      = CUSTO   (= P − comissaoValor − impostoValor − lucroValor)
```

---

## 7. Os quatro valores exibidos (nunca mostrar só um)

Cada um usa a fórmula-mestra §6 com uma margem diferente:

| Valor              | Margem usada        | Significado                                            |
|--------------------|---------------------|--------------------------------------------------------|
| **CUSTO**          | —                   | `CUSTO` puro (§3). Quanto custa executar.              |
| **PREÇO MÍNIMO**   | `m_min` (config)    | Menor preço que preserva a margem mínima e cobre comissão+impostos+custos variáveis integralmente. |
| **PREÇO RECOMENDADO** | `m_rec` (config) | Preço ideal para atingir a margem/meta configurada.   |
| **PREÇO PREMIUM**  | `m_prem` (config)   | Preço com margem maior, quando aplicável.             |

Valores padrão sugeridos (configuráveis por organização — **D-004**):
`m_min = 0.10`, `m_rec = 0.30`, `m_prem = 0.50`.

Regra: `m_min ≤ m_rec ≤ m_prem`. O sistema valida essa ordem.

Cada valor é acompanhado do **breakdown** (custoValor, comissaoValor, impostoValor, lucroValor)
para dar rastreabilidade ("como este número foi calculado").

---

## 8. Valor da hora inteligente

```
custoHora        = custoFixoHora + custoVariavelHoraMedio + custoMaoDeObraHora
valorMinimoHora  = custoHora / (1 − c − t − m_min)
valorRecomendadoHora = custoHora / (1 − c − t − m_rec)
```

- `custoMaoDeObraHora`: valor/hora da mão de obra base do profissional.
- `custoVariavelHoraMedio`: custos variáveis médios atribuídos por hora (config; default 0).

**Valor/hora para atingir uma meta** — ver §9.

---

## 9. Meta de lucro (área "Minha Meta") e simulador

Entrada: `lucroDesejadoMes` (ex.: R$ 15.000).

```
faturamentoNecessario = (custoFixoMensalTotal + lucroDesejadoMes) / (1 − c − t)
```

> Interpretação: a receita precisa cobrir custos fixos + o lucro alvo, já descontando a fração
> que comissão e impostos consomem de cada real faturado. Custos variáveis de materiais são
> por-serviço e entram no ticket, não aqui (**D-005**).

Derivados:

```
valorHoraMeta   = faturamentoNecessario / horasProdutivasMes
valorDiaMeta    = faturamentoNecessario / diasTrabalhadosMes
nServicosMeta   = faturamentoNecessario / ticketMedio        (se ticketMedio > 0)
ticketMedioNecessario = faturamentoNecessario / nServicosPlanejados
```

**Simulações what-if** (MVP cobre a de metas):
- "Se eu trabalhar N dias/semana, quanto faturar por dia?" → recalcula `diasTrabalhadosMes`.
- "Se meu ticket médio for X, quantos clientes preciso?" → `nServicosMeta`.

---

## 10. Orçamento

Um orçamento parte de um preço formado `precoFormado` (normalmente o recomendado, editável):

```
subtotal        = Σ (quantidade_i × precoUnitario_i)
descontoValor    = desconto informado (valor ou % → valor)
totalOrcamento  = subtotal − descontoValor         (≥ 0; bloquear negativo)
```

Alerta se `precoUnitario < precoMinimo` do serviço → "abaixo do preço mínimo".

---

## Resumo das decisões financeiras em aberto (confirmar)

Ver [DECISIONS.md](DECISIONS.md): **D-003** (tratamento de impostos — Simples Nacional %),
**D-004** (margem sobre preço vs. sobre custo), **D-005** (custos variáveis na meta).
Esses três alteram o resultado numérico e serão confirmados com o usuário antes da FASE 3.
