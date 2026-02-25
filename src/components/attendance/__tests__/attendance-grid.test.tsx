import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AttendanceGrid } from "../attendance-grid";
import { testStudio, testStudent, testStudent2 } from "@/__tests__/mocks/fixtures";

// Mock hooks used by child components (QuickPaymentDialog, etc.)
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

vi.mock("@/lib/hooks/use-user", () => ({
  useUser: () => ({
    profile: { id: "user-1", role: "super_admin" },
    loading: false,
  }),
}));

vi.mock("@/lib/hooks/use-pass-templates", () => ({
  usePassTemplates: () => ({
    templates: [],
    loading: false,
    refetch: vi.fn(),
  }),
}));

// Mock the hooks
const mockToggleAttendance = vi.fn();

vi.mock("@/lib/hooks/use-attendance", () => ({
  useEnsureSession: () => ({
    sessionId: "session-1",
    loading: false,
    error: null,
  }),
  useAttendance: () => ({
    records: [
      {
        id: "att-1",
        session_id: "session-1",
        student_id: "student-1",
        status: "present",
        note: null,
        is_substitute: false,
        substitute_name: null,
        marked_by: "user-1",
        marked_at: "2026-02-22T17:30:00Z",
      },
    ],
    loading: false,
    error: null,
    toggleAttendance: mockToggleAttendance,
    refetch: vi.fn(),
  }),
}));

// Mock Supabase client for member loading
function makeSelectChain(data: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.not = vi.fn(() => chain);
  // Make it thenable
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) =>
    resolve({ data, error: null });
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => {
      if (table === "group_memberships") {
        return makeSelectChain([
          { id: "mem-1", student: testStudent },
          { id: "mem-2", student: testStudent2 },
        ]);
      }
      if (table === "passes") {
        return makeSelectChain([
          { id: "pass-1", student_id: "student-1", valid_until: "2026-03-01", is_active: true },
        ]);
      }
      return makeSelectChain(null);
    }),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AttendanceGrid", () => {
  it("renders group name and code", async () => {
    render(
      <AttendanceGrid
        groupId="group-1"
        groupName="Podstawa Poniedzialek"
        groupCode="PO1"
        dayOfWeek={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Podstawa Poniedzialek")).toBeInTheDocument();
      expect(screen.getByText("PO1")).toBeInTheDocument();
    });
  });

  it("renders student names after loading", async () => {
    render(
      <AttendanceGrid
        groupId="group-1"
        groupName="Podstawa Poniedzialek"
        groupCode="PO1"
        dayOfWeek={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Ola Malinowska")).toBeInTheDocument();
      expect(screen.getByText("Maja Krawczyk")).toBeInTheDocument();
    });
  });

  it("renders date navigation buttons", async () => {
    render(
      <AttendanceGrid
        groupId="group-1"
        groupName="Podstawa Poniedzialek"
        groupCode="PO1"
        dayOfWeek={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("PO1")).toBeInTheDocument();
    });

    // Should have chevron left and right for navigation
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders attendance summary bar", async () => {
    render(
      <AttendanceGrid
        groupId="group-1"
        groupName="Podstawa Poniedzialek"
        groupCode="PO1"
        dayOfWeek={1}
      />
    );

    await waitFor(() => {
      // Summary shows present count / total
      expect(screen.getByText(/Obecne: 1\/2/)).toBeInTheDocument();
    });
  });

  it("renders guest button", async () => {
    render(
      <AttendanceGrid
        groupId="group-1"
        groupName="Podstawa Poniedzialek"
        groupCode="PO1"
        dayOfWeek={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Gosc")).toBeInTheDocument();
    });
  });
});
