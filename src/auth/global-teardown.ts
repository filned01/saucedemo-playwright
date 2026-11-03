import fs from 'node:fs';
import { getAuthDir } from '../config/environment';

/**
 * Drops auth storage in CI so workers do not leave credentials on the runner.
 * Locally the files are kept so a failed run is easier to inspect; global setup
 * always rewrites them on the next run.
 */
async function globalTeardown(): Promise<void> {
  if (!process.env.CI) {
    return;
  }

  fs.rmSync(getAuthDir(), { recursive: true, force: true });
}

export default globalTeardown;
