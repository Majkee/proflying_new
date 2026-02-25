import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PassForm } from "../pass-form";
import { testStudio, testPass, testPassTemplate, testPassTemplate2 } from "@/__tests__/mocks/fixtures";

const mockOnSuccess = vi.fn();
const mockOnCancel = vi.fn();

let mockInsertFn: ReturnType<typeof vi.fn>;
let mockUpdateFn: ReturnType<typeof vi.fn>;
let mockInsertResult: { data: unknown; error: unknown };

function makeInsertChain() {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(mockInsertResult));
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => ({
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
    })),
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

vi.mock("@/lib/hooks/use-pass-templates", () => ({
  usePassTemplates: () => ({
    templates: [testPassTemplate, testPassTemplate2],
    loading: false,
    refetch: vi.fn(),
  }),
}));

beforeEach(() => {
  mockInsertFn = vi.fn();
  mockUpdateFn = vi.fn();
  mockInsertResult = { data: { id: "new-pass" }, error: null };
  mockOnSuccess.mockClear();
  mockOnCancel.mockClear();
});

describe("PassForm", () => {
  it("renders 'Nowy karnet' title for new pass", () => {
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    expect(screen.getByText("Nowy karnet")).toBeInTheDocument();
  });

  it("renders 'Odnow karnet' title when renewing", () => {
    render(
      <PassForm
        studentId="student-1"
        previousPass={testPass}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText("Odnow karnet")).toBeInTheDocument();
  });

  it("shows template dropdown with templates", () => {
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    expect(screen.getByText("Typ karnetu")).toBeInTheDocument();
    expect(screen.getByText(/Wybierz typ karnetu/)).toBeInTheDocument();
  });

  it("has price and entries inputs", () => {
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    expect(screen.getByText("Cena (zl)")).toBeInTheDocument();
    expect(screen.getByText("Liczba wejsc")).toBeInTheDocument();
  });

  it("has date range inputs", () => {
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    expect(screen.getByText("Od")).toBeInTheDocument();
    expect(screen.getByText("Do")).toBeInTheDocument();
  });

  it("has auto-renew checkbox", () => {
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    expect(screen.getByText("Automatyczne odnawianie karnetu")).toBeInTheDocument();
  });

  it("pre-fills price from previous pass when renewing", () => {
    render(
      <PassForm
        studentId="student-1"
        previousPass={testPass}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByDisplayValue("160")).toBeInTheDocument();
  });

  it("sets valid_from to day after previous pass when renewing", () => {
    render(
      <PassForm
        studentId="student-1"
        previousPass={testPass}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    // testPass.valid_until = "2026-03-02", so valid_from should be "2026-03-03"
    expect(screen.getByDisplayValue("2026-03-03")).toBeInTheDocument();
  });

  it("pre-fills entries_total from previous pass", () => {
    render(
      <PassForm
        studentId="student-1"
        previousPass={testPass}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button clicked", async () => {
    const user = userEvent.setup();
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("submits and inserts new pass", async () => {
    const user = userEvent.setup();
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole("button", { name: /Zapisz karnet/ }));

    await waitFor(() => {
      expect(mockInsertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          studio_id: "studio-1",
          student_id: "student-1",
          pass_type: "custom",
        })
      );
    });
  });

  it("deactivates previous pass when renewing", async () => {
    const user = userEvent.setup();
    render(
      <PassForm
        studentId="student-1"
        previousPass={testPass}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: /Zapisz karnet/ }));

    await waitFor(() => {
      expect(mockUpdateFn).toHaveBeenCalledWith({ is_active: false });
    });
  });

  it("calls onSuccess with new pass ID after successful submit", async () => {
    const user = userEvent.setup();
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );

    await user.click(screen.getByRole("button", { name: /Zapisz karnet/ }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith("new-pass");
    });
  });

  it("has notes textarea", () => {
    render(
      <PassForm studentId="student-1" onSuccess={mockOnSuccess} onCancel={mockOnCancel} />
    );
    expect(screen.getByText("Notatki")).toBeInTheDocument();
  });
});
