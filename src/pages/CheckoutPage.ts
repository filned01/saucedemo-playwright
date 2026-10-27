import { expect, Locator, Page } from '@playwright/test';
import { Header } from './Header';
import { Customer, Product } from '../utils/models';
import { orderTotals } from '../utils/money';

export class CheckoutPage {
  readonly header: Header;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly items: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new Header(page);
    this.firstName = page.locator('[data-test="firstName"]');
    this.lastName = page.locator('[data-test="lastName"]');
    this.postalCode = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.error = page.locator('[data-test="error"]');
    this.items = page.locator('[data-test="inventory-item"]');
    this.subtotal = page.locator('[data-test="subtotal-label"]');
    this.tax = page.locator('[data-test="tax-label"]');
    this.total = page.locator('[data-test="total-label"]');
    this.completeHeader = page.locator('[data-test="complete-header"]');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  async expectInformationStep(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html/);
    await this.header.expectTitle('Checkout: Your Information');
  }

  async fillInformation(customer: Customer): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toHaveText(message);
  }

  async expectOverview(products: Product[]): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html/);
    await this.header.expectTitle('Checkout: Overview');
    await expect(this.items).toHaveCount(products.length);
    for (const product of products) {
      const row = this.items.filter({ hasText: product.name });
      await expect(row).toBeVisible();
      await expect(row.locator('[data-test="inventory-item-price"]')).toHaveText(`$${product.price.toFixed(2)}`);
    }
    const totals = orderTotals(products.map((product) => product.price));
    await expect(this.subtotal).toHaveText(totals.subtotal);
    await expect(this.tax).toHaveText(totals.tax);
    await expect(this.total).toHaveText(totals.total);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/\/checkout-complete\.html/);
  }

  async expectOrderComplete(): Promise<void> {
    await this.header.expectTitle('Checkout: Complete!');
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.page.locator('[data-test="complete-text"]')).toContainText('dispatched');
    await this.header.expectCartCount(0);
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
    await expect(this.page).toHaveURL(/\/inventory\.html/);
  }
}
