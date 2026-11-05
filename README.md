# Jules Autonomous Coding Agent

An autonomous AI software engineer agent inspired by Jules that investigates, plans, codes, debugs, fixes, and verifies code across any programming language in GitHub repositories.

Built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Lucide Icons. Designed for seamless deployment on both **Vercel** and **Render**.

---

## Capabilities & Architecture

- **Autonomous Step-by-Step Execution**: Follows strict plan formation, investigation, root cause diagnosis, git merge diff patching, polyglot test running, and pre-commit verification.
- **Polyglot Language Engine**: Supports Python, TypeScript, JavaScript, Go, Rust, Java, C++, Ruby, and PHP.
- **Targeted Git Merge Diffs**: Employs exact `<<<<<<< SEARCH ... ======= ... >>>>>>> REPLACE` markers without modifying unrelated code or generating phantom edits.
- **Verification & Telemetry**: Integrated regression test runner and test telemetry reporting before any code changes are approved or submitted.
- **GitHub Integration**: Clones/inspects repositories, generates descriptive feature branches, and opens real GitHub Pull Requests.
- **Zero Mock Emojis & Clean Jules UX**: Clean Google Labs / Jules minimalist dark aesthetic, precise monospace typography, skeleton loaders, and live reasoning streams.

---

## Pages & Routes

- `/` & `/workspace`: Full interactive Jules development environment with repository selector, task prompt bar, execution checklist, live terminal, and git diff viewer.
- `/sessions`: Real-time session history, status badges, diff counters, and PR links.
- `/repos`: Preset polyglot repositories and connection manager.
- `/settings`: GitHub Personal Access Token configuration and LLM provider options.
- `/api/jules/repos`: GitHub repository discovery and metadata inspection.
- `/api/jules/analyze`: Issue analysis and structured 5-step plan generation.
- `/api/jules/run`: Step-by-step and full autonomous loop execution engine.
- `/api/jules/sessions`: Persistent session management.
- `/api/jules/submit`: Git branch creation and Pull Request generation.

---

## Local Development

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Build production bundle
npm run build
```

---

## Deploy to Vercel

1. Import this repository into Vercel.
2. Framework preset: **Next.js**.
3. (Optional) Set `GITHUB_TOKEN` environment variable.
4. Click **Deploy**. Configuration in `vercel.json` ensures zero-config serverless deployment.

---

## Deploy to Render

### Option A: Web Service (Node)
1. In Render Dashboard, click **New > Web Service**.
2. Connect this repository.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Render blueprint is provided in `render.yaml`.

### Option B: Docker Container
1. Select Docker runtime in Render.
2. The provided multi-stage `Dockerfile` automatically builds and serves the Next.js standalone container.
