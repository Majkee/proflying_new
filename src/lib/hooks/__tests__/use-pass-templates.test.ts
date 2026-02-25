import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { StudioContext } from "../use-studio";
import { testStudio, testPassTemplate, testPassTemplate2 } from "@/__tests__/mocks/fixtures";

let mockSelectFn: ReturnType<typeof vi.fn>;
let mockEqFns: Array<[string, unknown]>;
let mockOrderFn: ReturnType<typeof vi.fn>;
let resolvedData: unknown;
let resolvedError: unknown;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain = {
        select: (...args: unknown[]) => { mockSelectFn(...args); return chain; },
        eq: (...args: unknown[]) => { mockEqFns.push(args as [string, unknown]); return chain; },
        order: (...args: unknown[]) => { mockOrderFn(...args); return chain; },
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

beforeEach(() => {
  mockSelectFn = vi.fn();
  mockEqFns = [];
  mockOrderFn = vi.fn();
  resolvedData = [testPassTemplate, testPassTemplate2];
  resolvedError = null;
});

describe("usePassTemplates", () => {
  it("returns empty when no studio", async () => {
    const { usePassTemplates } = await import("../use-pass-templates");
    const { result } = renderHook(() => usePassTemplates(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.templates).toEqual([]);
  });

  it("filters by studio_id and is_active", async () => {
    const { usePassTemplates } = await import("../use-pass-templates");
    renderHook(() => usePassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "studio_id" && v === "studio-1")).toBe(true);
      expect(mockEqFns.some(([k, v]) => k === "is_active" && v === true)).toBe(true);
    });
  });

  it("orders by sort_order", async () => {
    const { usePassTemplates } = await import("../use-pass-templates");
    renderHook(() => usePassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockOrderFn).toHaveBeenCalledWith("sort_order");
    });
  });

  it("provides a refetch function", async () => {
    const { usePassTemplates } = await import("../use-pass-templates");
    const { result } = renderHook(() => usePassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });

  it("exposes error state", async () => {
    const { usePassTemplates } = await import("../use-pass-templates");
    const { result } = renderHook(() => usePassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});

describe("useAllPassTemplates", () => {
  it("returns empty when no studio", async () => {
    const { useAllPassTemplates } = await import("../use-pass-templates");
    const { result } = renderHook(() => useAllPassTemplates(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.templates).toEqual([]);
  });

  it("does NOT filter by is_active", async () => {
    const { useAllPassTemplates } = await import("../use-pass-templates");
    renderHook(() => useAllPassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => {
      // Should have studio_id eq but NOT is_active
      expect(mockEqFns.some(([k]) => k === "studio_id")).toBe(true);
      expect(mockEqFns.filter(([k]) => k === "is_active")).toHaveLength(0);
    });
  });

  it("orders by sort_order", async () => {
    const { useAllPassTemplates } = await import("../use-pass-templates");
    renderHook(() => useAllPassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockOrderFn).toHaveBeenCalledWith("sort_order");
    });
  });

  it("provides a refetch function", async () => {
    const { useAllPassTemplates } = await import("../use-pass-templates");
    const { result } = renderHook(() => useAllPassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });

  it("exposes error state", async () => {
    const { useAllPassTemplates } = await import("../use-pass-templates");
    const { result } = renderHook(() => useAllPassTemplates(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
