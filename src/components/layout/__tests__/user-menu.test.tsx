import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "../user-menu";

let mockSignOut: ReturnType<typeof vi.fn>;
let mockProfile: { id: string; full_name: string; role: string } | null;

vi.mock("@/lib/hooks/use-user", () => ({
  useUser: () => ({
    profile: mockProfile,
    signOut: mockSignOut,
    loading: false,
  }),
}));

beforeEach(() => {
  mockSignOut = vi.fn();
  mockProfile = { id: "user-1", full_name: "Anna Kowalska", role: "super_admin" };
});

describe("UserMenu", () => {
  it("renders avatar with initials", () => {
    render(<UserMenu />);
    expect(screen.getByText("AK")).toBeInTheDocument();
  });

  it("shows user name in dropdown", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByText("AK"));

    await waitFor(() => {
      expect(screen.getByText("Anna Kowalska")).toBeInTheDocument();
    });
  });

  it("shows role label in dropdown", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByText("AK"));

    await waitFor(() => {
      expect(screen.getByText("Administrator")).toBeInTheDocument();
    });
  });

  it("shows Manager label for manager role", async () => {
    mockProfile = { id: "user-1", full_name: "Kat W", role: "manager" };
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByText("KW"));

    await waitFor(() => {
      expect(screen.getByText("Manager")).toBeInTheDocument();
    });
  });

  it("shows Instruktor label for instructor role", async () => {
    mockProfile = { id: "user-1", full_name: "Maria Nowak", role: "instructor" };
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByText("MN"));

    await waitFor(() => {
      expect(screen.getByText("Instruktor")).toBeInTheDocument();
    });
  });

  it("calls signOut when logout clicked", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByText("AK"));

    await waitFor(() => {
      expect(screen.getByText("Wyloguj sie")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Wyloguj sie"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("shows fallback when no profile", () => {
    mockProfile = null;
    render(<UserMenu />);
    // Should not crash, renders fallback icon
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
