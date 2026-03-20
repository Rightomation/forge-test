"""
Forge multi-agent pipeline (Anthropic). Synced with repo Docker layout.

Usage:
  cd scripts && python forge_agents_v2.py "<app description>" "<https://github.com/org/repo.git>"

Requires .env (see repo .env.example): ANTHROPIC_API_KEY, optional TELEGRAM_*, email, ANTHROPIC_MODEL.
"""
import anthropic
import json
import os
import re
import smtplib
import subprocess
import sys
from email.mime.text import MIMEText
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

MAX_FIX_ITERATIONS = 2
MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

_api_key = os.environ.get("ANTHROPIC_API_KEY")
if not _api_key:
    sys.exit("Missing ANTHROPIC_API_KEY in environment or .env")
client = anthropic.Anthropic(api_key=_api_key)


def call_agent(name, system, task, max_tokens=4096):
    print(f"\n🤖  [{name}] working...")
    r = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": task}],
    )
    print(f"✅  [{name}] done.")
    return r.content[0].text


def parse_files(text):
    """Extract ### FILE: path\n```lang\ncode\n``` blocks into a dict."""
    files = {}
    pattern = re.compile(r"### FILE: (.+?)\n```[^\n]*\n(.*?)```", re.DOTALL)
    for match in pattern.finditer(text):
        path = match.group(1).strip()
        code = match.group(2)
        files[path] = code
    return files


def team_lead_plan(app_description):
    raw = call_agent(
        "Team Lead",
        'Senior architect. Respond ONLY valid JSON:\n{"app_name":"kebab-case","uiux_task":"...","frontend_task":"...","backend_task":"..."}',
        f"Plan: {app_description}",
    )
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(raw[raw.find("{") : raw.rfind("}") + 1])


def uiux_agent(task):
    return call_agent(
        "UI/UX Designer",
        "Senior UI/UX designer. Produce detailed design spec in Markdown: user flows, layouts, components, colours, typography, responsive notes.",
        task,
    )


def frontend_agent(task, design_spec, issues=None):
    fix = (
        ("\n\n⚠️ FIX THESE QA ISSUES:\n" + "\n".join(f"- {i}" for i in issues))
        if issues
        else ""
    )
    return call_agent(
        "Frontend Developer",
        """Senior React/Next.js 14 App Router developer. Output EVERY file needed to run the app.
Format each file EXACTLY like:
### FILE: path/to/file.ext
```tsx
code here
```
Include: package.json, next.config.js, tailwind.config.js, postcss.config.js, tsconfig.json,
src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, components, hooks, types.
App must pass `npm run build`. Never omit the app directory.""",
        f"Design:\n{design_spec}\n\nTask:\n{task}{fix}",
        max_tokens=8192,
    )


def backend_agent(task, issues=None):
    fix = (
        ("\n\n⚠️ FIX THESE QA ISSUES:\n" + "\n".join(f"- {i}" for i in issues))
        if issues
        else ""
    )
    return call_agent(
        "Backend Developer",
        """Senior Python/FastAPI developer. Output EVERY file needed to run the backend.
Format each file EXACTLY like:
### FILE: path/to/file.ext
```python
code here
```
Include: main.py, requirements.txt, routers, models, schemas, database.py, .env.example. Must be fully runnable.""",
        f"Task:\n{task}{fix}",
        max_tokens=8192,
    )


def qa_agent(design_spec, frontend_code, backend_code):
    raw = call_agent(
        "QA Lead",
        'QA engineer. Review for bugs, security, API mismatches, missing features.\nRespond ONLY valid JSON:\n{"approved":true,"issues":["..."],"summary":"..."}',
        f"Design:\n{design_spec}\n\nFrontend:\n{frontend_code}\n\nBackend:\n{backend_code}",
    )
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return json.loads(raw[raw.find("{") : raw.rfind("}") + 1])


def save_and_push(app_name, project_dir, repo_url):
    dockerfile_frontend = """FROM node:20-alpine
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
"""
    dockerfile_backend = """FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
    compose = """services:
  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://127.0.0.1:8000}
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - backend_sqlite:/app/data
    environment:
      - DATABASE_URL=sqlite:////app/data/app.db
      - SECRET_KEY=${SECRET_KEY:-dev-only-change-me-in-production-min-32-chars-please}

volumes:
  backend_sqlite:
"""
    (project_dir / "frontend" / "Dockerfile").write_text(dockerfile_frontend)
    (project_dir / "backend" / "Dockerfile").write_text(dockerfile_backend)
    (project_dir / "docker-compose.yml").write_text(compose)

    push_cmd = ["git", "push", "-u", "origin", "main"]
    if os.environ.get("FORGE_GIT_FORCE", "").lower() in ("1", "true", "yes"):
        push_cmd.append("--force")

    git_ok = True
    for cmd in [
        ["git", "init"],
        ["git", "add", "."],
        ["git", "commit", "-m", "🤖 Built by Forge AI agents"],
        ["git", "branch", "-M", "main"],
        ["git", "remote", "add", "origin", repo_url],
        push_cmd,
    ]:
        r = subprocess.run(cmd, cwd=project_dir, capture_output=True, text=True)
        if r.returncode != 0:
            git_ok = False
            print(f"⚠️  {' '.join(cmd)} → {r.stderr.strip() or r.stdout.strip()}")
    if git_ok:
        print(f"📦  Pushed to {repo_url}")
    else:
        print(f"⚠️  Git did not complete successfully. Files are on disk: {project_dir.resolve()}")
    return git_ok


def notify_telegram(message):
    t, c = os.environ.get("TELEGRAM_BOT_TOKEN"), os.environ.get("TELEGRAM_CHAT_ID")
    if not t or not c:
        return
    r = requests.post(
        f"https://api.telegram.org/bot{t}/sendMessage",
        json={"chat_id": c, "text": message, "parse_mode": "Markdown"},
        timeout=30,
    )
    print("📱  Telegram sent." if r.ok else f"⚠️  {r.text}")


def notify_email(subject, body):
    f = os.environ.get("EMAIL_FROM") or os.environ.get("SMTP_USER")
    t = os.environ.get("EMAIL_TO") or os.environ.get("NOTIFY_EMAIL")
    p = os.environ.get("EMAIL_PASSWORD") or os.environ.get("SMTP_PASSWORD")
    if not all([f, t, p]):
        return
    host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    port = int(os.environ.get("SMTP_PORT", "465"))
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = f
    msg["To"] = t
    try:
        with smtplib.SMTP_SSL(host, port, timeout=30) as s:
            s.login(f, p)
            s.send_message(msg)
        print("📧  Email sent.")
    except Exception as e:
        print(f"⚠️  Email: {e}")


def build_app(app_description, github_repo_url):
    print("\n🚀  Forge AI pipeline starting...\n" + "─" * 50)
    plan = team_lead_plan(app_description)
    app_name = plan["app_name"]
    print(f"\n📋  App: {app_name}")

    design_spec = uiux_agent(plan["uiux_task"])
    frontend_code = frontend_agent(plan["frontend_task"], design_spec)
    backend_code = backend_agent(plan["backend_task"])

    qa, iteration = {}, 0
    while iteration < MAX_FIX_ITERATIONS:
        iteration += 1
        print(f"\n🔍  QA pass {iteration}/{MAX_FIX_ITERATIONS}...")
        qa = qa_agent(design_spec, frontend_code, backend_code)
        approved, issues = qa.get("approved", False), qa.get("issues", [])
        print(f"    {'✅ APPROVED' if approved else f'⚠️  {len(issues)} issues'}")
        if approved or not issues:
            break
        print("\n🔧  Auto-fixing...")
        fe_issues = [
            i
            for i in issues
            if any(
                k in i.lower()
                for k in [
                    "frontend",
                    "react",
                    "component",
                    "ui",
                    "type",
                    "camel",
                    "redux",
                    "tailwind",
                    "nav",
                    "mobile",
                    "design",
                    "spec",
                    "token",
                    "hook",
                    "next",
                    "app router",
                ]
            )
        ]
        be_issues = [i for i in issues if i not in fe_issues]
        if fe_issues:
            frontend_code = frontend_agent(plan["frontend_task"], design_spec, issues=fe_issues)
        if be_issues:
            backend_code = backend_agent(plan["backend_task"], issues=be_issues)

    project_dir = Path(f"./{app_name}")
    print(f"\n💾  Writing files to {project_dir.resolve()}...")

    fe_files = parse_files(frontend_code)
    be_files = parse_files(backend_code)

    for path, code in fe_files.items():
        fp = project_dir / "frontend" / path
        fp.parent.mkdir(parents=True, exist_ok=True)
        fp.write_text(code, encoding="utf-8")

    for path, code in be_files.items():
        fp = project_dir / "backend" / path
        fp.parent.mkdir(parents=True, exist_ok=True)
        fp.write_text(code, encoding="utf-8")

    qa_summary = qa.get("summary", "")
    qa_issues = qa.get("issues", [])
    (project_dir / "DESIGN.md").write_text(design_spec)
    (project_dir / "QA_REPORT.md").write_text(
        f"# QA Report\n\n**Approved:** {qa.get('approved', False)}\n\n**Summary:** {qa_summary}\n\n## Remaining Issues\n"
        + ("\n".join(f"- {i}" for i in qa_issues) or "None 🎉")
    )
    (project_dir / "README.md").write_text(
        f"# {app_name}\n\nBuilt by Forge AI Agents.\n\n{app_description}\n\n## Run with Docker\n```bash\ndocker compose up --build\n```\n\nCreate a `.env` with NEXT_PUBLIC_API_URL and SECRET_KEY for production.\n\n## QA\n{qa_summary}"
    )

    print(f"✅  {len(fe_files)} frontend files, {len(be_files)} backend files written.")
    pushed = save_and_push(app_name, project_dir, github_repo_url)

    status = "✅ APPROVED" if qa.get("approved") else f"⚠️ {len(qa_issues)} remaining issues"
    git_line = "*Git push:* ok" if pushed else "*Git push:* FAILED (project only on this machine)"
    msg = f"🚀 *{app_name}* built!\n*Status:* {status}\n*QA passes:* {iteration}\n{git_line}\n*Repo URL:* {github_repo_url}\n\n{qa_summary}"
    notify_telegram(msg)
    notify_email(f"🚀 Forge: {app_name} built!", msg.replace("*", ""))
    banner = "✅" if pushed else "⚠️"
    print(f"\n{banner}  Done! {github_repo_url}")
    if not pushed:
        print(f"   (Build output: {project_dir.resolve()} — fix Git remote/credentials and push manually.)\n")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print('Usage: python forge_agents_v2.py "<description>" "<github_repo_url>"')
        sys.exit(1)
    build_app(sys.argv[1], sys.argv[2])
