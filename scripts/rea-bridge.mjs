import { execSync } from 'node:child_process';
import fs from 'node:fs';

export async function runReaBridge() {
  const configPath = new URL('../rea-config.json', import.meta.url);
  if (!fs.existsSync(configPath)) return;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.enabled) return;

  if (process.env.GITHUB_ACTIONS !== 'true' && process.env.RUN_REA !== '1') {
    console.log('[REA Bridge] Skipping heavy REA execution outside GitHub Actions (set RUN_REA=1 to force).');
    return;
  }

  console.log('=== [REA Bridge] Ejecutando inspect-web-page + analyze-web-bundle en vivo ===');
  const setupScript = `
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
    echo "REA version: $(rea --version || true)"

    MODE="${config.mode || 'inspect-and-bundle'}"
    TARGET_URL="${config.target_url || 'https://es.uefa.com/uefachampionsleague/'}"

    google-chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \\
      --disable-blink-features=AutomationControlled \\
      --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" \\
      --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 \\
      --window-size=1440,900 "$TARGET_URL" >/tmp/chrome.log 2>&1 &
    CHROME_PID=$!

    for i in $(seq 1 25); do
      if curl -s http://127.0.0.1:9222/json/version >/dev/null; then break; fi
      sleep 1
    done
    sleep 6

    curl -s http://127.0.0.1:9222/json/list > /tmp/cdp-tabs.json
    TARGET_INFO=$(node -e '
      const fs = require("fs");
      const tabs = JSON.parse(fs.readFileSync("/tmp/cdp-tabs.json", "utf8"));
      const page = tabs.find(t => t.type === "page" && t.url && t.url.startsWith("http")) || tabs[0] || {};
      const origin = page.url ? new URL(page.url).origin : "https://es.uefa.com";
      console.log(JSON.stringify({ id: page.id || "", url: page.url || "", title: page.title || "", origin }));
    ')
    echo "CDP Tab detectada: $TARGET_INFO"

    TARGET_ID=$(node -e "console.log(JSON.parse(process.argv[1]).id)" "$TARGET_INFO")
    ORIGIN=$(node -e "console.log(JSON.parse(process.argv[1]).origin)" "$TARGET_INFO")

    echo "=== REA_LIST_TARGETS ==="
    rea list-browser-targets http://127.0.0.1:9222 --allowed-origins "$ORIGIN" --json || true

    echo "=== REA_INSPECT_WEB_PAGE_START ==="
    rea inspect-web-page http://127.0.0.1:9222 "$TARGET_ID" --allowed-origins "$ORIGIN" --observation-ms 3000 --json > /tmp/rea-inspect.json || true
    head -c 12000 /tmp/rea-inspect.json || true
    echo ""
    echo "=== REA_INSPECT_WEB_PAGE_END ==="

    echo "=== REA_ANALYZE_WEB_BUNDLE_START ==="
    rea analyze-web-bundle http://127.0.0.1:9222 "$TARGET_ID" --allowed-origins "$ORIGIN" --observation-ms 3000 --json > /tmp/rea-bundle.json || true
    head -c 12000 /tmp/rea-bundle.json || true
    echo ""
    echo "=== REA_ANALYZE_WEB_BUNDLE_END ==="

    kill $CHROME_PID >/dev/null 2>&1 || true
    exit 0
  `;

  try {
    const out = execSync(setupScript, {
      shell: '/bin/bash',
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
      timeout: 240000
    });
    process.stdout.write(out + '\n');
  } catch (err) {
    if (err.stdout) process.stdout.write(String(err.stdout) + '\n');
    if (err.stderr) process.stderr.write(String(err.stderr) + '\n');
  }
}
