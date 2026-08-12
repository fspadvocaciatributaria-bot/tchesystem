import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-full grid place-items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-strong">
            Tche<span className="text-gold">System</span>
          </div>
          <p className="text-xs text-muted mt-1">Formação de Preços & Gestão</p>
        </div>
        <div className="card">
          <h1 className="text-lg font-semibold text-strong mb-4">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) setError(error);
    else navigate('/');
  }

  return (
    <AuthShell title="Entrar">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">E-mail</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Senha</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-critical text-xs">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-xs text-muted">
        <Link to="/recover" className="hover:text-gold">
          Esqueci a senha
        </Link>
        <Link to="/signup" className="hover:text-gold">
          Criar conta
        </Link>
      </div>
    </AuthShell>
  );
}

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signUp(email, password, fullName);
    setBusy(false);
    if (error) setError(error);
    else setMsg('Conta criada! Verifique seu e-mail para confirmar e depois faça login.');
  }

  return (
    <AuthShell title="Criar conta">
      {msg ? (
        <div className="space-y-4">
          <p className="text-success text-sm">{msg}</p>
          <button className="btn-primary w-full" onClick={() => navigate('/login')}>
            Ir para login
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Nome completo</label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-critical text-xs">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? 'Criando…' : 'Criar conta'}
          </button>
        </form>
      )}
      <div className="mt-4 text-xs text-muted text-center">
        Já tem conta?{' '}
        <Link to="/login" className="hover:text-gold">
          Entrar
        </Link>
      </div>
    </AuthShell>
  );
}

export function RecoverPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const { error } = await resetPassword(email);
    if (error) setError(error);
    else setMsg('Se o e-mail existir, enviaremos um link de recuperação.');
  }

  return (
    <AuthShell title="Recuperar senha">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="label">E-mail</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-critical text-xs">{error}</p>}
        {msg && <p className="text-success text-xs">{msg}</p>}
        <button className="btn-primary w-full">Enviar link</button>
      </form>
      <div className="mt-4 text-xs text-muted text-center">
        <Link to="/login" className="hover:text-gold">
          Voltar ao login
        </Link>
      </div>
    </AuthShell>
  );
}
