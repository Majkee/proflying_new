import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickPaymentDialog } from "../quick-payment-dialog";
import { testStudio, testPass, testPassTemplate } from "@/__tests__/mocks/fixtures";

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
    profile: { id: "user-1", role: "manager" },
    loading: false,
  }),
}));

let mockInsertFn: ReturnType<typeof vi.fn>;
let passesData: unknown[];

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => {
      if (table === "passes") {
        const chain: Record<string, unknown> = {};
        chain.select = vi.fn(() => chain);
        chain.eq = vi.fn(() => chain);
        chain.order = vi.fn(() => chain);
        chain.then = (resolve: (v: unknown) => void) => resolve({ data: passesData, error: null });
        return chain;
      }
      if (table === "payments") {
        return {
          insert: (...args: unknown[]) => {
            mockInsertFn(...args);
            return Promise.resolve({ data: { id: "pay-new" }, error: null });
          },
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            then: (r: (v: unknown) => void) => r({ data: null, error: null }),
          })),
        })),
      };
    }),
  }),
}));

let mockOnClose: ReturnType<typeof vi.fn>;
let mockOnSuccess: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockInsertFn = vi.fn();
  mockOnClose = vi.fn();
  mockOnSuccess = vi.fn();
  passesData = [
    { ...testPass, template: { id: testPassTemplate.id, name: testPassTemplate.name } },
  ];
  vi.clearAllMocks();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("QuickPaymentDialog", () => {
  it("renders dialog title with student name", async () => {
    render(
      <QuickPaymentDialog open={true} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );
    expect(screen.getByText("Platnosc - Ola")).toBeInTheDocument();
  });

  it("auto-selects pass and pre-fills amount when single pass", async () => {
    render(
      <QuickPaymentDialog open={true} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("160")).toBeInTheDocument();
    });
  });

  it("shows payment method buttons", async () => {
    render(
      <QuickPaymentDialog open={true} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Gotowka" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Przelew" })).toBeInTheDocument();
    });
  });

  it("shows empty state when no active passes", async () => {
    passesData = [];
    render(
      <QuickPaymentDialog open={true} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByText("Brak aktywnego karnetu")).toBeInTheDocument();
    });
  });

  it("calls onClose when cancel clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <QuickPaymentDialog open={true} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("has save and cancel buttons", async () => {
    render(
      <QuickPaymentDialog open={true} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Zapisz" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Anuluj" })).toBeInTheDocument();
    });
  });

  it("renders nothing visible when not open", () => {
    const { container } = render(
      <QuickPaymentDialog open={false} onClose={mockOnClose} studentId="student-1" studentName="Ola" onSuccess={mockOnSuccess} />
    );
    expect(container.querySelector("[role='dialog']")).not.toBeInTheDocument();
  });
});
