import { ThemeToggle } from "@/components/ThemeToggle";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage how the app looks and behaves.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold tracking-tight">Appearance</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          Choose a light or dark theme, or follow your system setting.
        </p>
        <ThemeToggle />
      </section>
    </div>
  );
}
