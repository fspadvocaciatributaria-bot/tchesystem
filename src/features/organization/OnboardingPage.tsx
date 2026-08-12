import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';

/**
 * Onboarding: cria a organização do usuário via RPC create_organization
 * (que também insere a membership 'owner' e as settings, atomicamente).
 */
export function OnboardingPage() {
  const { signOut } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [professionId, setProfessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: professions } = useQuery({
    queryKey: ['professions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professions')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc('create_organization', {
      p_name: name,
      p_profession: professionId || undefined,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ['current-org'] });
  }

  return (
    <div className="min-h-full grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-strong">
            Tche<span className="text-gold">System</span>
          </div>
          <p className="text-sm text-muted mt-1">Vamos configurar seu negócio</p>
        </div>
        <div className="card">
          <h1 className="text-lg font-semibold text-strong mb-1">Criar sua empresa/estúdio</h1>
          <p className="text-xs text-muted mb-4">
            Você será o proprietário. Poderá ajustar tudo depois em Configurações.
          </p>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="label">Nome da empresa/estúdio</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Studio Black"
                required
              />
            </div>
            <div>
              <label className="label">Profissão / nicho principal</label>
              <select
                className="input"
                value={professionId}
                onChange={(e) => setProfessionId(e.target.value)}
              >
                <option value="">Selecione…</option>
                {professions?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-critical text-xs">{error}</p>}
            <button className="btn-primary w-full" disabled={busy || !name}>
              {busy ? 'Criando…' : 'Criar e começar'}
            </button>
          </form>
        </div>
        <button className="text-xs text-muted mt-4 mx-auto block hover:text-gold" onClick={() => signOut()}>
          Sair
        </button>
      </div>
    </div>
  );
}
