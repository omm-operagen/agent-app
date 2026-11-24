import { z } from "zod";

/**
 * The agent-facing "simple shapes" format. Deliberately small: agents describe boxes,
 * text and arrows between box ids; the viewer turns this into full Excalidraw elements.
 */
const style = {
  strokeColor: z.string().optional().describe("CSS color, e.g. #1e1e1e"),
  backgroundColor: z.string().optional().describe("CSS color, e.g. #a5d8ff"),
};

const shape = (type: "rectangle" | "ellipse" | "diamond") =>
  z.object({
    type: z.literal(type),
    id: z.string().describe("Unique id. Arrows refer to shapes by this id."),
    x: z.number(),
    y: z.number(),
    width: z.number().default(160),
    height: z.number().default(60),
    label: z.string().optional().describe("Text centered inside the shape"),
    ...style,
  });

export const simpleElement = z.discriminatedUnion("type", [
  shape("rectangle"),
  shape("ellipse"),
  shape("diamond"),
  z.object({
    type: z.literal("text"),
    id: z.string().optional(),
    x: z.number(),
    y: z.number(),
    text: z.string(),
    ...style,
  }),
  z.object({
    type: z.literal("arrow"),
    id: z.string().optional(),
    from: z.string().describe("id of the shape the arrow starts at"),
    to: z.string().describe("id of the shape the arrow ends at"),
    label: z.string().optional(),
    ...style,
  }),
]);

export type SimpleElement = z.infer<typeof simpleElement>;

export type Diagram = {
  id: string;
  title: string;
  elements: SimpleElement[];
  version: number;
  updatedAt: string;
};
