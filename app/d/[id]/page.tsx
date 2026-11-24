import { notFound } from "next/navigation";
import { getDiagram } from "@/app-specific/diagram-store";
import { DiagramViewer } from "@/app-specific/DiagramViewer";

export const dynamic = "force-dynamic";

export default async function DiagramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const diagram = await getDiagram(id);
  if (!diagram) notFound();
  return <DiagramViewer initial={diagram} />;
}
