#!/usr/bin/env bash
#
# One-time hub setup (Ubuntu 24.04, x86_64). Installs R + fitzRoy + Node 22 LTS and the
# system libraries fitzRoy's dependency tree needs. RUN WITH SUDO once:
#
#   sudo deploy/hub/setup.sh
#
# Everything after this (timers, refresh) runs as the unprivileged user.
#
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "This installs system packages — re-run with sudo:  sudo $0" >&2
  exit 1
fi

TARGET_USER="${SUDO_USER:-manning}"
REPO_DIR="$(cd "$(dirname "$(readlink -f "$0")")/../.." && pwd)"
echo "== AFL hub setup =="
echo "   repo:   $REPO_DIR"
echo "   user:   $TARGET_USER"

echo "== [1/4] apt packages (R, build tools, fitzRoy system deps) =="
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends \
  r-base r-base-dev build-essential ca-certificates curl git \
  libcurl4-openssl-dev libssl-dev libxml2-dev \
  libfontconfig1-dev libharfbuzz-dev libfribidi-dev \
  libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev

echo "== [2/4] Node.js 22 LTS (NodeSource) =="
if command -v node >/dev/null 2>&1; then
  echo "   node already present: $(node --version)"
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
  echo "   installed node $(node --version)"
fi

echo "== [3/4] R packages: fitzRoy + jsonlite (Posit PPM binaries for 24.04 'noble') =="
# Binary packages install in seconds instead of compiling for ~30 min.
Rscript -e 'install.packages(c("fitzRoy","jsonlite"), repos="https://packagemanager.posit.co/cran/__linux__/noble/latest")' \
  || { echo "PPM binary install failed — falling back to source CRAN (slow)..."; \
       Rscript -e 'install.packages(c("fitzRoy","jsonlite"), repos="https://cloud.r-project.org")'; }
Rscript -e 'library(fitzRoy); cat("fitzRoy OK\n")'

echo "== [4/4] repo prep (git identity) as $TARGET_USER =="
# The pipeline scripts use only Node built-ins + global fetch, so no npm install.
# Git identity is for manual commits on the hub; pipeline commits set their own.
sudo -u "$TARGET_USER" git -C "$REPO_DIR" config user.name  "Manning Clifford" || true
sudo -u "$TARGET_USER" git -C "$REPO_DIR" config user.email "manningclifford@outlook.com" || true

chmod +x "$REPO_DIR"/deploy/hub/*.sh || true

cat <<EOF

Setup done. Next steps (as $TARGET_USER, no sudo) — see deploy/hub/README.md:
  1. Give the hub push access (deploy key)
  2. Test the pipeline once:  "$REPO_DIR/deploy/hub/refresh.sh" --force
  3. Install the systemd timers
EOF
