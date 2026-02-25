import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { testProfile } from "@/__tests__/mocks/fixtures";

let mockAuthGetUser: ReturnType<typeof vi.fn>;
let mockAuthSignOut: ReturnType<typeof vi.fn>;
let mockAuthOnChange: ReturnType<typeof vi.fn>;
let mockUnsubscribe: ReturnType<typeof vi.fn>;
let mockProfileData: unknown;
let mockProfileError: unknown;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: (...args: unknown[]) => mockAuthGetUser(...args),
      signOut: (...args: unknown[]) => mockAuthSignOut(...args),
      onAuthStateChange: (...args: unknown[]) => mockAuthOnChange(...args),
    },
    from: vi.fn(() => {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        single: vi.fn(() => chain),
        then: (resolve: (v: unknown) => void) => resolve({ data: mockProfileData, error: mockProfileError }),
      };
      return chain;
    }),
  }),
}));

vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  mockUnsubscribe = vi.fn();
  mockAuthGetUser = vi.fn().mockResolvedValue({ data: { user: { id: "user-1", email: "anna@test.com" } }, error: null });
  mockAuthSignOut = vi.fn().mockResolvedValue({ error: null });
  mockAuthOnChange = vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  mockProfileData = testProfile;
  mockProfileError = null;

  // Mock window.location
  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
  });
});

describe("useUser", () => {
  it("loads user and profile on mount", async () => {
    const { useUser } = await import("../use-user");
    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual({ id: "user-1", email: "anna@test.com" });
    expect(result.current.profile).toEqual(testProfile);
  });

  it("sets loading to false after load", async () => {
    const { useUser } = await import("../use-user");
    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("handles null user (not authenticated)", async () => {
    mockAuthGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
    const { useUser } = await import("../use-user");
    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it("handles auth error gracefully", async () => {
    mockAuthGetUser = vi.fn().mockRejectedValue(new Error("Auth failed"));
    const { useUser } = await import("../use-user");
    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("subscribes to auth state changes", async () => {
    const { useUser } = await import("../use-user");
    renderHook(() => useUser());
    await waitFor(() => {
      expect(mockAuthOnChange).toHaveBeenCalled();
    });
  });

  it("unsubscribes on unmount", async () => {
    const { useUser } = await import("../use-user");
    const { unmount } = renderHook(() => useUser());
    await waitFor(() => expect(mockAuthOnChange).toHaveBeenCalled());
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("signOut clears state and redirects", async () => {
    const { useUser } = await import("../use-user");
    const { result } = renderHook(() => useUser());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockAuthSignOut).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });
});
