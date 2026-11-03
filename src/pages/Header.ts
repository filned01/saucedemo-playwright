import { expect, Locator, Page } from '@playwright/test';

/** Shared header used by every page after login. */
export class Header {
  readonly menuButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.title = page.getByTestId('title');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/\/cart\.html/);
  }

  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toHaveText(title);
  }
}
