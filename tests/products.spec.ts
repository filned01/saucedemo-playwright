import { test, loggedInTest, expect } from '../src/fixtures/test';
import { catalogPriceBounds, products, productsByName, users } from '../src/utils/testData';
import { SortOption } from '../src/utils/models';

loggedInTest.describe('Products page', () => {
  loggedInTest(
    'lists every catalog product with a name, price, and description',
    { tag: '@smoke' },
    async ({ productsPage }) => {
      await productsPage.expectLoaded();
      await productsPage.expectProductCount(products.length);
      for (const product of products) {
        await productsPage.expectProductVisible(product);
      }
    },
  );

  loggedInTest('sorts products by name from A to Z and Z to A', async ({ productsPage }) => {
    await productsPage.sortBy(SortOption.nameAsc);
    await expect(await productsPage.names()).toEqual(productsByName('asc').map((product) => product.name));

    await productsPage.sortBy(SortOption.nameDesc);
    await expect(await productsPage.names()).toEqual(productsByName('desc').map((product) => product.name));
  });

  loggedInTest('sorts products by price from low to high and high to low', async ({ productsPage }) => {
    const { min, max } = catalogPriceBounds();

    await productsPage.sortBy(SortOption.priceAsc);
    const lowToHigh = await productsPage.prices();
    expect(lowToHigh).toEqual([...lowToHigh].sort((a, b) => a - b));
    expect(lowToHigh[0]).toBe(min);
    expect(lowToHigh[lowToHigh.length - 1]).toBe(max);

    await productsPage.sortBy(SortOption.priceDesc);
    const highToLow = await productsPage.prices();
    expect(highToLow).toEqual([...highToLow].sort((a, b) => b - a));
    expect(highToLow[0]).toBe(max);
    expect(highToLow[highToLow.length - 1]).toBe(min);
  });

  loggedInTest('opens a product detail page and returns to the catalog', async ({ productsPage }) => {
    const product = products[0];
    await productsPage.openDetails(product);
    await expect(productsPage.detailName).toHaveText(product.name);
    await expect(productsPage.detailPrice).toHaveText(`$${product.price.toFixed(2)}`);
    await productsPage.backToProducts();
  });

  loggedInTest('adds and removes a product without leaving the catalog', async ({ productsPage }) => {
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
