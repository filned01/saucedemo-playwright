import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const environment = process.argv[2];
const cliPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'node_modules',
  '@playwright',
  'test',
  'cli.js',
);
const result = spawnSync(
  process.execPath,
  [cliPath, 'test', ...process.argv.slice(3)],
  {
    stdio: 'inherit',
    env: { ...process.env, TEST_ENV: environment },
  },
);

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
