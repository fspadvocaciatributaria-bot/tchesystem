import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS } from '@/app/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { ThemeToggle } from '@/features/theme/ThemeProvider';

export function DesktopLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-full grid grid-cols-[240px_1fr]">
      <aside className="bg-ink-soft border-r border-ink-border flex flex-col">
        <div className="p-4 text-xl font-bold text-strong">
          Tche<span className="text-gold">System</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-ink-card text-gold'
                    : 'text-muted hover:text-strong hover:bg-ink-card/60'
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-border text-xs text-muted">
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="truncate">{user?.email}</span>
            <ThemeToggle />
          </div>
          <button className="btn-ghost w-full" onClick={() => signOut()}>
            Sair
          </button>
        </div>
      </aside>
      <main className="overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
