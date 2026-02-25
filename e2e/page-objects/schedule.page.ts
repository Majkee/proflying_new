import { type Page, type Locator, expect } from "@playwright/test";
import { HEADERS } from "../helpers/selectors";

export class SchedulePage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(HEADERS.schedule);
  }

  async goto() {
    await this.page.goto("/schedule");
    await this.header.waitFor({ timeout: 15_000 });
  }

  async expectDayColumn(day: string) {
    await expect(this.page.locator(`text="${day}"`).first()).toBeVisible();
  }

  async expectGroupBlock(code: string) {
    await expect(this.page.locator(`text="${code}"`).first()).toBeVisible();
  }

  async clickGroupBlock(code: string) {
    await this.page.locator(`text="${code}"`).first().click();
  }
}
