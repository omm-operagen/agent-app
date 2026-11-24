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

## Step 3: viewer
- **Broke:** arrows rendered as short stubs starting inside the source box. `convertToExcalidrawElements` binds `start`/`end` to shape ids but does not compute the path when the arrow has no width/height. **Fix:** compute edge-to-edge endpoints ourselves (`edgePoint` in `app-specific/to-excalidraw.ts`) and pass explicit `x/y/width/height/points` plus the bindings.
- **Polling:** the viewer sends `?since=<version>`; unchanged diagrams return a ~40-byte body. Background tabs skip polling. Verified headless: MCP `update_diagram` changed an open page within ~2s, no reload.
- **Fonts:** Excalidraw loads its handwriting font from esm.sh at runtime. Blocked networks fall back to a serif font and show a dev overlay warning. Self-hosting via `EXCALIDRAW_ASSET_PATH` is an option if the CDN dependency matters.
- **Silent fallback trap:** with Upstash keys in Production only, Preview deployments had no credentials and the in-memory store would have "worked" per instance while losing data. Now throws on Vercel when credentials are missing.

## Step 4: connecting a client
- `.mcp.json` points at the production URL and reads the bearer token from `${MCP_TOKEN}`, so the secret never enters git.
- Cloud sessions read both `.mcp.json` and environment variables only at session start. A running session cannot pick up a newly added server or token; start a new session.
- A cloud sandbox's network allowlist blocks the production host by default, so the live endpoint could not be curl-tested from the session that wrote this file.
