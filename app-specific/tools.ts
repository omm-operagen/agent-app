import { z } from "zod";
import { simpleElement } from "./diagram-schema";
import { createDiagram } from "./diagram-store";

type McpServer = Parameters<Parameters<typeof import("mcp-handler").createMcpHandler>[0]>[0];

export function registerDiagramTools(server: McpServer) {
  server.registerTool(
    "create_diagram",
    {
      title: "Create diagram",
      description:
        "Create a new diagram from simple shapes. Give every rectangle/ellipse/diamond a unique id, " +
        "then connect them with arrows using from/to ids. Returns the diagram id and its viewer path.",
      inputSchema: z.object({
        title: z.string().min(1).describe("Short diagram title"),
        elements: z.array(simpleElement).min(1),
      }),
    },
    async ({ title, elements }) => {
      const d = await createDiagram(title, elements);
      return {
        content: [{ type: "text", text: JSON.stringify({ id: d.id, title: d.title, viewerPath: `/d/${d.id}` }) }],
      };
    },
  );
}
