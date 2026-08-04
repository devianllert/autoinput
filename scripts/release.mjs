import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const packageMetadata = JSON.parse(await readFile('package.json', 'utf8'));
const prompt = createInterface({ input: stdin, output: stdout });
const inputVersion = args.find((argument) => !argument.startsWith('--'));

const version = (
  inputVersion ?? (await prompt.question(`New version (${packageMetadata.version}): `))
)
  .trim()
  .replace(/^v/, '');
prompt.close();

if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
  throw new Error('Version must use the stable X.Y.Z format, for example 1.2.0.');
}

if (dryRun) {
  console.log(`Dry run passed: pnpm version ${version}`);
  process.exit(0);
}

if (!(process.env.GITHUB_RELEASE_TOKEN ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN)) {
  throw new Error('Set GITHUB_RELEASE_TOKEN with GitHub Contents read/write permission.');
}

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const child = spawn(command, ['version', version], { stdio: 'inherit', shell: false });
process.exitCode = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('exit', (code) => resolve(code ?? 1));
});
