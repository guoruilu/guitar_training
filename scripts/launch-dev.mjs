#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const isWsl = Boolean(process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP);
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const distIndex = resolve(repoRoot, 'dist', 'index.html');
let opened = false;
let outputBuffer = '';

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function installIfNeeded() {
  if (!existsSync(resolve(repoRoot, 'node_modules'))) {
    console.log('Installing dependencies...');
    runCommand(npmCommand, ['install']);
  }
}

function pathToFileUrl(path) {
  const normalized = path.replace(/\\/g, '/');
  return `file://${normalized.startsWith('/') ? '' : '/'}${encodeURI(normalized)}`;
}

function openExternal(url) {
  let command;
  let args;

  if (isWsl) {
    command = 'powershell.exe';
    args = ['-NoProfile', '-Command', 'Start-Process', url];
  } else if (isWindows) {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = [url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  try {
    const opener = spawn(command, args, {
      detached: true,
      stdio: 'ignore',
    });
    opener.unref();
  } catch {
    console.log(`Open this URL manually: ${url}`);
  }
}

function pickUrl(text) {
  const local = text.match(/Local:\s+(http:\/\/[^\s]+)/)?.[1];
  const networks = [...text.matchAll(/Network:\s+(http:\/\/[^\s]+)/g)].map((match) => match[1]);

  if (isWsl) {
    return networks.find((url) => url.includes('://172.')) ?? networks[0] ?? local;
  }

  return local ?? networks[0];
}

function maybeOpenBrowser() {
  if (opened) {
    return;
  }

  const url = pickUrl(outputBuffer);
  if (!url) {
    return;
  }

  opened = true;
  console.log(`Opening ${url}`);
  openExternal(url);
}

if (existsSync(distIndex)) {
  const url = pathToFileUrl(distIndex);
  console.log(`Opening packaged app: ${url}`);
  openExternal(url);
  process.exit(0);
}

installIfNeeded();

const devServer = spawn(npmCommand, ['run', 'dev'], {
  cwd: repoRoot,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: false,
});

const fallbackTimer = setTimeout(maybeOpenBrowser, 4000);

devServer.stdout.on('data', (data) => {
  const text = data.toString();
  outputBuffer += text;
  process.stdout.write(text);
  maybeOpenBrowser();
});

devServer.stderr.on('data', (data) => {
  process.stderr.write(data);
});

devServer.on('exit', (code) => {
  clearTimeout(fallbackTimer);
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  devServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  devServer.kill('SIGTERM');
});
