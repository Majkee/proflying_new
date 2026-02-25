import { type Page, type Locator, expect } from "@playwright/test";
import { HEADERS } from "../helpers/selectors";

export class AttendanceIndexPage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(HEADERS.attendance);
  }

  async goto() {
    await this.page.goto("/attendance");
    await this.header.waitFor({ timeout: 15_000 });
  }

  async expectGroupCard(groupName: string) {
    await expect(this.page.locator(`text="${groupName}"`).first()).toBeVisible();
  }

  async clickCheckAttendance(groupName: string) {
    const card = this.page.locator(`div:has-text("${groupName}")`).first();
    await card.locator('a:has-text("Sprawdz")').click();
    await this.page.waitForURL(/\/attendance\/.+/);
  }

  async expectTodayLabel() {
    await expect(this.page.locator('text="Dzisiaj"').first()).toBeVisible();
  }
}
