import { getDiagram } from "@/app-specific/diagram-store";

export const dynamic = "force-dynamic";

/** Viewer polling endpoint. `?since=<version>` returns a tiny body when nothing changed. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getDiagram(id);
  if (!d) return Response.json({ error: "not found" }, { status: 404 });
  const since = Number(new URL(req.url).searchParams.get("since"));
  if (since === d.version) return Response.json({ changed: false, version: d.version });
  return Response.json({ changed: true, ...d });
}
