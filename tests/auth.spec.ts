import { test, expect } from '../src/fixtures/test';
import { messages, protectedPathMessage, protectedPaths, users } from '../src/utils/testData';

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'logs in with the standard user and lands on the products page',
    { tag: '@smoke' },
    async ({ loginPage, productsPage }) => {
      await loginPage.login(users.standard.username, users.standard.password);
      await productsPage.expectLoaded();
      await expect(productsPage.header.cartLink).toBeVisible();
    },
  );

  test('logs in with the performance user despite the intentional delay', async ({ loginPage, productsPage }) => {
    test.setTimeout(120_000);
    await loginPage.login(users.performance.username, users.performance.password);
    await productsPage.expectLoaded();
  });

  test('rejects a locked-out user', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);
    await loginPage.expectError(messages.auth.lockedOut);
    await loginPage.expectAtLoginUrl();
  });

  test('rejects an unknown username and password', async ({ loginPage }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.expectError(messages.auth.mismatch);
    await loginPage.expectAtLoginUrl();
  });

  test('rejects a valid username with the wrong password', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, users.invalid.password);
    await loginPage.expectError(messages.auth.mismatch);
  });

  test('requires a username', async ({ loginPage }) => {
    await loginPage.login('', users.standard.password);
    await loginPage.expectError(messages.auth.usernameRequired);
  });

  test('requires a password', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, '');
    await loginPage.expectError(messages.auth.passwordRequired);
  });

  test('requires a username when both fields are empty', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.expectError(messages.auth.usernameRequired);
  });

  test('treats surrounding spaces as a different username', async ({ loginPage }) => {
    await loginPage.login(` ${users.standard.username} `, users.standard.password);
    await loginPage.expectError(messages.auth.mismatch);
  });

  test('dismisses the error banner', async ({ loginPage }) => {
    await loginPage.login(users.invalid.username, users.invalid.password);
    await loginPage.expectError(messages.auth.mismatch);
    await loginPage.dismissError();
    await expect(loginPage.error).toBeHidden();
  });

  for (const protectedPath of protectedPaths) {
    test(`blocks ${protectedPath} until the user logs in`, async ({ page, loginPage }) => {
      await page.goto(protectedPath);
      await loginPage.expectError(protectedPathMessage(protectedPath));
      await loginPage.expectLoaded();
    });
  }
});
