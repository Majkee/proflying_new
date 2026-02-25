// === Login ===
export const LOGIN = {
  emailInput: "#email",
  passwordInput: "#password",
  submitButton: 'button[type="submit"]',
  errorMessage: ".text-destructive",
  loadingText: "Logowanie...",
  submitText: "Zaloguj sie",
} as const;

// === Sidebar / Navigation ===
export const NAV = {
  sidebar: "aside",
  logo: 'a:has-text("ProFlying")',
  pulpit: 'aside >> a:has-text("Pulpit")',
  obecnosc: 'aside >> a:has-text("Obecnosc")',
  grafik: 'aside >> a:has-text("Grafik")',
  kursantki: 'aside >> a:has-text("Kursantki")',
  grupy: 'aside >> a:has-text("Grupy")',
  platnosci: 'aside >> a:has-text("Platnosci")',
  ustawienia: 'aside >> a:has-text("Ustawienia")',
  activeClass: "text-primary",
} as const;

// === Page Headers ===
export const HEADERS = {
  dashboard: 'h1:has-text("Pulpit")',
  students: 'h1:has-text("Kursantki")',
  groups: 'h1:has-text("Grupy")',
  attendance: 'h1:has-text("Obecnosc")',
  payments: 'h1:has-text("Platnosci")',
  schedule: 'h1:has-text("Grafik")',
  settings: 'h1:has-text("Ustawienia")',
} as const;

// === Toasts ===
export const TOAST = {
  container: "[data-sonner-toast]",
  studentAdded: "Kursantka dodana",
  studentUpdated: "Kursantka zaktualizowana",
  groupAdded: "Grupa dodana",
  groupUpdated: "Grupa zaktualizowana",
  paymentSaved: "Platnosc zapisana",
} as const;

// === Student Form ===
export const STUDENT_FORM = {
  fullName: "#fullName",
  phone: "#phone",
  email: "#email",
  dateOfBirth: "#dateOfBirth",
  notes: "#notes",
} as const;

// === Group Form ===
export const GROUP_FORM = {
  code: "#code",
  name: "#name",
  startTime: "#startTime",
  endTime: "#endTime",
  capacity: "#capacity",
} as const;

// === Payment Form ===
export const PAYMENT_FORM = {
  amount: "#amount",
  notes: "#notes",
} as const;

// === Badges ===
export const BADGES = {
  oplacony: "Oplacony",
  nieoplacony: "Nieoplacony",
  wygasl: "Wygasl",
} as const;

// === Data TestIDs ===
export const TESTID = {
  studentRow: "student-row",
  studentForm: "student-form",
  groupCard: "group-card",
  groupForm: "group-form",
  attendanceSummary: "attendance-summary",
  attendanceStudentRow: "attendance-student-row",
  paymentForm: "payment-form",
  studioSwitcher: "studio-switcher",
  userMenu: "user-menu",
  pageHeader: "page-header",
} as const;

// === Common ===
export const COMMON = {
  addButton: 'a:has-text("Dodaj")',
  saveButton: 'button:has-text("Zapisz")',
  cancelButton: 'button:has-text("Anuluj")',
  deleteButton: 'button:has-text("Usun")',
  confirmButton: 'button:has-text("Potwierdz")',
  spinner: ".animate-spin",
} as const;
