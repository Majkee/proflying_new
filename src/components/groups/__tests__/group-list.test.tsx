import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupList } from "../group-list";
import { testGroup, testInstructor } from "@/__tests__/mocks/fixtures";
import type { Group } from "@/lib/types/database";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}));

let mockFromFn: ReturnType<typeof vi.fn>;
let mockUpdateFn: ReturnType<typeof vi.fn>;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: (...args: unknown[]) => mockFromFn(...args),
  }),
}));

const mondayGroup: Group = {
  ...testGroup,
  id: "group-1",
  code: "PO1",
  name: "Podstawa Poniedzialek",
  day_of_week: 1,
  member_count: 5,
  instructor: testInstructor,
};

const wednesdayGroup: Group = {
  ...testGroup,
  id: "group-2",
  code: "SR1",
  name: "Sredni Sroda",
  day_of_week: 3,
  member_count: 8,
  instructor: testInstructor,
};

beforeEach(() => {
  mockUpdateFn = vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  }));

  const makeSelectChain = (data: unknown) => {
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.gt = vi.fn(() => chain);
    chain.then = (resolve: (v: unknown) => void) => resolve({ data, error: null, count: 3 });
    return chain;
  };

  mockFromFn = vi.fn((table: string) => {
    if (table === "group_memberships") return makeSelectChain(null);
    if (table === "class_sessions") return makeSelectChain(null);
    return {
      update: mockUpdateFn,
      ...makeSelectChain(null),
    };
  });
});

describe("GroupList", () => {
  it("renders group names", () => {
    render(<GroupList groups={[mondayGroup, wednesdayGroup]} />);
    expect(screen.getByText("Podstawa Poniedzialek")).toBeInTheDocument();
    expect(screen.getByText("Sredni Sroda")).toBeInTheDocument();
  });

  it("renders group codes as badges", () => {
    render(<GroupList groups={[mondayGroup]} />);
    expect(screen.getByText("PO1")).toBeInTheDocument();
  });

  it("renders member count and capacity", () => {
    render(<GroupList groups={[mondayGroup]} />);
    expect(screen.getByText("5/10")).toBeInTheDocument();
  });

  it("renders instructor name", () => {
    render(<GroupList groups={[mondayGroup]} />);
    expect(screen.getByText("Maria Nowak")).toBeInTheDocument();
  });

  it("groups by day of week with day labels", () => {
    render(<GroupList groups={[mondayGroup, wednesdayGroup]} showDay={true} />);
    expect(screen.getByText("Poniedzialek")).toBeInTheDocument();
    expect(screen.getByText("Sroda")).toBeInTheDocument();
  });

  it("hides day labels when showDay is false", () => {
    render(<GroupList groups={[mondayGroup]} showDay={false} />);
    expect(screen.queryByText("Poniedzialek")).not.toBeInTheDocument();
  });

  it("links to group detail page", () => {
    render(<GroupList groups={[mondayGroup]} />);
    const link = screen.getByRole("link", { name: /Podstawa Poniedzialek/i });
    expect(link).toHaveAttribute("href", "/groups/group-1");
  });

  it("shows deactivation button with trash icon", () => {
    render(<GroupList groups={[mondayGroup]} />);
    const button = screen.getByTitle("Dezaktywuj grupe");
    expect(button).toBeInTheDocument();
  });

  it("opens confirmation dialog on deactivate click", async () => {
    const user = userEvent.setup();
    render(<GroupList groups={[mondayGroup]} />);

    await user.click(screen.getByTitle("Dezaktywuj grupe"));

    await waitFor(() => {
      expect(screen.getByText("Dezaktywuj grupe")).toBeInTheDocument();
      expect(screen.getByText(/PO1 — Podstawa Poniedzialek/)).toBeInTheDocument();
    });
  });

  it("shows cancel and confirm buttons in dialog", async () => {
    const user = userEvent.setup();
    render(<GroupList groups={[mondayGroup]} />);

    await user.click(screen.getByTitle("Dezaktywuj grupe"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Dezaktywuj/ })).toBeInTheDocument();
    });
  });

  it("renders empty when no groups", () => {
    const { container } = render(<GroupList groups={[]} />);
    expect(container.querySelector("[class*=space-y]")).toBeInTheDocument();
  });
});
