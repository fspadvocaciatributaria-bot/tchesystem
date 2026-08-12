import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { NAV_ITEMS } from '@/app/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { ThemeToggle } from '@/features/theme/ThemeProvider';

const STORAGE_KEY = 'tche-sidebar-collapsed';

export function DesktopLayout() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  function toggle() {
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="min-h-full flex">
      <aside
        className={`shrink-0 bg-ink-soft border-r border-ink-border flex flex-col transition-[width] duration-200 ease-out ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {/* Marca + botão recolher */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-ink-border">
          {!collapsed ? (
            <div className="text-lg font-bold text-strong tracking-tight">
              Tche<span className="text-gold">System</span>
            </div>
          ) : (
            <div className="w-full text-center text-lg font-bold text-gold">T</div>
          )}
          {!collapsed && (
            <button
              onClick={toggle}
              title="Recolher menu"
              className="w-7 h-7 rounded-lg text-muted hover:text-strong hover:bg-ink-card flex items-center justify-center transition-colors"
            >
              «
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-gold/10 text-gold font-medium'
                    : 'text-muted hover:text-strong hover:bg-ink-card/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Barra de acento no item ativo */}
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gold transition-opacity ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <span className="w-5 text-center text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="p-2 border-t border-ink-border">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggle}
                title="Expandir menu"
                className="w-9 h-9 rounded-lg text-muted hover:text-strong hover:bg-ink-card flex items-center justify-center transition-colors"
              >
                »
              </button>
              <ThemeToggle />
              <button
                onClick={() => signOut()}
                title="Sair"
                className="w-9 h-9 rounded-lg text-muted hover:text-critical hover:bg-ink-card flex items-center justify-center transition-colors"
              >
                ⎋
              </button>
            </div>
          ) : (
            <div className="text-xs text-muted">
              <div className="flex items-center justify-between mb-2 gap-2 px-1">
                <span className="truncate">{user?.email}</span>
                <ThemeToggle />
              </div>
              <button className="btn-ghost w-full" onClick={() => signOut()}>
                Sair
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
