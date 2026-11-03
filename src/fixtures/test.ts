import fs from 'node:fs';
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BurgerMenu } from '../pages/BurgerMenu';
import {
  envBaseUrlVarName,
  getAuthStatePath,
  isBrowserName,
  type Environment,
} from '../config/environment';

type AppFixtures = {
  /** Fails fast when a selected environment has no base URL. */
  validateEnvironment: void;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  burgerMenu: BurgerMenu;
};

type LoggedInFixtures = {
  /** Lands on the products catalog using reused auth storage. */
  openInventory: void;
};

function readEnvironment(testInfo: { project: { metadata: Record<string, unknown> } }): Environment {
  const environment = testInfo.project.metadata.environment;
  if (typeof environment !== 'string') {
    throw new Error('Project metadata.environment is missing. Check playwright.config.ts projects.');
  }
  return environment as Environment;
}

function readBrowser(testInfo: { project: { name: string; metadata: Record<string, unknown> } }): string {
  const fromMetadata = testInfo.project.metadata.browser;
  if (typeof fromMetadata === 'string' && isBrowserName(fromMetadata)) {
    return fromMetadata;
  }

  const fromName = testInfo.project.name.split('-').at(-1);
  if (fromName && isBrowserName(fromName)) {
    return fromName;
  }

  throw new Error(`Could not resolve browser for project "${testInfo.project.name}".`);
}

/**
 * Guest (logged-out) fixtures.
 * Playwright owns browser/context/page lifecycle: it closes them after each test
 * (after screenshots, video, and traces are collected on failure).
 */
export const test = base.extend<AppFixtures>({
  validateEnvironment: [
    async ({ baseURL }, use, testInfo) => {
      const environment = readEnvironment(testInfo);

      if (!baseURL) {
        throw new Error(
          `Missing URL configuration for ${environment.toUpperCase()}. ` +
            `Set ${envBaseUrlVarName(environment)} or update config/environments.json before running.`,
        );
      }

      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  burgerMenu: async ({ page }, use) => {
    await use(new BurgerMenu(page));
  },
});

/**
 * Use for specs that need a signed-in standard user.
 * Reuses per-environment + per-browser storage state from global setup.
 */
export const loggedInTest = test.extend<LoggedInFixtures>({
  storageState: async ({ baseURL }, use, testInfo) => {
    void baseURL;
    const environment = readEnvironment(testInfo);
    const browser = readBrowser(testInfo);
    const authPath = getAuthStatePath(environment, browser);

    if (!fs.existsSync(authPath)) {
      throw new Error(
        `Auth storage for ${environment.toUpperCase()}/${browser} was not found at ${authPath}. ` +
          'Global setup should create it before logged-in tests run.',
      );
    }

    await use(authPath);
  },

  openInventory: [
    async ({ page, productsPage }, use) => {
      await page.goto('/inventory.html');
      await productsPage.expectLoaded();
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
