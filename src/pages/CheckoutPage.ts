import { expect, Locator, Page } from '@playwright/test';
import { Header } from './Header';
import { Customer, Product } from '../utils/models';
import { orderTotals } from '../utils/money';
import { messages } from '../utils/testData';

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
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');
    this.error = page.getByTestId('error');
    this.items = page.getByTestId('inventory-item');
    this.subtotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async expectInformationStep(): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html/);
    await this.header.expectTitle(messages.checkout.informationTitle);
  }

  async fillInformation(customer: Customer): Promise<void> {
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.postalCode.fill(customer.postalCode);
  }

  /** Clicks Continue without asserting navigation (validation-error cases). */
  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html/);
  }

  async continueExpectingError(message: string): Promise<void> {
    await this.continueButton.click();
    await this.expectError(message);
    await expect(this.page).toHaveURL(/\/checkout-step-one\.html/);
  }

  async cancelToCart(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.page).toHaveURL(/\/cart\.html/);
  }

  async cancelToProducts(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.page).toHaveURL(/\/inventory\.html/);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  async expectOverview(products: Product[]): Promise<void> {
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html/);
    await this.header.expectTitle(messages.checkout.overviewTitle);
    await expect(this.items).toHaveCount(products.length);
    for (const product of products) {
      const row = this.items.filter({ hasText: product.name });
      await expect(row).toBeVisible();
      await expect(row.getByTestId('inventory-item-price')).toHaveText(`$${product.price.toFixed(2)}`);
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
    await this.header.expectTitle(messages.checkout.completeTitle);
    await expect(this.completeHeader).toHaveText(messages.checkout.orderCompleteHeader);
    await expect(this.page.getByTestId('complete-text')).toContainText(
      messages.checkout.orderCompleteBodyContains,
    );
    await this.header.expectCartCount(0);
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
    await expect(this.page).toHaveURL(/\/inventory\.html/);
  }
}
