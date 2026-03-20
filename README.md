# todo-projects-app

Built by Forge AI Agents.

A todo app with user auth and projects.

## Local dev (frontend)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Agent / codegen contract

See [AGENTS.md](./AGENTS.md) for required Next.js layout, build rules, and how to wire an external `forge_agents_v2.py`-style orchestrator. Copy [.env.example](./.env.example) to `.env` for pipeline secrets (do not commit `.env`).

## Run with Docker

```bash
docker compose up --build
```

## Deploy on a Hostinger KVM VPS

Hostinger gives you a normal Linux VPS (often Ubuntu). Typical flow:

1. **SSH** — Use the root or sudo user and IP from hPanel → VPS → SSH access.
2. **Firewall (hPanel or `ufw`)** — Allow SSH (22). For a quick test, open **3000** (frontend) and **8000** (API), or only **80/443** if you put Nginx in front.
3. **Docker** — Install [Docker Engine](https://docs.docker.com/engine/install/ubuntu/) and the Compose plugin (`docker compose version`).
4. **Code** — `git clone` this repo on the server, `cd` into it.
5. **Secrets** — Set a strong `SECRET_KEY` for the backend (override the compose default). For production, prefer env files or Hostinger secrets, not inline defaults in `docker-compose.yml`.
6. **Run** — `docker compose up -d --build` from the repo root. App: `http://YOUR_VPS_IP:3000`, API: `http://YOUR_VPS_IP:8000`.
7. **Domain + HTTPS (recommended)** — Point your domain’s **A record** to the VPS IP in Hostinger DNS, then add **Nginx** as a reverse proxy to `:3000` / `:8000` and use **Certbot** for Let’s Encrypt TLS.

- **Automated (on the VPS):** upload [`scripts/hostinger-bootstrap.sh`](./scripts/hostinger-bootstrap.sh), then run it with your Git repo URL (see [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md) “Fast path”).
- **Manual:** full checklist in [DEPLOY_HOSTINGER.md](./DEPLOY_HOSTINGER.md).

## QA
```json
{
  "approved": false,
  "issues": [
    "CRITICAL — task.updated_at not auto-updating on UPDATE: SQLAlchemy `onupdate=func.now()` does not fire on in-place attribute mutations unless `db.commit()` triggers a proper UPDATE statement; with SQLite (common in dev) `func.now()` is evaluated at DDL time, not runtime. Should use Python-side `datetime.utcnow` via `default` + explicit assignment in the update endpoint for reliability.",
    "CRITICAL — `get_tasks` endpoint declares `current_user