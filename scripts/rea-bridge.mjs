import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export async function runReaBridge() {
  const configPath = new URL('../rea-config.json', import.meta.url);
  if (!fs.existsSync(configPath)) return;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.enabled) return;

  if (process.env.GITHUB_ACTIONS !== 'true' && process.env.RUN_REA !== '1') {
    console.log('[REA Bridge] Skipping heavy REA execution outside GitHub Actions (set RUN_REA=1 to force).');
    return;
  }

  console.log('=== [REA Bridge] Preparando Node 24 y rea-agents ===');
  const setupScript = `
    set -e
    NODE_DIR="/tmp/rea-node24"
    if [ ! -x "$NODE_DIR/bin/node" ]; then
      mkdir -p "$NODE_DIR"
      TARBALL=$(curl -fsSL https://nodejs.org/dist/latest-v24.x/ | grep -oE 'node-v24\\.[0-9]+\\.[0-9]+-linux-x64\\.tar\\.xz' | head -n 1)
      echo "Descargando $TARBALL..."
      curl -fsSL "https://nodejs.org/dist/latest-v24.x/$TARBALL" | tar -xJ -C "$NODE_DIR" --strip-components=1
    fi
    export PATH="$NODE_DIR/bin:$PATH"
    echo "Node activo para REA: $(node -v)"
    npm install --global --prefix "$NODE_DIR" rea-agents@latest >/dev/null 2>&1 || npm install --global --prefix "$NODE_DIR" rea-agents@latest
    echo "REA version: $(rea --version)"

    MODE="${config.mode || 'doctor'}"
    TARGET_URL="${config.target_url || 'https://www.uefa.com/uefachampionsleague/'}"
    TARGET_PATH="${config.target_path || '.'}"

    echo "=== REA_OUTPUT_START (mode=$MODE) ==="
    if [ "$MODE" = "doctor" ]; then
      rea doctor --json
    elif [ "$MODE" = "analyze-repo" ]; then
      rea analyze "$TARGET_PATH" --json
    else
      google-chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \\
        --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 \\
        --window-size=1440,900 "$TARGET_URL" >/tmp/chrome.log 2>&1 &
      CHROME_PID=$!
      for i in $(seq 1 25); do
        if curl -s http://127.0.0.1:9222/json/version >/dev/null; then break; fi
        sleep 1
      done
      sleep 4
      ORIGIN=$(node -e "console.log(new URL('$TARGET_URL').origin)")
      rea list-browser-targets http://127.0.0.1:9222 --allowed-origins "$ORIGIN" --json > /tmp/rea-targets.json
      TARGET_ID=$(node -e '
        const fs = require("fs");
        const d = JSON.parse(fs.readFileSync("/tmp/rea-targets.json", "utf8"));
        const list = d.targets || (d.value && d.value.targets) || (d.data && d.data.targets) || [];
        const p = list.find(t => t.type === "page") || list[0];
        console.log(p ? p.target_id : "");
      ')
      if [ "$MODE" = "inspect-url" ]; then
        rea inspect-web-page http://127.0.0.1:9222 "$TARGET_ID" --allowed-origins "$ORIGIN" --observation-ms 2000 --json
      elif [ "$MODE" = "analyze-bundle" ]; then
        rea analyze-web-bundle http://127.0.0.1:9222 "$TARGET_ID" --allowed-origins "$ORIGIN" --observation-ms 2000 --json
      fi
      kill $CHROME_PID || true
    fi
    echo "=== REA_OUTPUT_END ==="
  `;

  const out = execSync(setupScript, {
    shell: '/bin/bash',
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    timeout: 240000
  });
  console.log(out);
}
