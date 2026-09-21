"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";

const LOGIN_PATH = "/login";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    }

    if (user && pathname === LOGIN_PATH) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-sm text-muted">
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-dvh place-items-center px-4 py-8">
        {pathname === LOGIN_PATH ? children : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 px-3 py-4 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
