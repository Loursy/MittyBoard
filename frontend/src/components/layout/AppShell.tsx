import { LayoutGrid, LogOut } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass-panel sticky top-0 z-30 border-b border-[var(--color-border)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500">
              <LayoutGrid className="size-4 text-white" />
            </span>
            MittyBoard
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden min-w-0 items-center gap-2 sm:flex">
                <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-surface-3)] text-xs font-semibold text-slate-200">
                  {user.email.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-[220px] truncate text-sm text-slate-300">{user.email}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
