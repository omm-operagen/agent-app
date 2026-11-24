import Link from "next/link";
import { listDiagrams } from "@/app-specific/diagram-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const diagrams = await listDiagrams();
  return (
    <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>agent-app</h1>
      <p>Diagrams are created and edited by agents over MCP. This page is view only.</p>
      {diagrams.length === 0 ? (
        <p>No diagrams yet.</p>
      ) : (
        <ul>
          {diagrams.map((d) => (
            <li key={d.id}>
              <Link href={`/d/${d.id}`}>{d.title}</Link> <small>v{d.version}</small>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
