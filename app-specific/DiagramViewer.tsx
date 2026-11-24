"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Diagram } from "./diagram-schema";
import { toSkeletons } from "./to-excalidraw";

// Excalidraw touches `window`, so it can only load in the browser.
const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, { ssr: false });

const POLL_MS = 2000;

async function toElements(diagram: Diagram) {
  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
  return convertToExcalidrawElements(toSkeletons(diagram.elements) as never);
}

export function DiagramViewer({ initial }: { initial: Diagram }) {
  const api = useRef<{ updateScene: (s: { elements: unknown[] }) => void; scrollToContent: (e?: unknown, o?: unknown) => void } | null>(null);
  const version = useRef(initial.version);
  const [title, setTitle] = useState(initial.title);
  const [initialElements, setInitialElements] = useState<unknown[] | null>(null);

  useEffect(() => {
    toElements(initial).then(setInitialElements);
  }, [initial]);

  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return; // don't poll from background tabs
      try {
        const res = await fetch(`/api/diagrams/${initial.id}?since=${version.current}`, { cache: "no-store" });
        if (!res.ok) return;
        const body = await res.json();
        if (!body.changed) return;
        version.current = body.version;
        setTitle(body.title);
        const elements = await toElements(body);
        api.current?.updateScene({ elements });
        api.current?.scrollToContent(elements, { fitToContent: true });
      } catch {
        /* transient network error: try again on the next tick */
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [initial.id]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "8px 16px", fontFamily: "system-ui, sans-serif", borderBottom: "1px solid #ddd" }}>
        <strong>{title}</strong> <span style={{ color: "#888" }}>· view only, updates automatically</span>
      </header>
      <div style={{ flex: 1 }}>
        {initialElements && (
          <Excalidraw
            viewModeEnabled
            excalidrawAPI={(a) => (api.current = a as never)}
            initialData={{ elements: initialElements as never, scrollToContent: true }}
          />
        )}
      </div>
    </div>
  );
}
