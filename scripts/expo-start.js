#!/usr/bin/env node
/**
 * Expo start for Codespaces: show QR + tunnel while keeping a real TTY when possible.
 * - Forces CI=false (GitHub Codespaces sets CI=true).
 * - Avoids EXPO_UNSTABLE_HEADLESS here — with LOG_EVENTS it disables the interactive UI/QR.
 * - Uses `script` for a pseudo-TTY when stdout is not a TTY.
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const env = { ...process.env, CI: 'false' };
delete env.LOG_EVENTS;

function run(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: root,
    env,
    stdio: 'inherit',
    ...options,
  });
  child.on('exit', (code, signal) => {
    process.exit(code ?? (signal ? 1 : 0));
  });
}

const needsPseudoTty = process.platform === 'linux' && !process.stdout.isTTY;

if (needsPseudoTty) {
  run('script', ['-qefc', 'npx expo start --tunnel', '/dev/null']);
} else {
  run('npx', ['expo', 'start', '--tunnel'], { shell: true });
}
