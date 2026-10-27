import { expect, Locator, Page } from '@playwright/test';
import { Header } from './Header';
import { Product, SortOptionValue } from '../utils/models';

export class ProductsPage {
  readonly header: Header;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/inventory\.html/);
    await this.header.expectTitle('Products');
  }

  async expectProductCount(count: number): Promise<void> {
    await expect(this.inventoryItems).toHaveCount(count);
  }

  async expectProductVisible(product: Product): Promise<void> {
    const card = this.inventoryItems.filter({ hasText: product.name });
    await expect(card).toBeVisible();
    await expect(card.locator('[data-test="inventory-item-price"]')).toHaveText(`$${product.price.toFixed(2)}`);
    await expect(card.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
  }

  async names(): Promise<string[]> {
    return this.page.locator('[data-test="inventory-item-name"]').allTextContents();
  }

  async prices(): Promise<number[]> {
    const texts = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
    return texts.map((text) => Number(text.replace('$', '')));
  }

  async sortBy(option: SortOptionValue): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async addToCart(product: Product): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${product.slug}"]`).click();
    await expect(this.page.locator(`[data-test="remove-${product.slug}"]`)).toBeVisible();
  }

  /** The item detail view has its own Add to cart button, separate from the catalog buttons. */
  async addToCartFromDetails(): Promise<void> {
    const details = this.page.locator('.inventory_details');
    await details.getByRole('button', { name: 'Add to cart', exact: true }).click();
    await expect(details.getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
  }

  async removeFromCart(product: Product): Promise<void> {
    await this.page.locator(`[data-test="remove-${product.slug}"]`).click();
    await expect(this.page.locator(`[data-test="add-to-cart-${product.slug}"]`)).toBeVisible();
  }

  async openDetails(product: Product): Promise<void> {
    await this.page
      .locator('[data-test="inventory-item-name"]')
      .getByText(product.name, { exact: true })
      .click();
    await expect(this.page).toHaveURL(new RegExp(`/inventory-item\\.html\\?id=${product.id}$`));
  }

  async openCart(): Promise<void> {
    await this.header.openCart();
  }
}
