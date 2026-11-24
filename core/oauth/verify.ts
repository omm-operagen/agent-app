import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { issuerFor, supabaseUrl } from "./config";

export type Owner = { sub?: string; email?: string };

/**
 * Single-user trust boundary. Signing in is not enough: anyone with an account on the
 * Supabase project would otherwise pass. Set OWNER_USER_ID (preferred) or OWNER_EMAIL.
 * With neither set, no OAuth identity is accepted.
 */
export function isOwner(who: Owner): boolean {
  const id = process.env.OWNER_USER_ID;
  const email = process.env.OWNER_EMAIL;
  if (id) return who.sub === id;
  if (email) return Boolean(who.email) && who.email!.toLowerCase() === email.toLowerCase();
  return false;
}

let jwks: JWTVerifyGetKey | undefined;
const remoteKeys = (issuer: string) => (jwks ??= createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)));

/**
 * Verify a Supabase-issued access token: signature (via the project's public keys),
 * issuer, audience, expiry, then that it belongs to the owner. Returns the token's
 * client_id (present on OAuth tokens) or undefined if the token is not acceptable.
 * `keys` is injectable so tests need no network.
 */
export async function verifySupabaseToken(token: string, keys?: JWTVerifyGetKey) {
  const base = supabaseUrl();
  if (!base) return undefined;
  const issuer = issuerFor(base);
  try {
    const { payload } = await jwtVerify(token, keys ?? remoteKeys(issuer), {
      issuer,
      audience: "authenticated",
      algorithms: ["ES256", "RS256"],
    });
    if (!isOwner({ sub: payload.sub, email: payload.email as string | undefined })) return undefined;
    return { clientId: (payload.client_id as string | undefined) ?? "supabase-session", sub: payload.sub };
  } catch {
    return undefined;
  }
}
