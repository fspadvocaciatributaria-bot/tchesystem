import { useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth/AuthProvider';

/** Minha conta: dados do usuário e troca de senha. */
export function AccountPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setPassword('');
    setConfirm('');
    setMsg('Senha alterada com sucesso.');
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-strong mb-1">Minha conta</h1>
      <p className="text-sm text-muted mb-6">Dados de acesso da sua conta.</p>

      <section className="card mb-6">
        <div className="text-xs text-muted">E-mail</div>
        <div className="text-sm text-strong">{user?.email}</div>
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold text-strong mb-3">Alterar senha</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Nova senha</label>
            <input
              className="input"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div>
            <label className="label">Confirmar nova senha</label>
            <input
              className="input"
              type="password"
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-critical text-xs">{error}</p>}
          {msg && <p className="text-success text-xs">{msg}</p>}
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Salvando…' : 'Alterar senha'}
          </button>
        </form>
      </section>
    </div>
  );
}
