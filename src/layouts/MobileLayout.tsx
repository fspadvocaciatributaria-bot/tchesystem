import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS, MOBILE_PRIMARY } from '@/app/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { ThemeToggle } from '@/features/theme/ThemeProvider';

export function MobileLayout() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-ink-soft border-b border-ink-border sticky top-0 z-10">
        <div className="text-lg font-bold text-strong">
          Tche<span className="text-gold">System</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="text-muted text-sm" onClick={() => setMenuOpen((v) => !v)}>
            ☰ Mais
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Outlet />
      </main>

      {/* Drawer "Mais" com todos os itens */}
      {menuOpen && (
        <div className="fixed inset-0 z-20 bg-black/60" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-ink-soft border-l border-ink-border p-3 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-muted mb-2 truncate">{user?.email}</div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                      isActive ? 'bg-ink-card text-gold' : 'text-muted hover:text-strong'
                    }`
                  }
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button className="btn-ghost w-full mt-3" onClick={() => signOut()}>
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-10 bg-ink-soft border-t border-ink-border grid grid-cols-4">
        {MOBILE_PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 text-[11px] ${
                isActive ? 'text-gold' : 'text-muted'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
