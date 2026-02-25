import { type Page, type Locator, expect } from "@playwright/test";
import { HEADERS, TESTID } from "../helpers/selectors";

export class GroupsListPage {
  readonly page: Page;
  readonly header: Locator;
  readonly addButton: Locator;
  readonly groupCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator(HEADERS.groups);
    this.addButton = page.locator('a:has-text("Dodaj")');
    this.groupCards = page.locator(`[data-testid="${TESTID.groupCard}"]`);
  }

  async goto() {
    await this.page.goto("/groups");
    await this.header.waitFor({ timeout: 15_000 });
  }

  async clickGroup(name: string) {
    await this.page.locator(`a:has-text("${name}")`).first().click();
    await this.page.waitForURL(/\/groups\/.+/);
  }

  async clickAddGroup() {
    await this.addButton.click();
    await this.page.waitForURL("**/groups/new");
  }

  async clickDeactivate(groupName: string) {
    const card = this.page.locator(`div:has-text("${groupName}")`).first();
    await card.hover();
    await card.locator('button[title="Dezaktywuj grupe"]').click();
  }

  async confirmDeactivation() {
    await this.page.locator('button:has-text("Dezaktywuj")').last().click();
  }

  async cancelDeactivation() {
    await this.page.locator('button:has-text("Anuluj")').click();
  }

  async expectGroupVisible(name: string) {
    await expect(this.page.locator(`text="${name}"`).first()).toBeVisible();
  }

  async expectGroupNotVisible(name: string) {
    await expect(this.page.locator(`text="${name}"`)).toHaveCount(0);
  }

  async expectDayLabel(dayLabel: string) {
    await expect(this.page.locator(`h3:has-text("${dayLabel}")`)).toBeVisible();
  }

  async expectDeactivationDialog() {
    await expect(this.page.locator('text="Dezaktywuj grupe"').last()).toBeVisible();
  }
}
