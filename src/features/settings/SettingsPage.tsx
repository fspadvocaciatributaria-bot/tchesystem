import { useState, type FormEvent, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { productiveHoursPerMonth } from '@/lib/pricing';
import { seedStudioBlack } from './seedDemo';

/**
 * Configurações da organização: dados cadastrais + parâmetros que alimentam a
 * formação de preço (produtividade, imposto, margens). Ver docs/PRICING_RULES.md.
 */
export function SettingsPage() {
  const { organization, canWrite, refetch } = useOrg();
  const qc = useQueryClient();
  const [form, setForm] = useState<Record<string, number | string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name ?? '',
        trade_name: organization.trade_name ?? '',
        doc_number: organization.doc_number ?? '',
        phone: organization.phone ?? '',
        email: organization.email ?? '',
        working_days_per_month: organization.working_days_per_month,
        productive_hours_per_day: organization.productive_hours_per_day,
        available_hours_per_day: organization.available_hours_per_day,
        tax_rate: organization.tax_rate * 100,
        margin_min: organization.margin_min * 100,
        margin_recommended: organization.margin_recommended * 100,
        margin_premium: organization.margin_premium * 100,
      });
    }
  }, [organization]);

  if (!organization) return <p className="text-muted">Carregando…</p>;

  function set(name: string, value: string) {
    setForm((p) => ({ ...p, [name]: value }));
  }
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!organization) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    const payload = {
      name: String(form.name),
      trade_name: String(form.trade_name) || null,
      doc_number: String(form.doc_number) || null,
      phone: String(form.phone) || null,
      email: String(form.email) || null,
      working_days_per_month: num(form.working_days_per_month),
      productive_hours_per_day: num(form.productive_hours_per_day),
      available_hours_per_day: num(form.available_hours_per_day),
      tax_rate: num(form.tax_rate) / 100,
      margin_min: num(form.margin_min) / 100,
      margin_recommended: num(form.margin_recommended) / 100,
      margin_premium: num(form.margin_premium) / 100,
    };
    const { error } = await supabase.from('organizations').update(payload).eq('id', organization.id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMsg('Configurações salvas.');
    await qc.invalidateQueries({ queryKey: ['current-org'] });
    refetch();
  }

  const prodHoursMonth = productiveHoursPerMonth({
    workingDaysPerMonth: num(form.working_days_per_month),
    productiveHoursPerDay: num(form.productive_hours_per_day),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-white mb-1">Configurações</h1>
      <p className="text-sm text-muted mb-6">Dados da empresa e parâmetros de precificação.</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="card">
          <h2 className="text-sm font-semibold text-white mb-3">Empresa</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nome" name="name" value={form.name} onChange={set} span2 />
            <Field label="Nome fantasia" name="trade_name" value={form.trade_name} onChange={set} />
            <Field label="CNPJ/CPF" name="doc_number" value={form.doc_number} onChange={set} />
            <Field label="Telefone" name="phone" value={form.phone} onChange={set} />
            <Field label="E-mail" name="email" value={form.email} onChange={set} />
          </div>
        </section>

        <section className="card">
          <h2 className="text-sm font-semibold text-white mb-1">Produtividade</h2>
          <p className="text-xs text-muted mb-3">
            Usado para ratear custos fixos por hora. Horas produtivas mensais atuais:{' '}
            <span className="text-gold">{prodHoursMonth.toFixed(1)}h</span>.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dias trabalhados/mês" name="working_days_per_month" value={form.working_days_per_month} onChange={set} type="number" />
            <Field label="Horas produtivas/dia" name="productive_hours_per_day" value={form.productive_hours_per_day} onChange={set} type="number" />
            <Field label="Horas disponíveis/dia" name="available_hours_per_day" value={form.available_hours_per_day} onChange={set} type="number" />
          </div>
        </section>

        <section className="card">
          <h2 className="text-sm font-semibold text-white mb-1">Impostos e margens</h2>
          <p className="text-xs text-muted mb-3">
            Imposto sobre a receita (ex.: Simples) e as três margens (sobre o preço). Regra: mín ≤ recomendada ≤ premium.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Imposto (%)" name="tax_rate" value={form.tax_rate} onChange={set} type="number" />
            <Field label="Margem mínima (%)" name="margin_min" value={form.margin_min} onChange={set} type="number" />
            <Field label="Margem recomendada (%)" name="margin_recommended" value={form.margin_recommended} onChange={set} type="number" />
            <Field label="Margem premium (%)" name="margin_premium" value={form.margin_premium} onChange={set} type="number" />
          </div>
        </section>

        {error && <p className="text-critical text-sm">{error}</p>}
        {msg && <p className="text-success text-sm">{msg}</p>}
        {canWrite && (
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar configurações'}
          </button>
        )}
      </form>

      {canWrite && <DemoDataSection orgId={organization.id} onDone={() => qc.invalidateQueries()} />}
    </div>
  );
}

function DemoDataSection({ orgId, onDone }: { orgId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!confirm('Carregar dados demonstrativos (Studio Black)? Isso adiciona registros de exemplo à sua organização.')) return;
    setBusy(true);
    setErr(null);
    setResult(null);
    try {
      const summary = await seedStudioBlack(orgId);
      setResult(`Criado: ${summary}.`);
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao carregar demo');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-6 border-dashed">
      <h2 className="text-sm font-semibold text-white mb-1">Dados demonstrativos</h2>
      <p className="text-xs text-muted mb-3">
        Popula a organização com um exemplo de estúdio de tatuagem (profissionais, produtos com estoque,
        custos, serviços, clientes, meta e fluxo de caixa) para você explorar o sistema.
      </p>
      <button className="btn-ghost" onClick={load} disabled={busy}>
        {busy ? 'Carregando…' : 'Carregar dados demo (Studio Black)'}
      </button>
      {result && <p className="text-success text-xs mt-2">{result}</p>}
      {err && <p className="text-critical text-xs mt-2">{err}</p>}
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  span2 = false,
}: {
  label: string;
  name: string;
  value: number | string | undefined;
  onChange: (name: string, value: string) => void;
  type?: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? 'col-span-2' : 'col-span-1'}>
      <label className="label">{label}</label>
      <input
        className="input"
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={String(value ?? '')}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
}
