"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

/** Minimal email + password sign-in. Users are created in the Supabase dashboard; sign-ups stay off. */
export function LoginForm({ next, url, publishableKey }: { next: string; url: string; publishableKey: string }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const supabase = createBrowserClient(url, publishableKey);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 320 }}>
      <input name="email" type="email" placeholder="Email" required autoComplete="username" />
      <input name="password" type="password" placeholder="Password" required autoComplete="current-password" />
      <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
