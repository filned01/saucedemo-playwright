import fs from 'node:fs';
import { chromium, firefox, webkit, type BrowserType, type FullConfig } from '@playwright/test';
import {
  getAuthDir,
  getAuthStatePath,
  isBrowserName,
  projectFiltersFromArgv,
  projectMatchesFilters,
} from '../config/environment';
import { users } from '../utils/testData';

const launchers: Record<string, BrowserType> = {
  chromium,
  firefox,
  webkit,
};

/**
 * Logs in once per selected environment + browser and writes storage state.
 * Honors `--project` filters so CI jobs that only install one browser do not
 * attempt to launch the others. Always closes browsers opened here.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const authDir = getAuthDir();
  fs.mkdirSync(authDir, { recursive: true });

  const filters = projectFiltersFromArgv();
  const prepared = new Set<string>();
  const openBrowsers = new Map<string, Awaited<ReturnType<BrowserType['launch']>>>();

  try {
    for (const project of config.projects) {
      if (!projectMatchesFilters(project.name, filters)) {
        continue;
      }

      const environment = project.metadata?.environment;
      const browserName =
        typeof project.metadata?.browser === 'string'
          ? project.metadata.browser
          : project.name.split('-').at(-1);

      if (typeof environment !== 'string' || typeof browserName !== 'string' || !isBrowserName(browserName)) {
        continue;
      }

      const cacheKey = `${environment}-${browserName}`;
      if (prepared.has(cacheKey)) {
        continue;
      }

      const baseURL = project.use.baseURL;
      if (!baseURL) {
        continue;
      }

      const launcher = launchers[browserName];
      let browser = openBrowsers.get(browserName);
      if (!browser) {
        browser = await launcher.launch();
        openBrowsers.set(browserName, browser);
      }

      prepared.add(cacheKey);
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();

      try {
        await page.goto('/');
        await page.locator('[data-test="username"]').fill(users.standard.username);
        await page.locator('[data-test="password"]').fill(users.standard.password);
        await page.locator('[data-test="login-button"]').click();
        await page.waitForURL(/\/inventory\.html/, { timeout: 60_000 });

        await context.storageState({ path: getAuthStatePath(environment, browserName) });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Global auth setup failed for ${environment.toUpperCase()}/${browserName} (${baseURL}): ${message}`,
          { cause: error },
        );
      } finally {
        await context.close();
      }
    }
  } finally {
    await Promise.all([...openBrowsers.values()].map((browser) => browser.close()));
  }
}

export default globalSetup;
