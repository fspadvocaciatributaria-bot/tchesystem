import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useOrg } from '@/features/organization/OrgProvider';
import { formatBRL } from '@/lib/money/format';

interface ServiceWithFormation {
  id: string;
  name: string;
  category: string | null;
  estimated_hours: number;
  service_price_formations: { price_recommended: number; cost_total: number }[] | null;
}

export function PricingListPage() {
  const { organization } = useOrg();
  const orgId = organization?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['pricing-services', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, category, estimated_hours, service_price_formations(price_recommended, cost_total)')
        .eq('organization_id', orgId!)
        .order('name');
      if (error) throw error;
      return data as unknown as ServiceWithFormation[];
    },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-strong mb-1">Formação de Preço</h1>
      <p className="text-sm text-muted mb-6">
        Escolha um serviço para montar a formação de preço (custo, mínimo, recomendado, premium).
      </p>

      {isLoading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : !data || data.length === 0 ? (
        <div className="card border-dashed text-center py-10">
          <p className="text-muted text-sm">Cadastre um serviço primeiro.</p>
          <Link to="/services" className="btn-ghost mt-3 inline-flex">
            Ir para Serviços
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => {
            const formation = s.service_price_formations?.[0];
            return (
              <Link key={s.id} to={`/pricing/${s.id}`} className="card hover:border-gold/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-strong font-medium">{s.name}</div>
                    <div className="text-xs text-muted">{s.category ?? 'Sem categoria'} · {s.estimated_hours}h</div>
                  </div>
                </div>
                {formation ? (
                  <div className="mt-4">
                    <div className="text-xs text-muted">Preço recomendado</div>
                    <div className="text-xl font-semibold text-gold">{formatBRL(formation.price_recommended)}</div>
                    <div className="text-[11px] text-muted mt-1">Custo: {formatBRL(formation.cost_total)}</div>
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-critical">Preço ainda não formado →</div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
