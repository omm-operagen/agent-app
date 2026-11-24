import { randomUUID } from "node:crypto";
import { getStore } from "@/core/storage";
import type { Diagram, SimpleElement } from "./diagram-schema";

const COLLECTION = "diagram";

export async function createDiagram(title: string, elements: SimpleElement[]): Promise<Diagram> {
  const diagram: Diagram = {
    id: randomUUID().slice(0, 8),
    title,
    elements,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  await getStore().put(COLLECTION, diagram.id, diagram);
  return diagram;
}

export const getDiagram = (id: string) => getStore().get<Diagram>(COLLECTION, id);
