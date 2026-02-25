import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteDialog } from "../note-dialog";

let mockOnClose: ReturnType<typeof vi.fn>;
let mockOnSave: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockOnClose = vi.fn();
  mockOnSave = vi.fn();
});

describe("NoteDialog", () => {
  it("renders dialog title with student name", () => {
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);
    expect(screen.getByText("Notatka - Ola")).toBeInTheDocument();
  });

  it("renders quick note buttons", () => {
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);
    expect(screen.getByRole("button", { name: "Kontuzja" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Urlop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Choroba" })).toBeInTheDocument();
  });

  it("renders textarea for custom note", () => {
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);
    expect(screen.getByLabelText("Notatka")).toBeInTheDocument();
  });

  it("pre-fills current note", () => {
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" currentNote="Choroba" onSave={mockOnSave} />);
    expect(screen.getByDisplayValue("Choroba")).toBeInTheDocument();
  });

  it("clicking quick note sets textarea value", async () => {
    const user = userEvent.setup();
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);

    await user.click(screen.getByRole("button", { name: "Urlop" }));
    expect(screen.getByDisplayValue("Urlop")).toBeInTheDocument();
  });

  it("saves note with excused status when note is non-empty", async () => {
    const user = userEvent.setup();
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);

    await user.click(screen.getByRole("button", { name: "Kontuzja" }));
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(mockOnSave).toHaveBeenCalledWith("Kontuzja", "excused");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("saves with null status when note is empty", async () => {
    const user = userEvent.setup();
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);

    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(mockOnSave).toHaveBeenCalledWith("", null);
  });

  it("calls onClose when cancel clicked", async () => {
    const user = userEvent.setup();
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);

    await user.click(screen.getByRole("button", { name: "Anuluj" }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("allows typing a custom note", async () => {
    const user = userEvent.setup();
    render(<NoteDialog open={true} onClose={mockOnClose} studentName="Ola" onSave={mockOnSave} />);

    const textarea = screen.getByLabelText("Notatka");
    await user.type(textarea, "Custom note");
    await user.click(screen.getByRole("button", { name: "Zapisz" }));

    expect(mockOnSave).toHaveBeenCalledWith("Custom note", "excused");
  });
});
