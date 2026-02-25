import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { NotificationBell } from "../notification-bell";
import { testStudio } from "@/__tests__/mocks/fixtures";

vi.mock("next/link", () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) =>
    <a href={href} onClick={onClick}>{children}</a>,
}));

vi.mock("@/lib/hooks/use-studio", () => ({
  useStudio: () => ({
    activeStudio: testStudio,
    studios: [testStudio],
    loading: false,
    switchStudio: vi.fn(),
    isAllStudios: false,
    setAllStudios: vi.fn(),
  }),
}));

let studentsData: unknown[];

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain: Record<string, unknown> = {};
      chain.select = vi.fn(() => chain);
      chain.eq = vi.fn(() => chain);
      chain.not = vi.fn(() => chain);
      chain.then = (resolve: (v: unknown) => void) => resolve({ data: studentsData, error: null });
      return chain;
    }),
  }),
}));

beforeEach(() => {
  const today = new Date();
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const todayDay = String(today.getDate()).padStart(2, "0");

  studentsData = [
    { id: "s1", full_name: "Anna Urodziny", date_of_birth: `2000-${todayMonth}-${todayDay}` },
  ];
});

describe("NotificationBell", () => {
  it("renders bell button with sr-only label", () => {
    studentsData = [];
    render(<NotificationBell />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("shows badge count when there are birthdays today", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("does not show badge when no students have birthdays", async () => {
    studentsData = [];
    render(<NotificationBell />);
    // Give time for data to load - no badge should appear
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
    // The "1" badge should not be present
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("shows badge for upcoming birthdays within 7 days", async () => {
    const upcoming = new Date();
    upcoming.setDate(upcoming.getDate() + 3);
    const upcomingMonth = String(upcoming.getMonth() + 1).padStart(2, "0");
    const upcomingDay = String(upcoming.getDate()).padStart(2, "0");

    studentsData = [
      { id: "s2", full_name: "Maja Nadchodzace", date_of_birth: `2005-${upcomingMonth}-${upcomingDay}` },
    ];

    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("counts multiple birthdays", async () => {
    const today = new Date();
    const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
    const todayDay = String(today.getDate()).padStart(2, "0");

    studentsData = [
      { id: "s1", full_name: "Anna", date_of_birth: `2000-${todayMonth}-${todayDay}` },
      { id: "s2", full_name: "Maja", date_of_birth: `2005-${todayMonth}-${todayDay}` },
    ];

    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("ignores students without date_of_birth", async () => {
    studentsData = [
      { id: "s1", full_name: "Anna", date_of_birth: null },
    ];

    render(<NotificationBell />);
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("does not count birthdays beyond 7 days", async () => {
    const far = new Date();
    far.setDate(far.getDate() + 10);
    const farMonth = String(far.getMonth() + 1).padStart(2, "0");
    const farDay = String(far.getDate()).padStart(2, "0");

    studentsData = [
      { id: "s1", full_name: "Anna Far", date_of_birth: `2000-${farMonth}-${farDay}` },
    ];

    render(<NotificationBell />);
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
