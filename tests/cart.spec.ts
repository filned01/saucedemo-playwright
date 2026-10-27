import { test, expect } from '../src/fixtures/test';
import { products, users } from '../src/utils/testData';

test.describe('Add to cart', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs(users.standard);
  });

  test('adds one product and shows it in the cart', async ({ productsPage, cartPage }) => {
    const product = products[0];
    await productsPage.addToCart(product);
    await productsPage.header.expectCartCount(1);
    await productsPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItems([product]);
  });

  test('adds several products and keeps the badge in step with the cart', async ({ productsPage, cartPage }) => {
    const selected = products.slice(0, 3);
    for (const product of selected) {
      await productsPage.addToCart(product);
    }
    await productsPage.header.expectCartCount(selected.length);
    await productsPage.openCart();
    await cartPage.expectItems(selected);
    await cartPage.header.expectCartCount(selected.length);
  });

  test('does not add the same product twice', async ({ productsPage, page }) => {
    const product = products[1];
    await productsPage.addToCart(product);
    await expect(page.locator(`[data-test="add-to-cart-${product.slug}"]`)).toHaveCount(0);
    await productsPage.header.expectCartCount(1);
  });

  test('removes a product from the cart and leaves the others', async ({ productsPage, cartPage }) => {
    const [first, second] = products;
    await productsPage.addToCart(first);
    await productsPage.addToCart(second);
    await productsPage.openCart();
    await cartPage.remove(first);
    await cartPage.expectItems([second]);
    await cartPage.header.expectCartCount(1);
  });

  test('returns to the catalog with continue shopping and keeps the cart', async ({ productsPage, cartPage }) => {
    const product = products[2];
    await productsPage.addToCart(product);
    await productsPage.openCart();
    await cartPage.continueShopping();
    await productsPage.expectLoaded();
    await productsPage.header.expectCartCount(1);
    await expect(productsPage.inventoryItems.filter({ hasText: product.name }).locator(`[data-test="remove-${product.slug}"]`)).toBeVisible();
  });

  test('adds a product from its detail page', async ({ productsPage, cartPage }) => {
    const product = products[4];
    await productsPage.openDetails(product);
    await productsPage.addToCartFromDetails();
    await productsPage.header.expectCartCount(1);
    await productsPage.openCart();
    await cartPage.expectItems([product]);
  });

  test('shows an empty cart before anything is added', async ({ productsPage, cartPage }) => {
    await productsPage.openCart();
    await cartPage.expectEmpty();
    await expect(cartPage.checkoutButton).toBeVisible();
  });
});
