import { test, expect } from '../src/fixtures/test';
import { products, productsByName, users } from '../src/utils/testData';
import { SortOption } from '../src/utils/models';

test.describe('Products page', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.loginAs(users.standard);
  });

  test('lists every catalog product with a name, price, and description', async ({ productsPage }) => {
    await productsPage.expectLoaded();
    await productsPage.expectProductCount(products.length);
    for (const product of products) {
      await productsPage.expectProductVisible(product);
    }
  });

  test('sorts products by name from A to Z and Z to A', async ({ productsPage }) => {
    await productsPage.sortBy(SortOption.nameAsc);
    await expect(await productsPage.names()).toEqual(productsByName('asc').map((product) => product.name));

    await productsPage.sortBy(SortOption.nameDesc);
    await expect(await productsPage.names()).toEqual(productsByName('desc').map((product) => product.name));
  });

  test('sorts products by price from low to high and high to low', async ({ productsPage }) => {
    await productsPage.sortBy(SortOption.priceAsc);
    const lowToHigh = await productsPage.prices();
    expect(lowToHigh).toEqual([...lowToHigh].sort((a, b) => a - b));
    expect(lowToHigh[0]).toBe(7.99);
    expect(lowToHigh[lowToHigh.length - 1]).toBe(49.99);

    await productsPage.sortBy(SortOption.priceDesc);
    const highToLow = await productsPage.prices();
    expect(highToLow).toEqual([...highToLow].sort((a, b) => b - a));
    expect(highToLow[0]).toBe(49.99);
    expect(highToLow[highToLow.length - 1]).toBe(7.99);
  });

  test('opens a product detail page and returns to the catalog', async ({ productsPage, page }) => {
    const product = products[0];
    await productsPage.openDetails(product);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText(product.name);
    await expect(page.locator('[data-test="inventory-item-price"]')).toHaveText(`$${product.price.toFixed(2)}`);
    await page.locator('[data-test="back-to-products"]').click();
    await productsPage.expectLoaded();
  });

  test('adds and removes a product without leaving the catalog', async ({ productsPage }) => {
    const product = products[0];
    await productsPage.addToCart(product);
    await productsPage.header.expectCartCount(1);
    await productsPage.removeFromCart(product);
    await productsPage.header.expectCartCount(0);
  });
});

test.describe('Products page for the problem user', () => {
  test('lets the problem user reach the catalog', async ({ loginPage, productsPage }) => {
    await loginPage.loginAs(users.problem);
    await productsPage.expectProductCount(products.length);
  });
});
