import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupRoster } from "../group-roster";
import { testStudio, testStudent, testStudent2 } from "@/__tests__/mocks/fixtures";

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

let mockInsertFn: ReturnType<typeof vi.fn>;
let mockUpdateEqFn: ReturnType<typeof vi.fn>;
let membersData: unknown[];
let studentsData: unknown[];

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => {
      if (table === "group_memberships") {
        const chain: Record<string, unknown> = {};
        chain.select = vi.fn(() => chain);
        chain.eq = vi.fn(() => chain);
        chain.insert = (...args: unknown[]) => { mockInsertFn(...args); return Promise.resolve({ data: null, error: null }); };
        chain.upsert = (...args: unknown[]) => { mockInsertFn(...args); return Promise.resolve({ data: null, error: null }); };
        chain.update = vi.fn(() => ({
          eq: mockUpdateEqFn,
        }));
        chain.then = (resolve: (v: unknown) => void) => resolve({ data: membersData, error: null });
        return chain;
      }
      if (table === "students") {
        const chain: Record<string, unknown> = {};
        chain.select = vi.fn(() => chain);
        chain.eq = vi.fn(() => chain);
        chain.order = vi.fn(() => chain);
        chain.then = (resolve: (v: unknown) => void) => resolve({ data: studentsData, error: null });
        return chain;
      }
      return {
        select: vi.fn(() => ({ eq: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ data: null, error: null }) })) })),
      };
    }),
  }),
}));

beforeEach(() => {
  mockInsertFn = vi.fn();
  mockUpdateEqFn = vi.fn().mockResolvedValue({ data: null, error: null });
  membersData = [
    { id: "mem-1", student_id: "student-1", student: testStudent },
    { id: "mem-2", student_id: "student-2", student: testStudent2 },
  ];
  studentsData = [testStudent, testStudent2, { ...testStudent, id: "student-3", full_name: "Kasia Nowak" }];
  vi.clearAllMocks();
});

describe("GroupRoster", () => {
  it("renders member count in title", async () => {
    render(<GroupRoster groupId="group-1" />);
    await waitFor(() => {
      expect(screen.getByText("Kursantki (2)")).toBeInTheDocument();
    });
  });

  it("renders member names", async () => {
    render(<GroupRoster groupId="group-1" />);
    await waitFor(() => {
      expect(screen.getByText("Ola Malinowska")).toBeInTheDocument();
      expect(screen.getByText("Maja Krawczyk")).toBeInTheDocument();
    });
  });

  it("renders member phone numbers", async () => {
    render(<GroupRoster groupId="group-1" />);
    await waitFor(() => {
      expect(screen.getByText("+48 500 100 200")).toBeInTheDocument();
      expect(screen.getByText("+48 500 300 400")).toBeInTheDocument();
    });
  });

  it("renders add button", async () => {
    render(<GroupRoster groupId="group-1" />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Dodaj/ })).toBeInTheDocument();
    });
  });

  it("renders remove buttons for each member", async () => {
    render(<GroupRoster groupId="group-1" />);
    await waitFor(() => {
      expect(screen.getByText("Ola Malinowska")).toBeInTheDocument();
    });
    // One remove button per member
    const removeButtons = screen.getAllByRole("button").filter(
      (btn) => btn.classList.contains("hover:text-destructive") || btn.querySelector("svg")
    );
    expect(removeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("shows empty state when no members", async () => {
    membersData = [];
    render(<GroupRoster groupId="group-1" />);
    await waitFor(() => {
      expect(screen.getByText("Brak kursantek w tej grupie")).toBeInTheDocument();
    });
  });

  it("opens add dialog when add button clicked", async () => {
    const user = userEvent.setup();
    render(<GroupRoster groupId="group-1" />);

    await waitFor(() => {
      expect(screen.getByText("Ola Malinowska")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Dodaj/ }));

    await waitFor(() => {
      expect(screen.getByText("Dodaj kursantke do grupy")).toBeInTheDocument();
    });
  });
});
