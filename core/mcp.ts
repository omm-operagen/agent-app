import { createMcpHandler } from "mcp-handler";
import { withBearerToken } from "./auth";

type McpServer = Parameters<Parameters<typeof createMcpHandler>[0]>[0];

/** Reusable plumbing: an authenticated MCP route handler. The app supplies only its tools. */
export function createAuthedMcpRoute(name: string, registerTools: (server: McpServer) => void) {
  const handler = createMcpHandler(registerTools, { serverInfo: { name, version: "0.1.0" } });
  return withBearerToken(handler);
}
