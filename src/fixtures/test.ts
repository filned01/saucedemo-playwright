import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BurgerMenu } from '../pages/BurgerMenu';

type AppFixtures = {
  validateEnvironment: void;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  burgerMenu: BurgerMenu;
};

export const test = base.extend<AppFixtures>({
  validateEnvironment: [
    async ({ baseURL }, use, testInfo) => {
      const environment = testInfo.project.metadata.environment;

      if (typeof environment === 'string' && !baseURL) {
        throw new Error(
          `Missing URL configuration for ${environment.toUpperCase()}. Set ${environment.toUpperCase()}_BASE_URL before running the tests.`,
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

export { expect } from '@playwright/test';
