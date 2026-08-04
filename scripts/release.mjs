import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import Readline from 'node:readline';

import packageJSON from '../package.json' with { type: 'json' };
import { checkValidations } from './version.mjs';

function makeOptions(options) {
  return {
    stdio: options?.inherit ? 'inherit' : 'pipe',
    cwd: resolve(),
    encoding: 'utf8',
  };
}

const exec = (commands, options) => {
  const outputs = [];

  for (const command of commands) {
    const output = execSync(command, makeOptions(options));
    outputs.push(output);
  }

  return outputs;
};

const question = (question) => {
  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      readline.close();
      resolve(answer);
    });
  });
};

async function makeRelease() {
  console.clear();

  const { version } = packageJSON;

  const newVersion = await question(`Enter a new version: (current is ${version})`);

  if (checkValidations({ version, newVersion })) {
    return;
  }

  packageJSON.version = newVersion;

  try {
    console.log(`> Updating package.json version...`);

    await writeFile(resolve('package.json'), JSON.stringify(packageJSON, null, 2));

    console.log(`\nDone!\n`);
    console.log(`> Creating git tag and starting release builds...`);

    exec(
      [`git commit -am v${newVersion}`, `git tag v${newVersion}`, `git push`, `git push --tags`],
      {
        inherit: true,
      },
    );

    console.log(`\nRelease builds started in GitHub Actions.\n`);
  } catch ({ message }) {
    console.log(`
    🛑 Something went wrong!\n
      👀 Error: ${message}
    `);
  }
}

await makeRelease();
