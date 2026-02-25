import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GroupForm } from "../group-form";
import { testStudio, testGroup, testInstructor } from "@/__tests__/mocks/fixtures";

const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack, refresh: mockRefresh }),
}));

let mockInsertFn: ReturnType<typeof vi.fn>;
let mockUpdateFn: ReturnType<typeof vi.fn>;
let mockInsertResult: { data: unknown; error: unknown };

function makeInsertChain() {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(mockInsertResult));
  return chain;
}

function makeSelectChain(data: unknown[]) {
  const chain: Record<string, unknown> = {};
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  // Make it thenable
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) =>
    resolve({ data, error: null });
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => {
      if (table === "instructors") {
        return makeSelectChain([testInstructor]);
      }
      return {
        insert: (...args: unknown[]) => {
          mockInsertFn(...args);
          return makeInsertChain();
        },
        update: (...args: unknown[]) => {
          mockUpdateFn(...args);
          const chain: Record<string, unknown> = {};
          chain.eq = vi.fn(() => Promise.resolve({ data: null, error: null }));
          return chain;
        },
      };
    }),
  }),
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

vi.mock("@/lib/hooks/use-group-levels", () => ({
  useGroupLevels: () => ({
    levels: [
      { id: "lvl-1", value: "podstawa", label: "Podstawa", color: "blue", sort_order: 1, is_active: true },
      { id: "lvl-2", value: "sredni", label: "Sredni", color: "yellow", sort_order: 2, is_active: true },
    ],
    loading: false,
    refetch: vi.fn(),
  }),
}));

beforeEach(() => {
  mockInsertFn = vi.fn();
  mockUpdateFn = vi.fn();
  mockInsertResult = { data: { id: "new-group" }, error: null };
  vi.clearAllMocks();
});

describe("GroupForm", () => {
  it("renders 'Nowa grupa' title for new group", () => {
    render(<GroupForm />);
    expect(screen.getByText("Nowa grupa")).toBeInTheDocument();
  });

  it("renders 'Edytuj grupe' title when editing", () => {
    render(<GroupForm group={testGroup} />);
    expect(screen.getByText("Edytuj grupe")).toBeInTheDocument();
  });

  it("pre-fills code and name when editing", () => {
    render(<GroupForm group={testGroup} />);
    expect(screen.getByDisplayValue("PO1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Podstawa Poniedzialek")).toBeInTheDocument();
  });

  it("has code and name fields", () => {
    render(<GroupForm />);
    expect(screen.getByLabelText(/Kod grupy/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nazwa/)).toBeInTheDocument();
  });

  it("has time fields", () => {
    render(<GroupForm />);
    expect(screen.getByLabelText(/Godzina rozpoczecia/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Godzina zakonczenia/)).toBeInTheDocument();
  });

  it("has capacity field", () => {
    render(<GroupForm />);
    expect(screen.getByLabelText(/Pojemnosc/)).toBeInTheDocument();
  });

  it("has day of week selector", () => {
    render(<GroupForm />);
    expect(screen.getByText("Dzien tygodnia")).toBeInTheDocument();
  });

  it("has level selector", () => {
    render(<GroupForm />);
    expect(screen.getByText("Poziom")).toBeInTheDocument();
  });

  it("calls router.back when cancel clicked", async () => {
    const user = userEvent.setup();
    render(<GroupForm />);
    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockBack).toHaveBeenCalled();
  });

  it("disables submit when code is empty", () => {
    render(<GroupForm />);
    const button = screen.getByRole("button", { name: /Dodaj grupe/ });
    expect(button).toBeDisabled();
  });

  it("pre-fills time fields when editing", () => {
    render(<GroupForm group={testGroup} />);
    expect(screen.getByDisplayValue("17:30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("18:30")).toBeInTheDocument();
  });

  it("pre-fills capacity when editing", () => {
    render(<GroupForm group={testGroup} />);
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
  });
});
