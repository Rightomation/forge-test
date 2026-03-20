# Agent instructions (Forge / product builds)

Use this file as the **project contract** when Cursor, OpenClaw, or an external multi-agent pipeline generates or changes code in this repository.

## What “done” means

1. **Frontend:** `cd frontend && npm run build` succeeds.
2. **Full stack:** `docker compose build` (from repo root) succeeds.
3. **No stub home page:** The app must ship a real UI wired to state/API—not only Zustand hooks or an empty `page.tsx`.

## Next.js 14 (App Router) — required files

Every Next app in `frontend/` **must** include:

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, metadata, `globals.css`, global toasts/providers |
| `src/app/page.tsx` | Entry route (can compose client components) |
| `src/app/globals.css` | `@tailwind base/components/utilities` |

**Client components** that use hooks or browser APIs need `"use client"` at the top. Keep `layout.tsx` as a Server Component when possible.

**Patches:** `patch-package` runs on `npm install` (see `frontend/package.json`). Do not remove `frontend/patches/` or the `postinstall` script without replacing that workflow.

## Backend (FastAPI)

- Keep `backend/requirements.txt` and `backend/Dockerfile` aligned with imports.
- Prefer explicit schemas and routers under `backend/app/`.

## Where the orchestrator lives

The multi-agent driver (`forge_agents_v2.py` and its `.env`) is **not** in this repo by default; it may live on another machine (e.g. `~/forge/`). To run the full pipeline on this checkout:

1. Copy or sync `forge_agents_v2.py` (and any `requirements.txt` it needs) into a folder you control, e.g. `forge/` next to this repo.
2. Copy `.env.example` → `.env` and fill keys.
3. Point the script’s **output directory** at this repo (or a subdirectory) so generated files land in `frontend/` and `backend/` consistently.
4. Run the script from the environment where API keys and Git credentials are available.

## Suggested workflow for new products

1. **Team lead / planner:** Break the product into frontend tasks, backend tasks, and a short UI spec (Markdown is fine).
2. **Implementation:** Land code in `frontend/src/…` and `backend/app/…` following the layout above.
3. **QA:** Run build + Docker; fix failures before declaring complete.
4. **Git / deploy:** Commit from a clean tree; deploy with `docker compose up --build` on the target host.

## Conventions

- Match existing patterns: TypeScript path alias `@/*` → `frontend/src/*`, Tailwind theme in `tailwind.config.js`.
- Do not commit `node_modules/`, `.next/`, or secrets. Follow root `.gitignore`.
