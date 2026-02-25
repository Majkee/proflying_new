import { type Page, type Locator, expect } from "@playwright/test";
import { STUDENT_FORM, TOAST } from "../helpers/selectors";

export class StudentFormPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly dateOfBirthInput: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.locator(STUDENT_FORM.fullName);
    this.phoneInput = page.locator(STUDENT_FORM.phone);
    this.emailInput = page.locator(STUDENT_FORM.email);
    this.dateOfBirthInput = page.locator(STUDENT_FORM.dateOfBirth);
    this.notesInput = page.locator(STUDENT_FORM.notes);
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Anuluj")');
  }

  async goto() {
    await this.page.goto("/students/new");
    await this.fullNameInput.waitFor({ timeout: 15_000 });
  }

  async fillName(name: string) {
    await this.fullNameInput.fill(name);
  }

  async fillPhone(phone: string) {
    await this.phoneInput.fill(phone);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillDateOfBirth(date: string) {
    await this.dateOfBirthInput.fill(date);
  }

  async fillNotes(notes: string) {
    await this.notesInput.fill(notes);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectSuccessToast() {
    await expect(this.page.locator(TOAST.container)).toContainText(TOAST.studentAdded);
  }

  async expectValidationError(text: string) {
    await expect(this.page.locator(".text-destructive").filter({ hasText: text })).toBeVisible();
  }

  async expectRedirectToList() {
    await this.page.waitForURL("**/students", { timeout: 10_000 });
  }
}
