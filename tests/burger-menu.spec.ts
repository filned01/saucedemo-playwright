import { loggedInTest as test, expect } from '../src/fixtures/test';
import { messages, products, users } from '../src/utils/testData';

test.describe('Burger menu', () => {
  test('opens and closes the menu', { tag: '@smoke' }, async ({ burgerMenu, productsPage }) => {
    await burgerMenu.open();
    await burgerMenu.close();
    await productsPage.expectLoaded();
    await expect(burgerMenu.openButton).toBeVisible();
  });

  test('All Items returns to the catalog from the cart', async ({ productsPage, cartPage, burgerMenu }) => {
    await productsPage.addToCart(products[0]);
    await productsPage.openCart();
    await cartPage.expectLoaded();
    await burgerMenu.open();
    await burgerMenu.clickAllItems();
    await productsPage.expectLoaded();
    await productsPage.header.expectCartCount(1);
  });

  test('About links to saucelabs.com', async ({ burgerMenu }) => {
    await burgerMenu.open();
    await expect(burgerMenu.about).toHaveAttribute('href', new RegExp(messages.aboutHrefPattern));
  });

  test('Logout returns to the login page and the cart is kept for the next sign-in', async ({
    productsPage,
    burgerMenu,
    loginPage,
  }) => {
    await productsPage.addToCart(products[0]);
    await productsPage.header.expectCartCount(1);
    await burgerMenu.open();
    await burgerMenu.clickLogout();
    await loginPage.loginAs(users.standard);
    await productsPage.header.expectCartCount(1);
  });

  test('Reset App State clears the cart badge and the catalog button after reload', async ({
    productsPage,
    burgerMenu,
    page,
  }) => {
    const product = products[2];
    await productsPage.addToCart(product);
    await productsPage.header.expectCartCount(1);
    await burgerMenu.open();
    await burgerMenu.clickResetAppState();
    await productsPage.header.expectCartCount(0);
    await page.reload();
    await productsPage.expectLoaded();
    await expect(
      productsPage.inventoryItems.filter({ hasText: product.name }).getByTestId(`add-to-cart-${product.slug}`),
    ).toBeVisible();
  });

  test('Reset App State from checkout clears the cart', async ({ productsPage, cartPage, checkoutPage, burgerMenu }) => {
    await productsPage.addToCart(products[1]);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.expectInformationStep();
    await burgerMenu.open();
    await burgerMenu.clickResetAppState();
    await checkoutPage.header.expectCartCount(0);
    await burgerMenu.clickAllItems();
    await productsPage.header.expectCartCount(0);
  });
});
