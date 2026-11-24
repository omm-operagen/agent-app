import { z } from "zod";
import { simpleElement } from "./diagram-schema";
import { createDiagram, getDiagram, listDiagrams, updateDiagram } from "./diagram-store";

type McpServer = Parameters<Parameters<typeof import("mcp-handler").createMcpHandler>[0]>[0];

const text = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] });
const fail = (message: string) => ({ content: [{ type: "text" as const, text: message }], isError: true });

const elementsField = z
  .array(simpleElement)
  .min(1)
  .describe("Every rectangle/ellipse/diamond needs a unique id; arrows connect shapes by from/to id.");

export function registerDiagramTools(server: McpServer) {
  server.registerTool(
    "create_diagram",
    {
      title: "Create diagram",
      description: "Create a new diagram from simple shapes. Returns the diagram id and its viewer path.",
      inputSchema: z.object({ title: z.string().min(1), elements: elementsField }),
    },
    async ({ title, elements }) => {
      const d = await createDiagram(title, elements);
      return text({ id: d.id, title: d.title, version: d.version, viewerPath: `/d/${d.id}` });
    },
  );

  server.registerTool(
    "list_diagrams",
    {
      title: "List diagrams",
      description: "List existing diagrams, most recently changed first.",
      inputSchema: z.object({}),
    },
    async () => text(await listDiagrams()),
  );

  server.registerTool(
    "get_diagram",
    {
      title: "Get diagram",
      description: "Read a diagram's current shapes. Call this before update_diagram so you edit what is really there.",
      inputSchema: z.object({ id: z.string() }),
    },
    async ({ id }) => {
      const d = await getDiagram(id);
      return d ? text(d) : fail(`No diagram with id ${id}`);
    },
  );

  server.registerTool(
    "update_diagram",
    {
      title: "Update diagram",
      description:
        "Replace a diagram's shapes (and optionally its title). `elements` is the COMPLETE new list, " +
        "not a patch: include every shape you want to keep. Open viewers refresh within a few seconds.",
      inputSchema: z.object({ id: z.string(), title: z.string().min(1).optional(), elements: elementsField.optional() }),
    },
    async ({ id, title, elements }) => {
      const d = await updateDiagram(id, { title, elements });
      return d ? text({ id: d.id, version: d.version, viewerPath: `/d/${d.id}` }) : fail(`No diagram with id ${id}`);
    },
  );
}
