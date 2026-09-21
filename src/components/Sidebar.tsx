"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, PiggyBank, Settings, Wallet } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const NAV_ITEMS = [
  { href: "/", label: "Budget", icon: PiggyBank },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="sticky top-0 z-30 shrink-0 border-b border-border bg-surface/95 backdrop-blur md:flex md:h-dvh md:w-64 md:flex-col md:border-r md:border-b-0">
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2 md:px-4 md:pt-6 md:pb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
            <Wallet className="size-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight">SaveX</span>
        </div>

        <AccountButton className="md:hidden" />
      </div>

      <nav
        aria-label="Main"
        className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 md:flex-1 md:flex-col md:overflow-x-visible md:px-4 md:pb-4"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:w-full ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-border p-4 md:block">
        {user?.email && (
          <p className="mb-2 truncate text-xs text-muted" title={user.email}>
            {user.email}
          </p>
        )}
        <AccountButton className="w-full" />
      </div>
    </aside>
  );
}

const ACCOUNT_BUTTON_CLASS =
  "flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-hover";

function AccountButton({ className = "" }: Readonly<{ className?: string }>) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <span
        className={`${ACCOUNT_BUTTON_CLASS} ${className} text-muted opacity-60`}
        aria-hidden
      >
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className={`${ACCOUNT_BUTTON_CLASS} ${className}`}>
        <LogIn className="size-4" aria-hidden />
        Log in
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className={`${ACCOUNT_BUTTON_CLASS} ${className}`}
    >
      <LogOut className="size-4" aria-hidden />
      Sign out
    </button>
  );
}
