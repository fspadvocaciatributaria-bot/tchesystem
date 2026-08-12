import { useState } from 'react';
import { formatBRL, formatPercent } from '@/lib/money/format';
import { computePrice } from '@/lib/pricing';
import { useOrgCostParams } from '@/features/pricing/useOrgCostParams';
import { InfoTooltip } from '@/components/InfoTooltip';

/**
 * Simulador "e se…": cenários de impacto no preço a partir de custo, comissão,
 * imposto e margem. Usa o mesmo motor puro (lib/pricing). 100% no cliente.
 */
export function SimulatorPage() {
  const cost = useOrgCostParams();
  const [custo, setCusto] = useState(1000);
  const [comissao, setComissao] = useState(0); // fração
  const [margem, setMargem] = useState(cost.marginRecommended);
  const tax = cost.taxRate;

  const enc = comissao + tax; // encargos proporcionais ao preço
  const base = computePrice({ cost: custo, commission: comissao, tax, margin: margem });

  // Cenário 1: preço +10%
  const preco10 = base.price * 1.1;
  const lucro10 = preco10 * (1 - enc) - custo;
  const margem10 = preco10 > 0 ? lucro10 / preco10 : 0;

  // Cenário 2: custo +15% mantendo a margem
  const custo15 = custo * 1.15;
  const precoCusto15 = computePrice({ cost: custo15, commission: comissao, tax, margin: margem }).price;

  // Cenário 3: quanto cobrar para um lucro-alvo por serviço
  const [lucroAlvo, setLucroAlvo] = useState(500);
  const precoAlvo = 1 - enc > 0 ? (custo + lucroAlvo) / (1 - enc) : 0;

  // Cenário 4: desconto máximo sem prejuízo (lucro ≥ 0)
  const precoSemLucro = 1 - enc > 0 ? custo / (1 - enc) : 0;
  const descontoMax = Math.max(0, base.price - precoSemLucro);
  const descontoMaxPct = base.price > 0 ? descontoMax / base.price : 0;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-strong mb-1">Simulador "e se…"</h1>
        <p className="text-sm text-muted">
          Teste cenários e veja o impacto no preço e no lucro. Imposto atual da empresa: {formatPercent(tax)}.
        </p>
      </div>

      <div className="card grid sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Custo do serviço (R$)</label>
          <input className="input" type="number" step="0.01" value={custo} onChange={(e) => setCusto(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Comissão (%)</label>
          <input className="input" type="number" step="0.01" value={comissao * 100} onChange={(e) => setComissao((Number(e.target.value) || 0) / 100)} />
        </div>
        <div>
          <label className="label">Margem (%)</label>
          <input className="input" type="number" step="0.01" value={margem * 100} onChange={(e) => setMargem((Number(e.target.value) || 0) / 100)} />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center text-xs text-muted">
          Preço base calculado
          <InfoTooltip text="Preço = Custo ÷ (1 − comissão − impostos − margem)." origin="Simulador" />
        </div>
        <div className="text-3xl font-semibold text-gold mt-1">{base.feasible ? formatBRL(base.price) : '—'}</div>
        {!base.feasible && <p className="text-critical text-xs mt-1">Comissão + impostos + margem ≥ 100%: ajuste os valores.</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Scenario
          titulo="E se eu aumentar o preço em 10%?"
          linhas={[
            ['Novo preço', formatBRL(preco10)],
            ['Novo lucro', formatBRL(lucro10)],
            ['Margem efetiva', formatPercent(margem10)],
          ]}
        />
        <Scenario
          titulo="E se meu custo subir 15%?"
          linhas={[
            ['Novo custo', formatBRL(custo15)],
            ['Preço p/ manter a margem', formatBRL(precoCusto15)],
            ['Aumento no preço', formatBRL(precoCusto15 - base.price)],
          ]}
        />
        <Scenario
          titulo="Quanto cobrar para lucrar um valor por serviço?"
          input={
            <input className="input mt-2" type="number" step="0.01" value={lucroAlvo} onChange={(e) => setLucroAlvo(Number(e.target.value) || 0)} />
          }
          linhas={[['Preço necessário', formatBRL(precoAlvo)]]}
        />
        <Scenario
          titulo="Quanto posso dar de desconto sem prejuízo?"
          linhas={[
            ['Desconto máximo', formatBRL(descontoMax)],
            ['Em %', formatPercent(descontoMaxPct)],
            ['Preço mínimo (lucro 0)', formatBRL(precoSemLucro)],
          ]}
        />
      </div>
    </div>
  );
}

function Scenario({
  titulo,
  linhas,
  input,
}: {
  titulo: string;
  linhas: [string, string][];
  input?: React.ReactNode;
}) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-strong">{titulo}</h3>
      {input}
      <dl className="mt-3 space-y-1 text-sm">
        {linhas.map(([k, v], i) => (
          <div key={i} className="flex justify-between">
            <dt className="text-muted">{k}</dt>
            <dd className="text-strong">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
