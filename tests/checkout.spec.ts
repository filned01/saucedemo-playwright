import { test, expect } from '../src/fixtures/test';
import { customers, products, users } from '../src/utils/testData';

test.describe('Checkout', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs(users.standard);
  });

  test('completes an order for a single product', async ({ productsPage, cartPage, checkoutPage }) => {
    const product = products[0];
    await productsPage.addToCart(product);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.expectInformationStep();
    await checkoutPage.fillInformation(customers.valid);
    await checkoutPage.continue();
    await checkoutPage.expectOverview([product]);
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
    await checkoutPage.backHome();
    await productsPage.expectLoaded();
    await productsPage.header.expectCartCount(0);
  });

  test('completes an order for every product and checks the 8 percent tax', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    for (const product of products) {
      await productsPage.addToCart(product);
    }
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customers.valid);
    await checkoutPage.continue();
    await checkoutPage.expectOverview(products);
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });

  test('requires a first name', async ({ productsPage, cartPage, checkoutPage, page }) => {
    await productsPage.addToCart(products[0]);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customers.missingFirstName);
    await checkoutPage.continue();
    await checkoutPage.expectError('Error: First Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('requires a last name', async ({ productsPage, cartPage, checkoutPage, page }) => {
    await productsPage.addToCart(products[0]);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customers.missingLastName);
    await checkoutPage.continue();
    await checkoutPage.expectError('Error: Last Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('requires a postal code', async ({ productsPage, cartPage, checkoutPage, page }) => {
    await productsPage.addToCart(products[0]);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customers.missingPostalCode);
    await checkoutPage.continue();
    await checkoutPage.expectError('Error: Postal Code is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('cancel on the information step returns to the cart', async ({ productsPage, cartPage, checkoutPage }) => {
    const product = products[3];
    await productsPage.addToCart(product);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.cancel();
    await cartPage.expectLoaded();
    await cartPage.expectItems([product]);
  });

  test('cancel on the overview step returns to the catalog and keeps the cart', async ({
    productsPage,
    cartPage,
    checkoutPage,
  }) => {
    const product = products[5];
    await productsPage.addToCart(product);
    await productsPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customers.valid);
    await checkoutPage.continue();
    await checkoutPage.expectOverview([product]);
    await checkoutPage.cancel();
    await productsPage.expectLoaded();
    await productsPage.header.expectCartCount(1);
  });

  test('completes checkout of an empty cart with a zero total', async ({ productsPage, cartPage, checkoutPage }) => {
    await productsPage.openCart();
    await cartPage.expectEmpty();
    await cartPage.checkout();
    await checkoutPage.fillInformation(customers.valid);
    await checkoutPage.continue();
    await checkoutPage.expectOverview([]);
    await checkoutPage.finish();
    await checkoutPage.expectOrderComplete();
  });
});
