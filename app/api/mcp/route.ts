import { createAuthedMcpRoute } from "@/core/mcp";
import { registerDiagramTools } from "@/app-specific/tools";

const handler = createAuthedMcpRoute("agent-app", registerDiagramTools);

export { handler as GET, handler as POST };
