import { type Page, type Locator, expect } from "@playwright/test";
import { HEADERS } from "../helpers/selectors";

export class PaymentsPage {
  readonly page: Page;
  readonly header: Locator;
  readonly recordButton: Locator;
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(HEADERS.payments);
    this.recordButton = page.locator('a:has-text("Zapisz platnosc")');
    this.prevMonthButton = page.locator('button:has(svg.lucide-chevron-left)').first();
    this.nextMonthButton = page.locator('button:has(svg.lucide-chevron-right)').first();
  }

  async goto() {
    await this.page.goto("/payments");
    await this.header.waitFor({ timeout: 15_000 });
  }

  async navigateMonth(direction: "prev" | "next") {
    if (direction === "prev") {
      await this.prevMonthButton.click();
    } else {
      await this.nextMonthButton.click();
    }
  }

  async clickRecordPayment() {
    await this.recordButton.click();
    await this.page.waitForURL("**/payments/record");
  }

  async expectRevenue(label: string, amount: string) {
    const card = this.page.locator(`div:has-text("${label}")`).first();
    await expect(card).toContainText(amount);
  }

  async expectRevenueCards() {
    await expect(this.page.locator('text="Razem"').first()).toBeVisible();
    await expect(this.page.locator('text="Gotowka"').first()).toBeVisible();
    await expect(this.page.locator('text="Przelewy"').first()).toBeVisible();
  }
}
