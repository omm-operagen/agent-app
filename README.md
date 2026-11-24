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
