# Build log

What broke, why, and the fix. Raw material for the article.

## Step 0: repo + deploy wiring
- Vercel's Git integration deploys on push; no CI file or token needed.
- An empty repo has nothing for Vercel to build, so the first push to `main` would fail. Added a minimal Next.js skeleton first.
