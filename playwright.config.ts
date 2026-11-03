import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env.CI;
const environments = ['qa', 'dev', 'prod'] as const;
type Environment = (typeof environments)[number];

function isEnvironment(value: string): value is Environment {
  return environments.some((environment) => environment === value);
}

function selectEnvironments(selection: string): Environment[] {
  if (selection === 'all') {
    return [...environments];
  }

  if (isEnvironment(selection)) {
    return [selection];
  }

  throw new Error(`Invalid TEST_ENV "${process.env.TEST_ENV}". Choose qa, dev, prod, or all.`);
}

const requestedEnvironment = (process.env.TEST_ENV ?? 'qa').toLowerCase();
const selectedEnvironments = selectEnvironments(requestedEnvironment);

const configuredUrls: Record<Environment, string | undefined> = {
  qa: process.env.QA_BASE_URL ?? process.env.BASE_URL ?? 'https://www.saucedemo.com',
  dev: process.env.DEV_BASE_URL ?? process.env.BASE_URL ?? 'https://www.saucedemo.com',
  prod: process.env.PROD_BASE_URL,
};

const environmentUrls = selectedEnvironments.map((environment) => ({
  environment,
  baseURL: configuredUrls[environment],
}));

const browsers = [
  { name: 'chromium', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: environmentUrls.flatMap(({ environment, baseURL }) =>
    browsers.map(({ name, device }) => ({
      name: environmentUrls.length === 1 ? name : `${environment}-${name}`,
      use: { ...device, ...(baseURL ? { baseURL } : {}) },
      metadata: { environment },
    })),
  ),
});
