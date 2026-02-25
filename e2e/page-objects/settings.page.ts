import { type Page, type Locator, expect } from "@playwright/test";
import { HEADERS } from "../helpers/selectors";

export class SettingsPage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(HEADERS.settings);
  }

  async goto() {
    await this.page.goto("/settings");
    await this.header.waitFor({ timeout: 15_000 });
  }

  async clickCard(title: string) {
    await this.page.locator(`a:has-text("${title}")`).first().click();
  }

  async expectCards(titles: string[]) {
    for (const title of titles) {
      await expect(this.page.locator(`text="${title}"`).first()).toBeVisible();
    }
  }

  // Pass Types sub-page
  async gotoPassTypes() {
    await this.page.goto("/settings/pass-types");
    await this.page.waitForSelector("h1", { timeout: 15_000 });
  }

  async createPassType(name: string, price: string) {
    await this.page.locator('button:has-text("Dodaj")').click();
    await this.page.getByLabel("Nazwa").fill(name);
    await this.page.getByLabel("Cena").fill(price);
    await this.page.locator('button:has-text("Zapisz")').click();
  }

  // Levels sub-page
  async gotoLevels() {
    await this.page.goto("/settings/levels");
    await this.page.waitForSelector("h1", { timeout: 15_000 });
  }

  async createLevel(name: string) {
    await this.page.locator('button:has-text("Dodaj")').click();
    await this.page.getByLabel("Nazwa").fill(name);
    await this.page.locator('button:has-text("Zapisz")').click();
  }

  // Holidays sub-page
  async gotoHolidays() {
    await this.page.goto("/settings/holidays");
    await this.page.waitForSelector("h1", { timeout: 15_000 });
  }

  async createHoliday(name: string, date: string) {
    await this.page.locator('button:has-text("Dodaj")').click();
    await this.page.getByLabel("Nazwa").fill(name);
    await this.page.getByLabel("Data").fill(date);
    await this.page.locator('button:has-text("Zapisz")').click();
  }
}
