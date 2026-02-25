import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

let mockEqFns: Array<[string, unknown]>;
let mockOrderFn: ReturnType<typeof vi.fn>;
let resolvedData: unknown;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain = {
        select: vi.fn(() => chain),
        eq: (...args: unknown[]) => { mockEqFns.push(args as [string, unknown]); return chain; },
        order: (...args: unknown[]) => { mockOrderFn(...args); return chain; },
        then: (resolve: (v: unknown) => void) => resolve({ data: resolvedData, error: null }),
      };
      return chain;
    }),
  }),
}));

const testLevels = [
  { id: "lvl-1", value: "zero", label: "Zero", color: "bg-green-100 text-green-800", sort_order: 1, is_active: true, created_at: "2025-01-01" },
  { id: "lvl-2", value: "podstawa", label: "Podstawa", color: "bg-blue-100 text-blue-800", sort_order: 2, is_active: true, created_at: "2025-01-01" },
  { id: "lvl-3", value: "sredni", label: "Sredni", color: "bg-purple-100 text-purple-800", sort_order: 3, is_active: false, created_at: "2025-01-01" },
];

beforeEach(() => {
  mockEqFns = [];
  mockOrderFn = vi.fn();
  resolvedData = testLevels;
});

describe("useGroupLevels", () => {
  it("fetches active levels by default", async () => {
    const { useGroupLevels } = await import("../use-group-levels");
    const { result } = renderHook(() => useGroupLevels());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockEqFns.some(([k, v]) => k === "is_active" && v === true)).toBe(true);
  });

  it("returns levels data", async () => {
    const { useGroupLevels } = await import("../use-group-levels");
    const { result } = renderHook(() => useGroupLevels());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.levels).toEqual(testLevels);
  });

  it("orders by sort_order", async () => {
    const { useGroupLevels } = await import("../use-group-levels");
    renderHook(() => useGroupLevels());
    await waitFor(() => {
      expect(mockOrderFn).toHaveBeenCalledWith("sort_order");
    });
  });

  it("does NOT filter by is_active when activeOnly is false", async () => {
    const { useGroupLevels } = await import("../use-group-levels");
    mockEqFns = [];
    renderHook(() => useGroupLevels(false));
    await waitFor(() => {
      expect(mockEqFns.filter(([k]) => k === "is_active")).toHaveLength(0);
    });
  });

  it("provides a refetch function", async () => {
    const { useGroupLevels } = await import("../use-group-levels");
    const { result } = renderHook(() => useGroupLevels());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });

  it("refetch reloads data", async () => {
    const { useGroupLevels } = await import("../use-group-levels");
    const { result } = renderHook(() => useGroupLevels());
    await waitFor(() => expect(result.current.loading).toBe(false));

    resolvedData = [testLevels[0]];
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.levels).toEqual([testLevels[0]]);
  });

  it("handles null data gracefully", async () => {
    resolvedData = null;
    const { useGroupLevels } = await import("../use-group-levels");
    const { result } = renderHook(() => useGroupLevels());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.levels).toEqual([]);
  });
});
