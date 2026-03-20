# Step-by-step: Deploy on Hostinger KVM VPS (Docker)

Assumes **Ubuntu 22.04/24.04** (common on Hostinger). Replace `YOUR_VPS_IP` and paths where needed.

## Fast path (automated)

After **step 1** (SSH as root), either upload `scripts/hostinger-bootstrap.sh` or clone this repo once so the script exists on the server, then:

```bash
sudo bash /opt/forge-test/scripts/hostinger-bootstrap.sh https://github.com/YOUR_ORG/forge-test.git /opt/forge-test
```

The script **creates** `install-dir` with `git clone` if it does not exist yet, or runs `git pull` inside it when it is already a Git repo.

**One-liner from your laptop** (replace URL; requires SSH access to VPS):

```bash
scp scripts/hostinger-bootstrap.sh root@YOUR_VPS_IP:/root/
ssh root@YOUR_VPS_IP 'bash /root/hostinger-bootstrap.sh https://github.com/YOUR_ORG/forge-test.git /opt/forge-test'
```

The script installs Docker, opens ports **22 / 3000 / 8000**, writes `.env` with a random `SECRET_KEY` and `NEXT_PUBLIC_API_URL=http://<detected-public-ip>:8000`, and runs `docker compose up -d --build`.

---

## 1. Get server access

1. Log in to **Hostinger hPanel** → **VPS**.
2. Note the **IP address** and **root password** (or your sudo user).
3. From your PC, connect:
   ```bash
   ssh root@YOUR_VPS_IP
   ```
   (Use `ssh youruser@YOUR_VPS_IP` if you created a non-root user.)

---

## 2. Update the system

```bash
apt update && apt upgrade -y
```

---

## 3. Install Docker Engine + Compose plugin

```bash
apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version
```

---

## 4. Firewall (UFW)

```bash
ufw allow OpenSSH
ufw allow 3000/tcp
ufw allow 8000/tcp
ufw enable
ufw status
```

For production you will often close **3000/8000** to the public and use **Nginx on 80/443** only (see section 9).

---

## 5. Put the code on the server

**Option A — Git clone (recommended)**

```bash
apt install -y git
cd /opt
git clone https://github.com/YOUR_ORG/forge-test.git
cd forge-test
```

**Option B — Upload**  
Zip the project on your PC, `scp` to the VPS, unzip under `/opt/forge-test`.

---

## 6. Create a `.env` file next to `docker-compose.yml`

Docker Compose reads this file automatically (do **not** commit it).

```bash
cd /opt/forge-test
nano .env
```

Example (replace values):

```env
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP:8000
SECRET_KEY=paste-a-long-random-string-at-least-32-characters
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

`docker-compose.yml` reads both values from this `.env` (`NEXT_PUBLIC_API_URL` for the frontend **build**, `SECRET_KEY` for the backend container). If you skip `SECRET_KEY`, a weak dev default is used — not for production.

---

## 7. Build and run

From the repo root (where `docker-compose.yml` is):

```bash
docker compose up -d --build
```

First run downloads images and builds; it can take several minutes.

---

## 8. Check that containers are running

```bash
docker compose ps
docker compose logs -f --tail=50
```

Stop following logs with `Ctrl+C`.

**Smoke tests:**

- API health: `curl http://127.0.0.1:8000/health`  
- In a browser: `http://YOUR_VPS_IP:3000` (frontend) and `http://YOUR_VPS_IP:8000/docs` (API docs).

---

## 9. (Optional) Domain + HTTPS with Nginx

1. In **Hostinger DNS**, add an **A** record: `@` (or `app`) → **YOUR_VPS_IP**.
2. On the VPS:
   ```bash
   apt install -y nginx certbot python3-certbot-nginx
   ```
3. Create an Nginx site that `proxy_pass`es to `http://127.0.0.1:3000` (and another `server` or `location` for `/api` → `8000` if you want one hostname).
4. `certbot --nginx -d yourdomain.com` for Let’s Encrypt.

Exact Nginx snippets depend on whether you use one domain or split frontend/API.

---

## 10. Updating after a `git push`

```bash
cd /opt/forge-test
git pull
docker compose up -d --build
```

---

## 11. Forge LLM agents on the VPS (not the same as `docker compose`)

`docker compose` only runs the **Next.js + FastAPI** app. The **Forge multi-agent pipeline** (`scripts/forge_agents_v2.py`) is a separate **Python script**: Team Lead, UI/UX, Frontend, Backend, and QA are **roles** that run **inside one process** when you execute the script (they call the Anthropic API). Nothing in Compose starts them automatically.

To run those agents **on the VPS**:

1. SSH into the server (same machine where the repo lives, e.g. `/opt/forge-test`).
2. Install Python and a venv (Ubuntu):

   ```bash
   apt install -y python3 python3-venv python3-pip
   cd /opt/forge-test/scripts
   python3 -m venv .venv
   source .venv/bin/activate
   pip install anthropic python-dotenv requests
   ```

3. Put your **Anthropic** key where `python-dotenv` will find it. The script calls `load_dotenv()` for the **current working directory**, so either:
   - **`/opt/forge-test/.env`** — then run from the repo root:  
     `cd /opt/forge-test && source scripts/.venv/bin/activate && python scripts/forge_agents_v2.py "…" "https://…"`, or  
   - **`/opt/forge-test/scripts/.env`** — then run from `scripts/` as below.  
   You can copy [`.env.example`](./.env.example) as a template. Alternatively `export ANTHROPIC_API_KEY=...` in the shell.

4. **Git** must be available and **credentials** configured if the script should `git push` to GitHub (see `AGENTS.md` / script usage).

5. Run the pipeline:

   ```bash
   cd /opt/forge-test
   source scripts/.venv/bin/activate
   python scripts/forge_agents_v2.py "Your app idea" "https://github.com/org/target-repo.git"
   ```

That is what makes **all Forge agents** usable **on the VPS**: same code as your laptop, with keys and git set on the server.

### OpenClaw (separate product)

**OpenClaw** is not part of this repository. If you want OpenClaw and **cluster workers** as long-running services on the same VPS, follow **OpenClaw’s own** install/run docs (often additional containers or processes), then use **Traefik** or Compose on that host to route and secure them. This repo does not wire OpenClaw automatically.

---

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| `Connection refused` on :3000 / :8000 | `docker compose ps`, `docker compose logs backend`, `docker compose logs frontend` |
| Backend exits on start | `DATABASE_URL`, `SECRET_KEY` set; `docker compose logs backend` |
| SQLite data lost | Default DB is **inside the container**. For persistence, add a **volume** for the backend service (e.g. mount a host path to `/app` or only the DB file path you configure). |

---

## Frontend talking to the API

Next.js bakes **`NEXT_PUBLIC_API_URL` at `docker compose build` time**. Put it in the repo-root `.env` (see step 6), then run `docker compose up -d --build` again whenever you change it.

For one hostname + Nginx, set it to your public API URL (e.g. `https://api.yourdomain.com`) and proxy that host to port **8000**.
