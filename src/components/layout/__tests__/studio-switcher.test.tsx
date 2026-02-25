import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudioSwitcher } from "../studio-switcher";
import { testStudio, testStudio2, testProfile, testInstructorProfile } from "@/__tests__/mocks/fixtures";

let mockStudioContext: Record<string, unknown>;
let mockProfile: Record<string, unknown> | null;

vi.mock("@/lib/hooks/use-studio", () => ({
  useStudio: () => mockStudioContext,
}));

vi.mock("@/lib/hooks/use-user", () => ({
  useUser: () => ({
    user: { id: "user-1" },
    profile: mockProfile,
    loading: false,
    signOut: vi.fn(),
  }),
}));

describe("StudioSwitcher", () => {
  it("shows static name for single studio (non-admin)", () => {
    mockStudioContext = {
      activeStudio: testStudio,
      studios: [testStudio],
      loading: false,
      switchStudio: vi.fn(),
      isAllStudios: false,
      setAllStudios: vi.fn(),
    };
    mockProfile = testInstructorProfile;

    render(<StudioSwitcher />);
    expect(screen.getByText("ProFlying Mokotow")).toBeInTheDocument();
  });

  it("shows dropdown trigger for multiple studios", () => {
    mockStudioContext = {
      activeStudio: testStudio,
      studios: [testStudio, testStudio2],
      loading: false,
      switchStudio: vi.fn(),
      isAllStudios: false,
      setAllStudios: vi.fn(),
    };
    mockProfile = testProfile;

    render(<StudioSwitcher />);
    // Should show the active studio name in the trigger
    expect(screen.getByText("ProFlying Mokotow")).toBeInTheDocument();
  });

  it("shows 'Wszystkie studia' text when isAllStudios is true", () => {
    mockStudioContext = {
      activeStudio: null,
      studios: [testStudio, testStudio2],
      loading: false,
      switchStudio: vi.fn(),
      isAllStudios: true,
      setAllStudios: vi.fn(),
    };
    mockProfile = testProfile;

    render(<StudioSwitcher />);
    expect(screen.getByText("Wszystkie studia")).toBeInTheDocument();
  });

  it("shows 'Brak studia' when no active studio and single studio list for non-admin", () => {
    mockStudioContext = {
      activeStudio: null,
      studios: [],
      loading: false,
      switchStudio: vi.fn(),
      isAllStudios: false,
      setAllStudios: vi.fn(),
    };
    mockProfile = testInstructorProfile;

    render(<StudioSwitcher />);
    expect(screen.getByText("Brak studia")).toBeInTheDocument();
  });

  it("shows 'Wybierz studio' when no active studio in dropdown mode", () => {
    mockStudioContext = {
      activeStudio: null,
      studios: [testStudio, testStudio2],
      loading: false,
      switchStudio: vi.fn(),
      isAllStudios: false,
      setAllStudios: vi.fn(),
    };
    mockProfile = testProfile;

    render(<StudioSwitcher />);
    expect(screen.getByText("Wybierz studio")).toBeInTheDocument();
  });
});
