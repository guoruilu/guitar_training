import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(desktopDir, '..');
const webDir = path.join(repoRoot, 'web');
const releaseDir = path.join(desktopDir, 'release');
const unpackedDir = path.join(releaseDir, 'win-unpacked');
const signScript = path.join(scriptDir, 'sign-windows-local-dev.ps1');
const confirmationPhrase = 'SMART APP CONTROL BLOCKED';

function run(command, args, cwd) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`Command failed with exit code ${result.status}: ${command} ${args.join(' ')}`);
  }
}

function commandName(base) {
  return process.platform === 'win32' ? `${base}.cmd` : base;
}

function electronBuilderCommand() {
  const command = path.join(desktopDir, 'node_modules', '.bin', commandName('electron-builder'));
  if (!existsSync(command)) {
    throw new Error(`Missing electron-builder at ${command}. Run npm --prefix desktop ci first.`);
  }
  return command;
}

function toWindowsPath(filePath) {
  const resolved = path.resolve(filePath);

  if (process.platform === 'win32') {
    return resolved;
  }

  const mountMatch = resolved.match(/^\/mnt\/([a-zA-Z])\/(.*)$/);
  if (mountMatch) {
    return `${mountMatch[1].toUpperCase()}:\\${mountMatch[2].replace(/\//g, '\\')}`;
  }

  try {
    return execFileSync('wslpath', ['-w', resolved], { encoding: 'utf8' }).trim();
  } catch (error) {
    throw new Error(`Cannot convert path for Windows signing: ${resolved}`);
  }
}

function powershellCommand() {
  return process.platform === 'win32' ? 'powershell.exe' : 'powershell.exe';
}

function listExeFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listExeFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.exe')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function latestPortableExe() {
  const candidates = readdirSync(releaseDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^Guitar-Training-.*-windows-portable\.exe$/i.test(entry.name))
    .map((entry) => path.join(releaseDir, entry.name));

  if (candidates.length === 0) {
    throw new Error(`No portable exe found in ${releaseDir}`);
  }

  return candidates
    .map((filePath) => ({ filePath, mtimeMs: statSync(filePath).mtimeMs }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs)[0].filePath;
}

function signFiles(filePaths) {
  if (filePaths.length === 0) {
    throw new Error('No files were provided for signing.');
  }

  const args = [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    toWindowsPath(signScript),
    '-ConfirmedLocalDevSigning',
    '-NoTimestamp',
    '-FilePath',
    ...filePaths.map(toWindowsPath),
  ];

  run(powershellCommand(), args, repoRoot);
}

async function confirmLocalSigning() {
  console.log('');
  console.log('Local Windows development signing fallback');
  console.log('');
  console.log('Use this workflow only when the normal unsigned portable exe is blocked by Windows Smart App Control on this computer.');
  console.log('This workflow will:');
  console.log('- create or reuse a self-signed code-signing certificate in Cert:\\CurrentUser\\My;');
  console.log('- trust that certificate for the current Windows user in Cert:\\CurrentUser\\Root and Cert:\\CurrentUser\\TrustedPublisher;');
  console.log('- sign the unpacked Electron exe files and the final portable exe;');
  console.log('- affect only the current Windows user on this computer, not other computers.');
  console.log('');
  console.log('Remove this local trust later with: npm run desktop:remove-local-dev-signing');
  console.log('');

  if (!process.stdin.isTTY) {
    throw new Error(`Local signing requires an interactive confirmation. Re-run in a terminal and type: ${confirmationPhrase}`);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`Type "${confirmationPhrase}" to continue: `);
    if (answer.trim() !== confirmationPhrase) {
      throw new Error('Local signing was not confirmed. Nothing was changed.');
    }
  } finally {
    rl.close();
  }
}

async function main() {
  await confirmLocalSigning();

  run(commandName('npm'), ['--prefix', webDir, 'ci'], repoRoot);
  run(commandName('npm'), ['--prefix', desktopDir, 'ci'], repoRoot);
  run(commandName('npm'), ['--prefix', webDir, 'run', 'build'], repoRoot);

  const builder = electronBuilderCommand();
  run(builder, ['--win', 'dir', '--publish', 'never'], desktopDir);

  if (!existsSync(unpackedDir)) {
    throw new Error(`Unpacked Windows app was not created at ${unpackedDir}`);
  }

  signFiles(listExeFiles(unpackedDir));

  run(builder, ['--win', 'portable', '--prepackaged', unpackedDir, '--publish', 'never'], desktopDir);

  const portableExe = latestPortableExe();
  signFiles([portableExe]);

  console.log('\nLocal signed portable exe:');
  console.log(portableExe);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
