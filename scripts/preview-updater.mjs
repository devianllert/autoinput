import { spawn } from 'node:child_process';

const env = {
  ...process.env,
  VITE_AUTOINPUT_ENABLE_DEV_UPDATER: '1',
};

const run = (args) => {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'cmd.exe' : 'pnpm';
    const commandArgs = isWindows ? ['/d', '/s', '/c', `pnpm ${args.join(' ')}`] : args;
    const child = spawn(command, commandArgs, { stdio: 'inherit', env });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`pnpm ${args.join(' ')} exited with code ${String(code)}`));
    });
  });
};

await run(['exec', 'electron-vite', 'preview']);
