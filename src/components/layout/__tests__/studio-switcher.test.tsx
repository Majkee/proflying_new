import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioSwitcher } from "../studio-switcher";
import { testStudio, testStudio2, testInstructorProfile } from "@/__tests__/mocks/fixtures";

let mockStudioContext: Record<string, unknown>;

vi.mock("@/lib/hooks/use-studio", () => ({
  useStudio: () => mockStudioContext,
}));

describe("StudioSwitcher", () => {
  it("shows static name for single studio", () => {
    mockStudioContext = {
      activeStudio: testStudio,
      studios: [testStudio],
      loading: false,
      switchStudio: vi.fn(),
    };

    render(<StudioSwitcher />);
    expect(screen.getByText("ProFlying Mokotow")).toBeInTheDocument();
  });

  it("shows dropdown trigger for multiple studios", () => {
    mockStudioContext = {
      activeStudio: testStudio,
      studios: [testStudio, testStudio2],
      loading: false,
      switchStudio: vi.fn(),
    };

    render(<StudioSwitcher />);
    expect(screen.getByText("ProFlying Mokotow")).toBeInTheDocument();
  });

  it("shows 'Brak studia' when no active studio and single studio list", () => {
    mockStudioContext = {
      activeStudio: null,
      studios: [],
      loading: false,
      switchStudio: vi.fn(),
    };

    render(<StudioSwitcher />);
    expect(screen.getByText("Brak studia")).toBeInTheDocument();
  });

  it("shows 'Wybierz studio' when no active studio in dropdown mode", () => {
    mockStudioContext = {
      activeStudio: null,
      studios: [testStudio, testStudio2],
      loading: false,
      switchStudio: vi.fn(),
    };

    render(<StudioSwitcher />);
    expect(screen.getByText("Wybierz studio")).toBeInTheDocument();
  });
});
