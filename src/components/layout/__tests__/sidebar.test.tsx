import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../sidebar";

let mockUserRole: string | undefined;

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, className }: { children: React.ReactNode; href: string; onClick?: () => void; className?: string }) =>
    <a href={href} onClick={onClick} className={className}>{children}</a>,
}));

vi.mock("@/lib/hooks/use-user", () => ({
  useUser: () => ({
    profile: mockUserRole ? { id: "user-1", full_name: "Test", role: mockUserRole } : null,
    loading: false,
  }),
}));

beforeEach(() => {
  mockUserRole = "super_admin";
});

describe("Sidebar", () => {
  it("renders ProFlying brand", () => {
    render(<Sidebar open={true} />);
    expect(screen.getByText("ProFlying")).toBeInTheDocument();
    expect(screen.getByText("PF")).toBeInTheDocument();
  });

  it("renders all nav items for super_admin", () => {
    render(<Sidebar open={true} />);
    expect(screen.getByText("Pulpit")).toBeInTheDocument();
    expect(screen.getByText("Obecnosc")).toBeInTheDocument();
    expect(screen.getByText("Grafik")).toBeInTheDocument();
    expect(screen.getByText("Kursantki")).toBeInTheDocument();
    expect(screen.getByText("Grupy")).toBeInTheDocument();
    expect(screen.getByText("Platnosci")).toBeInTheDocument();
    expect(screen.getByText("Ustawienia")).toBeInTheDocument();
  });

  it("hides Ustawienia for manager", () => {
    mockUserRole = "manager";
    render(<Sidebar open={true} />);
    expect(screen.getByText("Platnosci")).toBeInTheDocument();
    expect(screen.queryByText("Ustawienia")).not.toBeInTheDocument();
  });

  it("only shows Kalendarz and Obecnosc for instructor", () => {
    mockUserRole = "instructor";
    render(<Sidebar open={true} />);
    expect(screen.getByText("Kalendarz")).toBeInTheDocument();
    expect(screen.getByText("Obecnosc")).toBeInTheDocument();
    expect(screen.queryByText("Pulpit")).not.toBeInTheDocument();
    expect(screen.queryByText("Grafik")).not.toBeInTheDocument();
    expect(screen.queryByText("Kursantki")).not.toBeInTheDocument();
    expect(screen.queryByText("Grupy")).not.toBeInTheDocument();
    expect(screen.queryByText("Platnosci")).not.toBeInTheDocument();
    expect(screen.queryByText("Ustawienia")).not.toBeInTheDocument();
  });

  it("shows common items for manager", () => {
    mockUserRole = "manager";
    render(<Sidebar open={true} />);
    expect(screen.getByText("Pulpit")).toBeInTheDocument();
    expect(screen.getByText("Obecnosc")).toBeInTheDocument();
    expect(screen.getByText("Kalendarz")).toBeInTheDocument();
    expect(screen.getByText("Grafik")).toBeInTheDocument();
    expect(screen.getByText("Kursantki")).toBeInTheDocument();
    expect(screen.getByText("Grupy")).toBeInTheDocument();
  });

  it("highlights active nav item", () => {
    render(<Sidebar open={true} />);
    const pulpitLink = screen.getByText("Pulpit").closest("a");
    expect(pulpitLink?.className).toContain("text-primary");
  });

  it("links logo to /dashboard for super_admin", () => {
    render(<Sidebar open={true} />);
    const link = screen.getByText("ProFlying").closest("a");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("links logo to /attendance for instructor", () => {
    mockUserRole = "instructor";
    render(<Sidebar open={true} />);
    const link = screen.getByText("ProFlying").closest("a");
    expect(link).toHaveAttribute("href", "/attendance");
  });
});
