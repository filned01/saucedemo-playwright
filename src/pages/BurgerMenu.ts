import { expect, Locator, Page } from '@playwright/test';

export class BurgerMenu {
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly allItems: Locator;
  readonly dynamicCatalog: Locator;
  readonly about: Locator;
  readonly logout: Locator;
  readonly resetAppState: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.locator('#react-burger-menu-btn');
    this.closeButton = page.locator('#react-burger-cross-btn');
    this.allItems = page.locator('#inventory_sidebar_link');
    this.dynamicCatalog = page.getByRole('button', { name: 'Dynamic Catalog' });
    this.about = page.locator('#about_sidebar_link');
    this.logout = page.locator('#logout_sidebar_link');
    this.resetAppState = page.locator('#reset_sidebar_link');
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await expect(this.logout).toBeVisible();
    await expect(this.allItems).toBeVisible();
    await expect(this.dynamicCatalog).toBeVisible();
    await expect(this.about).toBeVisible();
    await expect(this.resetAppState).toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await expect(this.logout).toBeHidden();
  }

  async clickAllItems(): Promise<void> {
    await this.allItems.click();
    await expect(this.page).toHaveURL(/\/inventory\.html/);
  }

  async clickAbout(): Promise<void> {
    await this.about.click();
  }

  async clickLogout(): Promise<void> {
    await this.logout.click();
    await expect(this.page).toHaveURL(/saucedemo\.com\/?$/);
    await expect(this.page.locator('[data-test="login-button"]')).toBeVisible();
  }

  async clickResetAppState(): Promise<void> {
    await this.resetAppState.click();
  }
}
