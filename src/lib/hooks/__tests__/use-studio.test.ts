import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { testStudio, testStudio2, testProfile, testInstructorProfile } from "@/__tests__/mocks/fixtures";

let mockStudiosData: unknown;
let mockMembersData: unknown;
let mockEqFns: Array<[string, unknown]>;
let mockInFn: ReturnType<typeof vi.fn>;
let mockOrderFn: ReturnType<typeof vi.fn>;

function makeChain(table: string) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = (...args: unknown[]) => { mockEqFns.push(args as [string, unknown]); return chain; };
  chain.in = (...args: unknown[]) => { mockInFn(...args); return chain; };
  chain.order = (...args: unknown[]) => { mockOrderFn(...args); return chain; };
  chain.then = (resolve: (v: unknown) => void) => {
    if (table === "studios") resolve({ data: mockStudiosData, error: null });
    else if (table === "studio_members") resolve({ data: mockMembersData, error: null });
    else resolve({ data: null, error: null });
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn((table: string) => makeChain(table)),
  }),
}));

beforeEach(() => {
  mockStudiosData = [testStudio, testStudio2];
  mockMembersData = [{ studio_id: "studio-1" }];
  mockEqFns = [];
  mockInFn = vi.fn();
  mockOrderFn = vi.fn();
  localStorage.clear();
  vi.clearAllMocks();
});

describe("useStudioProvider", () => {
  it("sets loading=false and empty studios when no profile", async () => {
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.studios).toEqual([]);
  });

  it("super_admin fetches all studios", async () => {
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(testProfile));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.studios).toHaveLength(2);
  });

  it("non-super_admin fetches via studio_members", async () => {
    mockStudiosData = [testStudio];
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(testInstructorProfile));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockInFn).toHaveBeenCalled();
  });

  it("non-super_admin with no memberships gets empty studios", async () => {
    mockMembersData = [];
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(testInstructorProfile));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.studios).toEqual([]);
  });

  it("restores active studio from localStorage", async () => {
    localStorage.setItem("proflying_active_studio", "studio-2");
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(testProfile));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeStudio?.id).toBe("studio-2");
  });

  it("falls back to default_studio_id when no localStorage", async () => {
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(testProfile));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeStudio?.id).toBe("studio-1");
  });

  it("auto-selects single studio", async () => {
    mockStudiosData = [testStudio];
    const profileNoDefault = { ...testInstructorProfile, default_studio_id: null };
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(profileNoDefault));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeStudio?.id).toBe("studio-1");
  });

  it("switchStudio sets active and saves to localStorage", async () => {
    const { useStudioProvider } = await import("../use-studio");
    const { result } = renderHook(() => useStudioProvider(testProfile));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.switchStudio("studio-2");
    });

    expect(result.current.activeStudio?.id).toBe("studio-2");
    expect(localStorage.setItem).toHaveBeenCalledWith("proflying_active_studio", "studio-2");
  });

});

describe("useStudio", () => {
  it("returns context value", async () => {
    const { useStudio, StudioContext } = await import("../use-studio");
    const React = await import("react");
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(StudioContext.Provider, {
        value: {
          activeStudio: testStudio,
          studios: [testStudio],
          loading: false,
          switchStudio: vi.fn(),
        },
      }, children);

    const { result } = renderHook(() => useStudio(), { wrapper });
    expect(result.current.activeStudio).toEqual(testStudio);
    expect(result.current.studios).toHaveLength(1);
  });
});
