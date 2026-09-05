import { ChevronRight, LayoutGrid, LogOut } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { BreadcrumbProvider } from "../../context/BreadcrumbContext";
import { useAuth } from "../../hooks/useAuth";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";

function Breadcrumbs() {
  const { crumbs } = useBreadcrumbs();
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-slate-600" />}
            {crumb.to && !isLast ? (
              <Link to={crumb.to} className="text-slate-400 transition-colors hover:text-white">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-slate-200" : "text-slate-400"}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <BreadcrumbProvider>
      <div className="flex min-h-screen flex-col">
        <header className="glass-panel sticky top-0 z-30 border-b border-[var(--color-border)]">
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-70"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.6), rgba(232,121,249,0.5), transparent)",
            }}
            aria-hidden
          />
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="group flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-[0_2px_8px_-2px_rgba(99,102,241,0.6)] transition-transform duration-200 group-hover:scale-105 group-hover:rotate-[-4deg]">
                <LayoutGrid className="size-4 text-white" />
              </span>
              MittyBoard
            </Link>

            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden min-w-0 items-center gap-2 sm:flex">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/25 text-xs font-semibold text-indigo-200 ring-1 ring-inset ring-white/10">
                    {user.email.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-[220px] truncate text-sm text-slate-300">{user.email}</span>
                </div>
              )}
              <button
                onClick={logout}
                className="focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </BreadcrumbProvider>
  );
}
