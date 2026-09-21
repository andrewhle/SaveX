"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (isSignUp) {
        const needsConfirmation = await signUp(email, password);

        if (needsConfirmation) {
          setNotice("Check your inbox to confirm your address, then sign in.");
          setMode("signin");
        } else {
          router.push("/");
        }
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? "Create an account" : "Log in"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your budget is saved to your account, so it follows you across devices.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 md:p-5"
      >
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-negative">{error}</p>}
        {notice && <p className="text-sm text-positive">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSignUp ? (
            <UserPlus className="size-4" aria-hidden />
          ) : (
            <LogIn className="size-4" aria-hidden />
          )}
          {busy ? "Working…" : isSignUp ? "Create account" : "Log in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(isSignUp ? "signin" : "signup");
          setError(null);
          setNotice(null);
        }}
        className="self-center text-sm text-muted transition-colors hover:text-foreground"
      >
        {isSignUp
          ? "Already have an account? Log in"
          : "Need an account? Create one"}
      </button>
    </div>
  );
}
