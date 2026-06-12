#!/usr/bin/env node
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFile } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';
const isWsl = Boolean(process.env.WSL_DISTRO_NAME || process.env.WSL_INTEROP);
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const distRoot = resolve(repoRoot, 'dist');
const distIndex = resolve(repoRoot, 'dist', 'index.html');
let opened = false;
let outputBuffer = '';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
]);

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

function contentTypeFor(path) {
  const match = path.match(/\.[^.]+$/);
  return match ? contentTypes.get(match[0].toLowerCase()) ?? 'application/octet-stream' : 'application/octet-stream';
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

function startPackagedApp() {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const requestPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const candidate = resolve(distRoot, `.${requestPath}`);
    const filePath = candidate.startsWith(distRoot) && existsSync(candidate) ? candidate : distIndex;

    readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(500);
        response.end('Unable to read app file.');
        return;
      }

      response.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
      response.end(data);
    });
  });

  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Unable to determine local app URL.');
    }

    const url = `http://127.0.0.1:${address.port}/`;
    console.log(`Guitar Learning Assistant is running at ${url}`);
    console.log('Keep this process running while using the app.');
    openExternal(url);
  });

  process.on('SIGINT', () => server.close(() => process.exit(0)));
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}

function startDevServer() {
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
}

if (existsSync(distIndex)) {
  startPackagedApp();
} else {
  startDevServer();
}
