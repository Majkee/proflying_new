import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubstituteDialog } from "../substitute-dialog";

let mockOnClose: ReturnType<typeof vi.fn>;
let mockOnAdd: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockOnClose = vi.fn();
  mockOnAdd = vi.fn();
});

describe("SubstituteDialog", () => {
  it("renders dialog title", () => {
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    expect(screen.getByText("Dodaj goscia")).toBeInTheDocument();
  });

  it("renders name input", () => {
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    expect(screen.getByLabelText("Imie i nazwisko")).toBeInTheDocument();
  });

  it("has disabled add button when name is empty", () => {
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);
    expect(screen.getByRole("button", { name: "Dodaj" })).toBeDisabled();
  });

  it("enables add button when name is entered", async () => {
    const user = userEvent.setup();
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText("Imie i nazwisko"), "Kasia Nowak");
    expect(screen.getByRole("button", { name: "Dodaj" })).not.toBeDisabled();
  });

  it("calls onAdd with trimmed name and closes dialog", async () => {
    const user = userEvent.setup();
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText("Imie i nazwisko"), "  Kasia Nowak  ");
    await user.click(screen.getByRole("button", { name: "Dodaj" }));

    expect(mockOnAdd).toHaveBeenCalledWith("Kasia Nowak");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("submits on Enter key", async () => {
    const user = userEvent.setup();
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText("Imie i nazwisko"), "Kasia Nowak{Enter}");

    expect(mockOnAdd).toHaveBeenCalledWith("Kasia Nowak");
  });

  it("calls onClose when cancel clicked", async () => {
    const user = userEvent.setup();
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("does not call onAdd for whitespace-only input", async () => {
    const user = userEvent.setup();
    render(<SubstituteDialog open={true} onClose={mockOnClose} onAdd={mockOnAdd} />);

    await user.type(screen.getByLabelText("Imie i nazwisko"), "   ");
    await user.click(screen.getByRole("button", { name: "Dodaj" }));

    expect(mockOnAdd).not.toHaveBeenCalled();
  });
});
