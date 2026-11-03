import { expect, Locator, Page } from '@playwright/test';
import { UserCredentials } from '../utils/models';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;
  readonly errorClose: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.errorClose = page.getByTestId('error-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.loginButton).toBeVisible();
    await expect(this.usernameInput).toBeEditable();
    await expect(this.passwordInput).toBeEditable();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Full UI login for the happy path; waits until the products catalog is ready. */
  async loginAs(user: UserCredentials): Promise<void> {
    await this.goto();
    await this.login(user.username, user.password);
    await expect(this.page).toHaveURL(/\/inventory\.html/);
    await expect(this.page.getByTestId('title')).toHaveText('Products');
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  async dismissError(): Promise<void> {
    await this.errorClose.click();
    await expect(this.error).toBeHidden();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
  }

  /** Login form after a failed attempt that stayed on the site root. */
  async expectAtLoginUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/\/(?:index\.html)?$/);
    await this.expectLoaded();
  }
}
