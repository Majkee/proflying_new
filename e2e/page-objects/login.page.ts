import { type Page, type Locator, expect } from "@playwright/test";
import { LOGIN } from "../helpers/selectors";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator(LOGIN.emailInput);
    this.passwordInput = page.locator(LOGIN.passwordInput);
    this.submitButton = page.locator(LOGIN.submitButton);
    this.errorMessage = page.locator(LOGIN.errorMessage);
  }

  async goto() {
    await this.page.goto("/login");
    await this.emailInput.waitFor();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(text?: string) {
    const err = this.errorMessage.first();
    await expect(err).toBeVisible();
    if (text) {
      await expect(err).toContainText(text);
    }
  }

  async expectLoadingState() {
    await expect(this.submitButton).toContainText(LOGIN.loadingText);
  }

  async expectRedirectToDashboard() {
    await this.page.waitForURL("**/dashboard", { timeout: 15_000 });
  }
}
