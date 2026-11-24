import type { SimpleElement } from "./diagram-schema";

/**
 * Simple shapes -> Excalidraw element skeletons (what convertToExcalidrawElements accepts).
 * Pure data; the conversion itself must run in the browser, see docs/build-log.md.
 */
export function toSkeletons(elements: SimpleElement[]) {
  type Box = { x: number; y: number; width: number; height: number };
  const boxes = new Map<string, Box>();
  for (const el of elements) {
    if (el.type === "rectangle" || el.type === "ellipse" || el.type === "diamond") boxes.set(el.id, el);
  }

  const out: Record<string, unknown>[] = [];
  for (const el of elements) {
    const style = {
      ...(el.strokeColor && { strokeColor: el.strokeColor }),
      ...(el.backgroundColor && { backgroundColor: el.backgroundColor, fillStyle: "solid" }),
    };
    if (el.type === "text") {
      out.push({ type: "text", id: el.id, x: el.x, y: el.y, text: el.text, ...style });
    } else if (el.type === "arrow") {
      const a = boxes.get(el.from);
      const b = boxes.get(el.to);
      if (!a || !b) continue; // dangling reference: skip rather than break the whole scene
      // Without explicit geometry the converter leaves a stub arrow, so compute edge-to-edge points.
      const start = edgePoint(a, center(b));
      const end = edgePoint(b, center(a));
      out.push({
        type: "arrow",
        id: el.id,
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
        points: [[0, 0], [end.x - start.x, end.y - start.y]],
        start: { id: el.from },
        end: { id: el.to },
        ...(el.label && { label: { text: el.label } }),
        ...style,
      });
    } else {
      out.push({
        type: el.type,
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        ...(el.label && { label: { text: el.label } }),
        ...style,
      });
    }
  }
  return out;
}

const center = (b: { x: number; y: number; width: number; height: number }) => ({
  x: b.x + b.width / 2,
  y: b.y + b.height / 2,
});

/** Where the line from a box's center toward `target` leaves the box's bounding rectangle. */
function edgePoint(b: { x: number; y: number; width: number; height: number }, target: { x: number; y: number }) {
  const c = center(b);
  const dx = target.x - c.x;
  const dy = target.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const t = Math.min(
    dx === 0 ? Infinity : b.width / 2 / Math.abs(dx),
    dy === 0 ? Infinity : b.height / 2 / Math.abs(dy),
  );
  return { x: c.x + dx * t, y: c.y + dy * t };
}
