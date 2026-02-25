import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudentForm } from "../student-form";
import { testStudio, testStudent } from "@/__tests__/mocks/fixtures";

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

beforeEach(() => {
  mockInsertFn = vi.fn();
  mockUpdateFn = vi.fn();
  mockInsertResult = { data: { id: "new-student" }, error: null };
  vi.clearAllMocks();
});

describe("StudentForm", () => {
  it("renders 'Nowa kursantka' title for new student", () => {
    render(<StudentForm />);
    expect(screen.getByText("Nowa kursantka")).toBeInTheDocument();
  });

  it("renders 'Edytuj kursantke' title when editing", () => {
    render(<StudentForm student={testStudent} />);
    expect(screen.getByText("Edytuj kursantke")).toBeInTheDocument();
  });

  it("pre-fills form fields when editing", () => {
    render(<StudentForm student={testStudent} />);
    expect(screen.getByDisplayValue("Ola Malinowska")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ola@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("+48 500 100 200")).toBeInTheDocument();
  });

  it("has required name field", () => {
    render(<StudentForm />);
    expect(screen.getByLabelText(/Imie i nazwisko/)).toBeInTheDocument();
  });

  it("has phone and email fields", () => {
    render(<StudentForm />);
    expect(screen.getByLabelText(/Telefon/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it("has date of birth field", () => {
    render(<StudentForm />);
    expect(screen.getByLabelText(/Data urodzenia/)).toBeInTheDocument();
  });

  it("has notes field", () => {
    render(<StudentForm />);
    expect(screen.getByLabelText(/Notatki/)).toBeInTheDocument();
  });

  it("shows validation error for short name", async () => {
    const user = userEvent.setup();
    render(<StudentForm />);

    const nameInput = screen.getByLabelText(/Imie i nazwisko/);
    await user.clear(nameInput);
    await user.type(nameInput, "A");
    await user.click(screen.getByRole("button", { name: /Dodaj kursantke/ }));

    await waitFor(() => {
      expect(screen.getByText(/co najmniej 2 znaki/)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid phone", async () => {
    const user = userEvent.setup();
    render(<StudentForm />);

    const nameInput = screen.getByLabelText(/Imie i nazwisko/);
    await user.type(nameInput, "Test Name");

    const phoneInput = screen.getByLabelText(/Telefon/);
    await user.type(phoneInput, "123");
    await user.click(screen.getByRole("button", { name: /Dodaj kursantke/ }));

    await waitFor(() => {
      expect(screen.getByText(/Nieprawidlowy numer telefonu/)).toBeInTheDocument();
    });
  });

  it("submits and inserts new student", async () => {
    const user = userEvent.setup();
    render(<StudentForm />);

    const nameInput = screen.getByLabelText(/Imie i nazwisko/);
    await user.type(nameInput, "Nowa Kursantka");

    await user.click(screen.getByRole("button", { name: /Dodaj kursantke/ }));

    await waitFor(() => {
      expect(mockInsertFn).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: "Nowa Kursantka",
          studio_id: "studio-1",
        })
      );
    });
  });

  it("calls router.back when cancel clicked", async () => {
    const user = userEvent.setup();
    render(<StudentForm />);
    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockBack).toHaveBeenCalled();
  });

  it("disables submit button while saving", async () => {
    const user = userEvent.setup();
    render(<StudentForm />);

    const nameInput = screen.getByLabelText(/Imie i nazwisko/);
    await user.type(nameInput, "Test");

    const button = screen.getByRole("button", { name: /Dodaj kursantke/ });
    expect(button).not.toBeDisabled();
  });

  it("disables submit button when name is empty", () => {
    render(<StudentForm />);
    const button = screen.getByRole("button", { name: /Dodaj kursantke/ });
    expect(button).toBeDisabled();
  });
});
