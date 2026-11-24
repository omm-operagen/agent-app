import { getPublicOrigin, metadataCorsOptionsRequestHandler, protectedResourceHandler } from "mcp-handler";
import { issuerFor, supabaseUrl } from "@/core/oauth/config";

export const dynamic = "force-dynamic";

/** RFC 9728 metadata: tells MCP clients which authorization server issues tokens for /api/mcp. */
export function GET(req: Request) {
  const base = supabaseUrl();
  if (!base) return new Response("OAuth is not configured", { status: 404 });
  return protectedResourceHandler({
    authServerUrls: [issuerFor(base)],
    resourceUrl: `${getPublicOrigin(req)}/api/mcp`,
  })(req);
}

export const OPTIONS = metadataCorsOptionsRequestHandler();
