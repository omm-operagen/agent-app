# agent-app

One app, two front doors onto shared state: a web UI for humans, MCP tools for agents.
Excalidraw is the worked example.

## Deploys

Connected to Vercel through its GitHub integration. No CI config is needed.

- Push to `main` -> production deployment.
- Push to any other branch -> preview deployment with its own URL.

## Develop

```bash
npm install
npm run dev
```

## Auth

The MCP endpoint (`/api/mcp`) accepts either:

- a static bearer token (`MCP_TOKEN`), for clients that can set headers such as Claude Code; or
- an OAuth access token issued by Supabase Auth, for clients that can only do OAuth (claude.ai, Cowork).

OAuth is off unless the Supabase variables are present. Required for OAuth:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (set by the Vercel Marketplace integration) and
`OWNER_EMAIL` or `OWNER_USER_ID`. Without an owner, no OAuth identity is accepted.
