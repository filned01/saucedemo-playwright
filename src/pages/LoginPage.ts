import { expect, Locator, Page } from '@playwright/test';
import { UserCredentials } from '../utils/models';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;
  readonly errorClose: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.error = page.locator('[data-test="error"]');
    this.errorClose = page.locator('[data-test="error-button"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAs(user: UserCredentials): Promise<void> {
    await this.goto();
    await this.login(user.username, user.password);
    await expect(this.page).toHaveURL(/\/inventory\.html/);
    await expect(this.page.locator('[data-test="title"]')).toHaveText('Products');
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  async dismissError(): Promise<void> {
    await this.errorClose.click();
  }
}
