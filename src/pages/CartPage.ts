import { expect, Locator, Page } from '@playwright/test';
import { Header } from './Header';
import { Product } from '../utils/models';

export class CartPage {
  readonly header: Header;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/cart\.html/);
    await this.header.expectTitle('Your Cart');
  }

  async expectItems(products: Product[]): Promise<void> {
    await expect(this.items).toHaveCount(products.length);
    for (const product of products) {
      const row = this.items.filter({ hasText: product.name });
      await expect(row).toBeVisible();
      await expect(row.locator('[data-test="inventory-item-price"]')).toHaveText(`$${product.price.toFixed(2)}`);
    }
  }

  async expectEmpty(): Promise<void> {
    await expect(this.items).toHaveCount(0);
    await this.header.expectCartCount(0);
  }

  async remove(product: Product): Promise<void> {
    await this.page.locator(`[data-test="remove-${product.slug}"]`).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await expect(this.page).toHaveURL(/\/inventory\.html/);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html/);
  }
}
