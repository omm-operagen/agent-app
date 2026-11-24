import { timingSafeEqual } from "node:crypto";
import { withMcpAuth } from "mcp-handler";
import { verifySupabaseToken } from "./oauth/verify";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Two ways in, one trust boundary (the owner):
 *  1. A static bearer token in MCP_TOKEN: for clients that can set headers (Claude Code).
 *  2. An OAuth access token from Supabase Auth: for clients that can only do OAuth (claude.ai, Cowork).
 * Fails closed: with no MCP_TOKEN and no OAuth configuration, every request is rejected.
 */
export function withOwnerAuth(handler: (req: Request) => Response | Promise<Response>) {
  return withMcpAuth(
    handler,
    async (_req, bearer) => {
      if (!bearer) return undefined;
      const expected = process.env.MCP_TOKEN;
      if (expected && safeEqual(bearer, expected)) return { token: bearer, clientId: "owner", scopes: [] };
      const verified = await verifySupabaseToken(bearer);
      return verified ? { token: bearer, clientId: verified.clientId, scopes: [] } : undefined;
    },
    { required: true },
  );
}
