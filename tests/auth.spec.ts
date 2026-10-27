import { test, expect } from '../src/fixtures/test';
import { users } from '../src/utils/testData';

const mismatch = 'Epic sadface: Username and password do not match any user in this service';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in with the standard user and lands on the products page', async ({ loginPage, productsPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await productsPage.expectLoaded();
    await expect(productsPage.header.cartLink).toBeVisible();
  });

  test('logs in with the performance user despite the intentional delay', async ({ loginPage, productsPage }) => {
    test.setTimeout(60_000);
    await loginPage.login(users.performance.username, users.performance.password);
    await productsPage.expectLoaded();
  });

  test('rejects a locked-out user', async ({ loginPage, page }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectError('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('rejects an unknown username and password', async ({ loginPage, page }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.expectError(mismatch);
    await expect(page).toHaveURL(/\/$/);
  });

  test('rejects a valid username with the wrong password', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, users.invalid.password);
    await loginPage.expectError(mismatch);
  });

  test('requires a username', async ({ loginPage }) => {
    await loginPage.login('', users.standard.password);
    await loginPage.expectError('Epic sadface: Username is required');
  });

  test('requires a password', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, '');
    await loginPage.expectError('Epic sadface: Password is required');
  });

  test('requires a username when both fields are empty', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectError('Epic sadface: Username is required');
  });

  test('treats surrounding spaces as a different username', async ({ loginPage }) => {
    await loginPage.login(` ${users.standard.username} `, users.standard.password);
    await loginPage.expectError(mismatch);
  });

  test('dismisses the error banner', async ({ loginPage }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.expectError(mismatch);
    await loginPage.dismissError();
    await expect(loginPage.error).toBeHidden();
  });

  const protectedPaths = [
    '/inventory.html',
    '/cart.html',
    '/checkout-step-one.html',
    '/checkout-step-two.html',
    '/checkout-complete.html',
  ];

  for (const protectedPath of protectedPaths) {
    test(`blocks ${protectedPath} until the user logs in`, async ({ page }) => {
      await page.goto(protectedPath);
      await expect(page.locator('[data-test="error"]')).toHaveText(
        `Epic sadface: You can only access '${protectedPath}' when you are logged in.`,
      );
      await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    });
  }
});
