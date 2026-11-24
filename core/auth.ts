import { timingSafeEqual } from "node:crypto";
import { withMcpAuth } from "mcp-handler";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Single-user trust boundary: one shared secret in MCP_TOKEN.
 * Fails closed: if MCP_TOKEN is unset, every request is rejected.
 */
export function withBearerToken(handler: (req: Request) => Response | Promise<Response>) {
  return withMcpAuth(
    handler,
    (_req, bearer) => {
      const expected = process.env.MCP_TOKEN;
      if (!expected || !bearer || !safeEqual(bearer, expected)) return undefined;
      return { token: bearer, clientId: "owner", scopes: [] };
    },
    { required: true },
  );
}
