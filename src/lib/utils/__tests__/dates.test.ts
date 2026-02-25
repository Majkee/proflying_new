import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatDate, formatShortDate, formatTime, formatRelativeDate, getDayName, toDateString, getCurrentDayOfWeek, formatMonthYear } from "../dates";

describe("formatTime", () => {
  it("extracts HH:MM from HH:MM:SS", () => {
    expect(formatTime("17:30:00")).toBe("17:30");
  });

  it("handles already short format", () => {
    expect(formatTime("09:00")).toBe("09:00");
  });
});

describe("formatDate", () => {
  it("formats string date to Polish locale", () => {
    const result = formatDate("2026-02-23");
    expect(result).toContain("23");
    expect(result).toContain("2026");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date(2026, 0, 15));
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });
});

describe("formatShortDate", () => {
  it("formats to short date", () => {
    const result = formatShortDate("2026-02-23");
    expect(result).toContain("23");
  });
});

describe("formatRelativeDate", () => {
  it("returns Dzisiaj for today", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(formatRelativeDate(today)).toBe("Dzisiaj");
  });

  it("returns Wczoraj for yesterday", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    expect(formatRelativeDate(yesterday)).toBe("Wczoraj");
  });

  it("returns Jutro for tomorrow", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    expect(formatRelativeDate(tomorrow)).toBe("Jutro");
  });

  it("returns full date for other dates", () => {
    const result = formatRelativeDate("2025-06-15");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});

describe("getDayName", () => {
  it("returns correct Polish day names", () => {
    expect(getDayName(0)).toBe("Niedziela");
    expect(getDayName(1)).toBe("Poniedzialek");
    expect(getDayName(2)).toBe("Wtorek");
    expect(getDayName(3)).toBe("Sroda");
    expect(getDayName(4)).toBe("Czwartek");
    expect(getDayName(5)).toBe("Piatek");
    expect(getDayName(6)).toBe("Sobota");
  });

  it("returns empty string for invalid day", () => {
    expect(getDayName(7)).toBe("");
    expect(getDayName(-1)).toBe("");
  });
});

describe("toDateString", () => {
  it("formats Date to YYYY-MM-DD", () => {
    expect(toDateString(new Date(2026, 1, 23))).toBe("2026-02-23");
  });

  it("pads single-digit months and days", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("getCurrentDayOfWeek", () => {
  it("returns a number 0-6", () => {
    const day = getCurrentDayOfWeek();
    expect(day).toBeGreaterThanOrEqual(0);
    expect(day).toBeLessThanOrEqual(6);
  });
});

describe("formatMonthYear", () => {
  it("formats date to Polish month and year", () => {
    const result = formatMonthYear(new Date(2026, 1, 1));
    expect(result).toContain("2026");
  });
});
