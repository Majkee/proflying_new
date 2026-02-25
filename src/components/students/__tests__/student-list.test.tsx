import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudentList } from "../student-list";
import type { StudentWithPassStatus } from "@/lib/hooks/use-students";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}));

const studentWithActivePaidPass: StudentWithPassStatus = {
  student_id: "s1",
  full_name: "Ola Malinowska",
  phone: "+48 500 100 200",
  email: "ola@example.com",
  pass_id: "pass-1",
  pass_type: "custom",
  template_name: "Karnet 2x/tydzien",
  valid_from: "2026-02-01",
  valid_until: "2026-03-02",
  auto_renew: true,
  price_amount: 160,
  is_paid: true,
};

const studentWithUnpaidPass: StudentWithPassStatus = {
  student_id: "s2",
  full_name: "Maja Krawczyk",
  phone: "+48 500 300 400",
  email: null,
  pass_id: "pass-2",
  pass_type: "monthly_1x",
  template_name: null,
  valid_from: "2026-02-01",
  valid_until: "2026-03-02",
  auto_renew: false,
  price_amount: 100,
  is_paid: false,
};

const studentWithExpiredPass: StudentWithPassStatus = {
  student_id: "s3",
  full_name: "Kasia Nowak",
  phone: null,
  email: "kasia@example.com",
  pass_id: "pass-3",
  pass_type: "custom",
  template_name: "Karnet 1x/tydzien",
  valid_from: "2025-12-01",
  valid_until: "2025-12-31",
  auto_renew: false,
  price_amount: 100,
  is_paid: true,
};

const studentWithNoPass: StudentWithPassStatus = {
  student_id: "s4",
  full_name: "Anna Zielinska",
  phone: null,
  email: null,
  pass_id: null,
  pass_type: null,
  template_name: null,
  valid_from: null,
  valid_until: null,
  auto_renew: null,
  price_amount: null,
  is_paid: null,
};

describe("StudentList", () => {
  it("renders student names", () => {
    render(<StudentList students={[studentWithActivePaidPass, studentWithUnpaidPass]} />);
    expect(screen.getByText("Ola Malinowska")).toBeInTheDocument();
    expect(screen.getByText("Maja Krawczyk")).toBeInTheDocument();
  });

  it("renders phone and email", () => {
    render(<StudentList students={[studentWithActivePaidPass]} />);
    expect(screen.getByText("+48 500 100 200")).toBeInTheDocument();
    expect(screen.getByText("ola@example.com")).toBeInTheDocument();
  });

  it("shows Oplacony badge for paid pass", () => {
    render(<StudentList students={[studentWithActivePaidPass]} />);
    expect(screen.getByText("Oplacony")).toBeInTheDocument();
  });

  it("shows Nieoplacony badge for unpaid pass", () => {
    render(<StudentList students={[studentWithUnpaidPass]} />);
    expect(screen.getByText("Nieoplacony")).toBeInTheDocument();
  });

  it("shows Wygasl badge for expired pass", () => {
    render(<StudentList students={[studentWithExpiredPass]} />);
    expect(screen.getByText("Wygasl")).toBeInTheDocument();
  });

  it("shows Brak karnetu when no pass", () => {
    render(<StudentList students={[studentWithNoPass]} />);
    expect(screen.getByText("Brak karnetu")).toBeInTheDocument();
  });

  it("shows Auto badge for auto-renewing pass", () => {
    render(<StudentList students={[studentWithActivePaidPass]} />);
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("does not show Auto badge when auto_renew is false", () => {
    render(<StudentList students={[studentWithUnpaidPass]} />);
    expect(screen.queryByText("Auto")).not.toBeInTheDocument();
  });

  it("shows pass price", () => {
    render(<StudentList students={[studentWithActivePaidPass]} />);
    expect(screen.getByText("160 zl")).toBeInTheDocument();
  });

  it("shows template name as pass label", () => {
    render(<StudentList students={[studentWithActivePaidPass]} />);
    expect(screen.getByText(/Karnet 2x\/tydzien/)).toBeInTheDocument();
  });

  it("falls back to pass_type label when no template_name", () => {
    render(<StudentList students={[studentWithUnpaidPass]} />);
    expect(screen.getByText(/1x\/tydzien/)).toBeInTheDocument();
  });

  it("links to student detail page", () => {
    render(<StudentList students={[studentWithActivePaidPass]} />);
    const link = screen.getByRole("link", { name: /Ola Malinowska/ });
    expect(link).toHaveAttribute("href", "/students/s1");
  });

  it("renders empty when no students", () => {
    const { container } = render(<StudentList students={[]} />);
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });
});
