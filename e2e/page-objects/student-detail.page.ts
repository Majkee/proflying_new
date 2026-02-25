import { type Page, type Locator, expect } from "@playwright/test";

export class StudentDetailPage {
  readonly page: Page;
  readonly editButton: Locator;
  readonly groupsTab: Locator;
  readonly passesTab: Locator;
  readonly paymentsTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.editButton = page.locator('button:has-text("Edytuj")');
    this.groupsTab = page.getByRole("tab", { name: "Grupy" });
    this.passesTab = page.getByRole("tab", { name: "Karnet" });
    this.paymentsTab = page.getByRole("tab", { name: "Platnosci" });
  }

  async goto(studentId: string) {
    await this.page.goto(`/students/${studentId}`);
    await this.page.waitForSelector("h1", { timeout: 15_000 });
  }

  async expectName(name: string) {
    await expect(this.page.locator("h1").first()).toContainText(name);
  }

  async clickEdit() {
    await this.editButton.click();
  }

  async clickGroupsTab() {
    await this.groupsTab.click();
  }

  async clickPassesTab() {
    await this.passesTab.click();
  }

  async clickPaymentsTab() {
    await this.paymentsTab.click();
  }

  async expectTabContent(text: string) {
    await expect(this.page.locator(`text="${text}"`).first()).toBeVisible();
  }
}
