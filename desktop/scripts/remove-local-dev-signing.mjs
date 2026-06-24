import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const signScript = path.join(scriptDir, 'remove-local-dev-signing.ps1');

function toWindowsPath(filePath) {
  const resolved = path.resolve(filePath);
  if (process.platform === 'win32') {
    return resolved;
  }

  const mountMatch = resolved.match(/^\/mnt\/([a-zA-Z])\/(.*)$/);
  if (mountMatch) {
    return `${mountMatch[1].toUpperCase()}:\\${mountMatch[2].replace(/\//g, '\\')}`;
  }

  throw new Error(`Cannot convert path for Windows PowerShell: ${resolved}`);
}

const result = spawnSync(
  'powershell.exe',
  ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', toWindowsPath(signScript)],
  { stdio: 'inherit', shell: process.platform === 'win32' }
);

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
