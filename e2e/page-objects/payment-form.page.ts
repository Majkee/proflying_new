import { type Page, type Locator, expect } from "@playwright/test";
import { TOAST, PAYMENT_FORM } from "../helpers/selectors";

export class PaymentFormPage {
  readonly page: Page;
  readonly amountInput: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.amountInput = page.locator(PAYMENT_FORM.amount);
    this.notesInput = page.locator(PAYMENT_FORM.notes);
    this.submitButton = page.locator('button:has-text("Zapisz platnosc")');
    this.cancelButton = page.locator('button:has-text("Anuluj")');
  }

  async goto(params?: { studentId?: string; passId?: string }) {
    let url = "/payments/record";
    const searchParams = new URLSearchParams();
    if (params?.studentId) searchParams.set("student", params.studentId);
    if (params?.passId) searchParams.set("pass", params.passId);
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
    await this.page.goto(url);
    await this.page.waitForSelector("h3, h1", { timeout: 15_000 });
  }

  async searchStudent(name: string) {
    const searchInput = this.page.getByPlaceholder("Szukaj");
    await searchInput.fill(name);
    await this.page.waitForTimeout(500);
  }

  async selectStudent(name: string) {
    await this.page.locator(`button:has-text("${name}")`).first().click();
  }

  async selectPass(index: number = 0) {
    // Wait for passes to load
    await this.page.waitForTimeout(1000);
    const passTrigger = this.page.locator('button[role="combobox"]').first();
    await passTrigger.click();
    await this.page.getByRole("option").nth(index).click();
  }

  async fillAmount(amount: string) {
    await this.amountInput.fill(amount);
  }

  async selectMethod(method: "Gotowka" | "Przelew") {
    const methodTrigger = this.page.locator('button[role="combobox"]').last();
    await methodTrigger.click();
    await this.page.getByRole("option", { name: method }).click();
  }

  async fillNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectSuccessToast() {
    await expect(this.page.locator(TOAST.container)).toContainText(TOAST.paymentSaved);
  }

  async expectSuccessState() {
    await expect(this.page.locator('text="Platnosc zapisana"')).toBeVisible({ timeout: 10_000 });
  }

  async expectStudentPreselected(name: string) {
    await expect(this.page.locator(`text="${name}"`).first()).toBeVisible();
  }
}
