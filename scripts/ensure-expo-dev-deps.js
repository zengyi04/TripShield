/**
 * Repairs transitive devtools launcher packages when node_modules is incomplete
 * (common after `npm audit fix --force` on Codespaces).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');

const requiredFiles = [
  'node_modules/chromium-edge-launcher/dist/index.js',
  'node_modules/chrome-launcher/dist/index.js',
];

const missing = requiredFiles.filter((rel) => !fs.existsSync(path.join(root, rel)));
if (missing.length === 0) {
  process.exit(0);
}

console.warn('[ensure-expo-dev-deps] Incomplete install detected:');
missing.forEach((rel) => console.warn(`  - ${rel}`));
console.warn('[ensure-expo-dev-deps] Re-installing launcher packages…');

execSync(
  'npm install chrome-launcher@1.2.1 chromium-edge-launcher@0.3.0 --no-save --no-audit --no-fund',
  { cwd: root, stdio: 'inherit' },
);
