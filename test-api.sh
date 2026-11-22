#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-8807}"
LOG=".wrangler-test.log"
: > "$LOG"

listeners() {
  netstat -ano 2>/dev/null | awk -v port=":$PORT" '$2 ~ port"$" && $4 == "LISTENING" {print $5}' | sort -u
}

if [ -n "$(listeners)" ]; then
  echo "test-api: port $PORT already in use" >&2
  exit 1
fi

npx wrangler pages dev --port "$PORT" --ip 127.0.0.1 --log-level error >"$LOG" 2>&1 &
WRANGLER_PID=$!

cleanup() {
  powershell -NoProfile -Command "
    Get-CimInstance Win32_Process |
      Where-Object { \$_.CommandLine -like '*$PORT*' -and \$_.Name -in @('node.exe','workerd.exe','esbuild.exe') } |
      ForEach-Object { Stop-Process -Id \$_.ProcessId -Force -ErrorAction SilentlyContinue }
  " >/dev/null 2>&1 || true
  local pid
  for pid in $(listeners); do
    taskkill //PID "$pid" //F >/dev/null 2>&1 || true
  done
}
trap cleanup EXIT

BASE="http://127.0.0.1:$PORT" node test-api.mjs
