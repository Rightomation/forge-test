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

## Forge pipeline script (Anthropic)

- **In repo:** [`scripts/forge_agents_v2.py`](scripts/forge_agents_v2.py) — install deps (`pip install anthropic python-dotenv requests`), set `.env`, then:
  ```bash
  cd scripts
  python forge_agents_v2.py "Your app idea" "https://github.com/org/new-repo.git"
  ```
- **Requires:** `ANTHROPIC_API_KEY`. Optional: `ANTHROPIC_MODEL`, `TELEGRAM_*`, `EMAIL_FROM` / `EMAIL_TO` / `EMAIL_PASSWORD` (or `SMTP_*` / `NOTIFY_EMAIL` fallbacks). See root [`.env.example`](.env.example).
- **Git:** `git push` runs from the generated project folder; configure credentials on that machine. Set `FORGE_GIT_FORCE=1` only if you intentionally need `--force` (dangerous on shared repos).

## VPS copy

You can `scp` the same script to `~/forge/` on a server; use a `.env` there with `ANTHROPIC_API_KEY` and run from the directory where you want `./<app_name>/` created (or symlink `scripts/forge_agents_v2.py`).

## Suggested workflow for new products

1. **Team lead / planner:** Break the product into frontend tasks, backend tasks, and a short UI spec (Markdown is fine).
2. **Implementation:** Land code in `frontend/src/…` and `backend/app/…` following the layout above.
3. **QA:** Run build + Docker; fix failures before declaring complete.
4. **Git / deploy:** Commit from a clean tree; deploy with `docker compose up --build` on the target host.

## Conventions

- Match existing patterns: TypeScript path alias `@/*` → `frontend/src/*`, Tailwind theme in `tailwind.config.js`.
- Do not commit `node_modules/`, `.next/`, or secrets. Follow root `.gitignore`.
