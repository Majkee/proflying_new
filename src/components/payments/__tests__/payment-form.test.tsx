import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentForm } from "../payment-form";
import { testStudio, testStudent, testPass } from "@/__tests__/mocks/fixtures";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

let mockInsertFn: ReturnType<typeof vi.fn>;
let mockInsertResult: { data: unknown; error: unknown };

function makeChain(data: unknown = null) {
  let singleMode = false;
  const chain: Record<string, unknown> = {};
  chain.eq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.ilike = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(() => { singleMode = true; return chain; });
  chain.maybeSingle = vi.fn(() => { singleMode = true; return chain; });
  chain.insert = vi.fn((...args: unknown[]) => {
    mockInsertFn(...args);
    return chain;
  });
  // Make it thenable
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) => {
    const result = singleMode && Array.isArray(data) ? data[0] : data;
    resolve({ data: result, error: null });
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => {
      if (table === "students") {
        return makeChain([testStudent]);
      }
      if (table === "passes") {
        return makeChain([{ ...testPass, template: { id: "tmpl-1", name: "Karnet 2x/tydzien" } }]);
      }
      if (table === "payments") {
        return {
          insert: (...args: unknown[]) => {
            mockInsertFn(...args);
            return Promise.resolve(mockInsertResult);
          },
        };
      }
      return makeChain(null);
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

vi.mock("@/lib/hooks/use-user", () => ({
  useUser: () => ({
    profile: { id: "user-1", role: "super_admin" },
    loading: false,
  }),
}));

beforeEach(() => {
  mockInsertFn = vi.fn();
  mockInsertResult = { data: { id: "new-payment" }, error: null };
  vi.clearAllMocks();
});

describe("PaymentForm", () => {
  it("renders form title", () => {
    render(<PaymentForm />);
    expect(screen.getByRole("heading", { name: "Zapisz platnosc" })).toBeInTheDocument();
  });

  it("has student search field when no student preselected", () => {
    render(<PaymentForm />);
    expect(screen.getByText("Kursantka *")).toBeInTheDocument();
  });

  it("shows preselected student name", async () => {
    render(<PaymentForm preselectedStudentId="student-1" />);
    await waitFor(() => {
      expect(screen.getByText("Ola Malinowska")).toBeInTheDocument();
    });
  });

  it("has amount field", async () => {
    render(<PaymentForm preselectedStudentId="student-1" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Kwota/)).toBeInTheDocument();
    });
  });

  it("has payment method selector", async () => {
    render(<PaymentForm preselectedStudentId="student-1" />);
    await waitFor(() => {
      expect(screen.getByText("Metoda platnosci")).toBeInTheDocument();
    });
  });

  it("has notes field", async () => {
    render(<PaymentForm preselectedStudentId="student-1" />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Notatki/)).toBeInTheDocument();
    });
  });

  it("calls router.back when cancel clicked", async () => {
    const user = userEvent.setup();
    render(<PaymentForm />);
    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockBack).toHaveBeenCalled();
  });

  it("disables submit when no student or amount", () => {
    render(<PaymentForm />);
    const button = screen.getByRole("button", { name: /Zapisz platnosc/ });
    expect(button).toBeDisabled();
  });
});
