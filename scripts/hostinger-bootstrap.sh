#!/usr/bin/env bash
# Run on a fresh Ubuntu VPS as root (e.g. Hostinger KVM).
# Usage: sudo bash hostinger-bootstrap.sh <git-repo-url> [install-dir]
#
# Installs Docker + Compose, configures UFW, clones/updates the app,
# writes repo-root .env (SECRET_KEY + NEXT_PUBLIC_API_URL), and runs compose.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash $0 <repo-url>"
  exit 1
fi

REPO_URL="${1:-}"
INSTALL_DIR="${2:-/opt/forge-test}"

if [ -z "$REPO_URL" ]; then
  echo "Usage: sudo bash hostinger-bootstrap.sh <git-repo-url> [install-dir]"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "==> APT update / upgrade"
apt-get update -y
apt-get upgrade -y

echo "==> Install Git"
apt-get install -y git ca-certificates curl openssl

if ! command -v docker &>/dev/null; then
  echo "==> Install Docker Engine + Compose plugin"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  # shellcheck source=/dev/null
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

systemctl enable docker
systemctl start docker

echo "==> Firewall (UFW)"
if command -v ufw &>/dev/null; then
  ufw allow OpenSSH
  ufw allow 3000/tcp
  ufw allow 8000/tcp
  ufw --force enable || true
fi

echo "==> Clone or update ${INSTALL_DIR}"
mkdir -p "$(dirname "$INSTALL_DIR")"
if [ -e "$INSTALL_DIR" ] && [ ! -d "${INSTALL_DIR}/.git" ]; then
  echo "ERROR: ${INSTALL_DIR} exists but is not a git clone. Remove it or choose another install path."
  exit 1
fi
if [ -d "${INSTALL_DIR}/.git" ]; then
  git -C "$INSTALL_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

echo "==> Detect public IPv4 for NEXT_PUBLIC_API_URL (browser → API)"
PUBLIC_IP=""
for url in https://ifconfig.me/ip https://icanhazip.com https://api.ipify.org; do
  PUBLIC_IP="$(curl -4 -fsS --connect-timeout 5 "$url" 2>/dev/null | tr -d '[:space:]' || true)"
  if [ -n "$PUBLIC_IP" ]; then
    break
  fi
done
if [ -z "$PUBLIC_IP" ]; then
  PUBLIC_IP="127.0.0.1"
  echo "WARN: Could not detect public IP; using 127.0.0.1 — edit ${INSTALL_DIR}/.env and rebuild if needed."
fi

SECRET_KEY="${SECRET_KEY:-$(openssl rand -hex 32)}"

echo "==> Write .env (do not commit)"
umask 077
cat > .env <<EOF
NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}:8000
SECRET_KEY=${SECRET_KEY}
EOF
chmod 600 .env

echo "==> Build and start stack"
docker compose up -d --build

echo "==> Done"
docker compose ps
echo "Frontend: http://${PUBLIC_IP}:3000"
echo "API docs: http://${PUBLIC_IP}:8000/docs"
echo "Health:   curl -s http://127.0.0.1:8000/health"
