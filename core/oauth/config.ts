/**
 * Supabase Auth acts as the OAuth 2.1 authorization server. The Vercel Marketplace
 * integration sets NEXT_PUBLIC_SUPABASE_URL (and SUPABASE_URL) in the project.
 * With neither set, OAuth is simply off and only the static bearer token works.
 */
export function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

export const supabasePublishableKey = () => process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const issuerFor = (url: string) => `${url.replace(/\/$/, "")}/auth/v1`;

export const oauthEnabled = () => Boolean(supabaseUrl());
