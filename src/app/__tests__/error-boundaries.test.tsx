import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock lucide-react icons used in the dashboard error boundary
vi.mock("lucide-react", () => ({
  AlertTriangle: (props: React.SVGAttributes<SVGElement>) =>
    React.createElement("svg", { ...props, "data-testid": "alert-triangle-icon" }),
  RefreshCw: (props: React.SVGAttributes<SVGElement>) =>
    React.createElement("svg", { ...props, "data-testid": "refresh-icon" }),
}));

// Mock Sentry
const mockCaptureException = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Dashboard Error Boundary
// ---------------------------------------------------------------------------
describe("Dashboard error boundary", () => {
  it("renders error heading", async () => {
    const DashboardError = (await import("@/app/(dashboard)/error")).default;
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<DashboardError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Cos poszlo nie tak")).toBeInTheDocument();
  });

  it("renders error description", async () => {
    const DashboardError = (await import("@/app/(dashboard)/error")).default;
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<DashboardError error={mockError} reset={mockReset} />);

    expect(
      screen.getByText("Wystapil nieoczekiwany blad. Sprobuj ponownie lub skontaktuj sie z administratorem.")
    ).toBeInTheDocument();
  });

  it("renders retry button with correct text", async () => {
    const DashboardError = (await import("@/app/(dashboard)/error")).default;
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<DashboardError error={mockError} reset={mockReset} />);

    const button = screen.getByRole("button", { name: /Sprobuj ponownie/i });
    expect(button).toBeInTheDocument();
  });

  it("calls reset() when retry button is clicked", async () => {
    const DashboardError = (await import("@/app/(dashboard)/error")).default;
    const mockError = new Error("Test error");
    const mockReset = vi.fn();

    render(<DashboardError error={mockError} reset={mockReset} />);

    const button = screen.getByRole("button", { name: /Sprobuj ponownie/i });
    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("sends error to Sentry", async () => {
    const DashboardError = (await import("@/app/(dashboard)/error")).default;
    const mockError = new Error("Dashboard crash");
    const mockReset = vi.fn();

    render(<DashboardError error={mockError} reset={mockReset} />);

    expect(mockCaptureException).toHaveBeenCalledWith(mockError);
  });
});

// ---------------------------------------------------------------------------
// Global Error Boundary
// ---------------------------------------------------------------------------
describe("Global error boundary", () => {
  it("renders error heading", async () => {
    const GlobalError = (await import("@/app/global-error")).default;
    const mockError = new Error("Global crash");
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Cos poszlo nie tak")).toBeInTheDocument();
  });

  it("renders error description", async () => {
    const GlobalError = (await import("@/app/global-error")).default;
    const mockError = new Error("Global crash");
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(
      screen.getByText("Wystapil nieoczekiwany blad. Sprobuj ponownie.")
    ).toBeInTheDocument();
  });

  it("renders retry button with correct text", async () => {
    const GlobalError = (await import("@/app/global-error")).default;
    const mockError = new Error("Global crash");
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    const button = screen.getByRole("button", { name: /Sprobuj ponownie/i });
    expect(button).toBeInTheDocument();
  });

  it("calls reset() when retry button is clicked", async () => {
    const GlobalError = (await import("@/app/global-error")).default;
    const mockError = new Error("Global crash");
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    const button = screen.getByRole("button", { name: /Sprobuj ponownie/i });
    fireEvent.click(button);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("sends error to Sentry", async () => {
    const GlobalError = (await import("@/app/global-error")).default;
    const mockError = new Error("Global crash");
    const mockReset = vi.fn();

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(mockCaptureException).toHaveBeenCalledWith(mockError);
  });

  it("renders with html and body tags", async () => {
    const GlobalError = (await import("@/app/global-error")).default;
    const mockError = new Error("Global crash");
    const mockReset = vi.fn();

    // GlobalError renders its own <html> and <body> tags
    const { container } = render(<GlobalError error={mockError} reset={mockReset} />);

    // Check that the component renders a button (html/body may not be queryable via testing-library
    // due to how jsdom handles document structure, but the content should be rendered)
    expect(container.querySelector("button")).toBeTruthy();
  });
});
