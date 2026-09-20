"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Settings, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-30 shrink-0 border-b border-border bg-surface/95 backdrop-blur md:h-dvh md:w-64 md:border-r md:border-b-0">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 md:pt-6">
        <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Wallet className="size-4" aria-hidden />
        </span>
        <span className="text-base font-semibold tracking-tight">Budget</span>
      </div>

      <div className="px-4 pb-3">
        <SearchBar />
      </div>

      <nav
        aria-label="Main"
        className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-4 md:flex-col md:overflow-x-visible"
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
    </aside>
  );
}

function SearchBar() {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        placeholder="Search"
        aria-label="Search"
        className="w-full rounded-lg border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </div>
  );
}
