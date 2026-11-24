import { randomUUID } from "node:crypto";
import { getStore } from "@/core/storage";
import type { Diagram, SimpleElement } from "./diagram-schema";

const COLLECTION = "diagram";

export async function createDiagram(title: string, elements: SimpleElement[]): Promise<Diagram> {
  const diagram: Diagram = {
    // Full UUID: the viewer URL is the only thing guarding a diagram, so keep it unguessable.
    id: randomUUID(),
    title,
    elements,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  await getStore().put(COLLECTION, diagram.id, diagram);
  return diagram;
}

export const getDiagram = (id: string) => getStore().get<Diagram>(COLLECTION, id);

export async function updateDiagram(
  id: string,
  patch: { title?: string; elements?: SimpleElement[] },
): Promise<Diagram | null> {
  const current = await getDiagram(id);
  if (!current) return null;
  const next: Diagram = {
    ...current,
    title: patch.title ?? current.title,
    elements: patch.elements ?? current.elements,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  };
  await getStore().put(COLLECTION, id, next);
  return next;
}

export async function listDiagrams(): Promise<Pick<Diagram, "id" | "title" | "version" | "updatedAt">[]> {
  const ids = await getStore().list(COLLECTION);
  const all = await Promise.all(ids.map(getDiagram));
  return all
    .filter((d): d is Diagram => d !== null)
    .map(({ id, title, version, updatedAt }) => ({ id, title, version, updatedAt }));
}
