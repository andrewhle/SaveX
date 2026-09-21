"use client";

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type Theme,
} from "@/lib/Theme";

const listeners = new Set<() => void>();

function subscribeToStoredTheme(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

function subscribeToSystemTheme(listener: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);

  return () => media.removeEventListener("change", listener);
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const getServerTheme = (): Theme => "system";
const getServerSystemTheme = (): ResolvedTheme => "dark";

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToStoredTheme,
    getStoredTheme,
    getServerTheme,
  );
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    getServerSystemTheme,
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    for (const listener of listeners) listener();
  }, []);

  return { theme, resolvedTheme, setTheme };
}

/** Keeps the `dark` class on <html> in sync with the selected theme. */
export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return children;
}
