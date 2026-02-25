import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { StudioContext } from "../use-studio";
import { testStudio, testGroup } from "@/__tests__/mocks/fixtures";

let mockEqFns: Array<[string, unknown]>;
let mockOrderFns: Array<[string, unknown?]>;
let resolvedData: unknown;
let resolvedError: unknown;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain = {
        select: vi.fn(() => chain),
        eq: (...args: unknown[]) => { mockEqFns.push(args as [string, unknown]); return chain; },
        order: (...args: unknown[]) => { mockOrderFns.push(args as [string, unknown?]); return chain; },
        single: vi.fn(() => ({ then: (resolve: (v: unknown) => void) => resolve({ data: resolvedData, error: resolvedError }) })),
        then: (resolve: (v: unknown) => void) => resolve({ data: resolvedData, error: resolvedError }),
      };
      return chain;
    }),
  }),
}));

function createWrapper(activeStudio = testStudio) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(StudioContext.Provider, {
      value: { activeStudio, studios: [testStudio], loading: false, switchStudio: vi.fn(), isAllStudios: false, setAllStudios: vi.fn() },
    }, children);
  };
}

function createNullWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(StudioContext.Provider, {
      value: { activeStudio: null, studios: [], loading: false, switchStudio: vi.fn(), isAllStudios: false, setAllStudios: vi.fn() },
    }, children);
  };
}

const groupWithMemberships = {
  ...testGroup,
  group_memberships: [{ count: 5 }],
};

beforeEach(() => {
  mockEqFns = [];
  mockOrderFns = [];
  resolvedData = [groupWithMemberships];
  resolvedError = null;
});

describe("useGroups", () => {
  it("returns empty when no studio", async () => {
    const { useGroups } = await import("../use-groups");
    const { result } = renderHook(() => useGroups(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.groups).toEqual([]);
  });

  it("fetches groups for active studio", async () => {
    const { useGroups } = await import("../use-groups");
    const { result } = renderHook(() => useGroups(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.groups).toHaveLength(1);
  });

  it("filters by studio_id and is_active", async () => {
    const { useGroups } = await import("../use-groups");
    renderHook(() => useGroups(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "studio_id" && v === "studio-1")).toBe(true);
      expect(mockEqFns.some(([k, v]) => k === "is_active" && v === true)).toBe(true);
    });
  });

  it("orders by day_of_week and start_time", async () => {
    const { useGroups } = await import("../use-groups");
    renderHook(() => useGroups(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockOrderFns.some(([k]) => k === "day_of_week")).toBe(true);
      expect(mockOrderFns.some(([k]) => k === "start_time")).toBe(true);
    });
  });

  it("extracts member_count from group_memberships", async () => {
    const { useGroups } = await import("../use-groups");
    const { result } = renderHook(() => useGroups(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.groups[0].member_count).toBe(5);
  });

  it("filters by dayOfWeek when provided", async () => {
    const { useGroups } = await import("../use-groups");
    renderHook(() => useGroups({ dayOfWeek: 1 }), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "day_of_week" && v === 1)).toBe(true);
    });
  });

  it("filters by instructorId when provided", async () => {
    const { useGroups } = await import("../use-groups");
    renderHook(() => useGroups({ instructorId: "instr-1" }), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "instructor_id" && v === "instr-1")).toBe(true);
    });
  });

  it("provides a refetch function", async () => {
    const { useGroups } = await import("../use-groups");
    const { result } = renderHook(() => useGroups(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });

  it("exposes error state", async () => {
    const { useGroups } = await import("../use-groups");
    const { result } = renderHook(() => useGroups(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});

describe("useGroup", () => {
  it("fetches a single group by id", async () => {
    resolvedData = testGroup;
    const { useGroup } = await import("../use-groups");
    const { result } = renderHook(() => useGroup("group-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.group).toEqual(testGroup);
  });

  it("returns null when groupId is empty", async () => {
    const { useGroup } = await import("../use-groups");
    const { result } = renderHook(() => useGroup(""), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.group).toBeNull();
  });
});
