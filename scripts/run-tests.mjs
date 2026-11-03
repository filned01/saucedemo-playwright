import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const allowed = new Set(['qa', 'dev', 'prod', 'all']);
const environment = (process.argv[2] ?? '').toLowerCase();

if (!allowed.has(environment)) {
  console.error(
    `Usage: node scripts/run-tests.mjs <qa|dev|prod|all> [playwright args...]\n` +
      `Received: ${process.argv[2] ?? '(missing)'}`,
  );
  process.exitCode = 1;
  process.exit();
}

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
