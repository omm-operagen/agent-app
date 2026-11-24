import { LoginForm } from "@/core/oauth/LoginForm";
import { supabasePublishableKey, supabaseUrl } from "@/core/oauth/config";
import { safeNext } from "@/core/oauth/supabase-server";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const url = supabaseUrl();
  const key = supabasePublishableKey();
  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Sign in</h1>
      {url && key ? <LoginForm next={safeNext(next)} url={url} publishableKey={key} /> : <p>Sign-in is not configured.</p>}
    </main>
  );
}
