# Build log

What broke, why, and the fix. Raw material for the article.

## Step 0: repo + deploy wiring
- Vercel's Git integration deploys on push; no CI file or token needed.
- An empty repo has nothing for Vercel to build, so the first push to `main` would fail. Added a minimal Next.js skeleton first.

## Step 2: probing `convertToExcalidrawElements` server-side
- **Tried:** `import("@excalidraw/excalidraw")` and calling `convertToExcalidrawElements` in Node, then inside a Next.js route handler.
- **Broke:** plain Node ESM import fails on an extensionless `roughjs/bin/rough` import. Inside Next (Turbopack) the import resolves, but the call throws `window is not defined`.
- **Why:** the package is built for the browser and touches `window` (text measurement, fonts).
- **Decision:** store the agent-facing "simple shapes" on the server and convert in the viewer, where the real library runs. Agents never see Excalidraw's internal element ids, only their own shape ids.
- **Trade-off:** edits a human makes in the canvas are full Excalidraw elements, not simple shapes. Two-way editing needs a decision later.

## Step 2: mcp-handler 2.x is not what 1.x docs describe
- `mcp-handler` 2.4.0 needs `@modelcontextprotocol/server` ^2 and zod ^4. Old tutorials use `server.tool(...)` and `@modelcontextprotocol/sdk`; v2 uses `registerTool` with a full zod object as `inputSchema`.
- The handler is stateless; Redis is no longer used by `mcp-handler` itself. Redis here is only our diagram store.
