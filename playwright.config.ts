import { defineConfig, devices } from '@playwright/test';
import {
  type Environment,
  loadDotEnv,
  resolveBaseUrl,
  resolveRequestedEnvironment,
  selectEnvironments,
} from './src/config/environment';

loadDotEnv();

const isCi = !!process.env.CI;
const selectedEnvironments = selectEnvironments(resolveRequestedEnvironment());

const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
] as const;

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  preserveOutput: 'failures-only',
  globalSetup: './src/auth/global-setup.ts',
  globalTeardown: './src/auth/global-teardown.ts',
  reporter: [
    ['./src/reporters/environmentReporter.ts'],
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
  ],
  use: {
    testIdAttribute: 'data-test',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: selectedEnvironments.flatMap((environment: Environment) => {
    const baseURL = resolveBaseUrl(environment);

    return browsers.map(({ name, device }) => ({
      name: `${environment}-${name}`,
      use: {
        ...device,
        ...(baseURL ? { baseURL } : {}),
      },
      metadata: {
        environment,
        browser: name,
        baseURL: baseURL ?? null,
      },
    }));
  }),
});
