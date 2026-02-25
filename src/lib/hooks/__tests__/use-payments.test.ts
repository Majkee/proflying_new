import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { StudioContext } from "../use-studio";
import { testStudio, testPayment, testPass } from "@/__tests__/mocks/fixtures";

let mockEqFns: Array<[string, unknown]>;
let mockOrderFn: ReturnType<typeof vi.fn>;
let mockRangeFn: ReturnType<typeof vi.fn>;
let mockRpcFn: ReturnType<typeof vi.fn>;
let resolvedData: unknown;
let resolvedError: unknown;
let resolvedCount: number | null;
let rpcResolvedData: unknown;
let rpcResolvedError: unknown;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain = {
        select: vi.fn(() => chain),
        eq: (...args: unknown[]) => { mockEqFns.push(args as [string, unknown]); return chain; },
        order: (...args: unknown[]) => { mockOrderFn(...args); return chain; },
        range: (...args: unknown[]) => { mockRangeFn(...args); return chain; },
        then: (resolve: (v: unknown) => void) => resolve({ data: resolvedData, error: resolvedError, count: resolvedCount }),
      };
      return chain;
    }),
    rpc: (...args: unknown[]) => {
      mockRpcFn(...args);
      return Promise.resolve({ data: rpcResolvedData, error: rpcResolvedError });
    },
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
  mockEqFns = [];
  mockOrderFn = vi.fn();
  mockRangeFn = vi.fn();
  mockRpcFn = vi.fn();
  resolvedData = [testPayment];
  resolvedError = null;
  resolvedCount = 1;
  rpcResolvedData = null;
  rpcResolvedError = null;
});

describe("usePayments", () => {
  it("returns empty when no studio", async () => {
    const { usePayments } = await import("../use-payments");
    const { result } = renderHook(() => usePayments(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.payments).toEqual([]);
  });

  it("fetches payments for active studio", async () => {
    const { usePayments } = await import("../use-payments");
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.payments).toHaveLength(1);
  });

  it("filters by studio_id", async () => {
    const { usePayments } = await import("../use-payments");
    renderHook(() => usePayments(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "studio_id" && v === "studio-1")).toBe(true);
    });
  });

  it("filters by studentId when provided", async () => {
    const { usePayments } = await import("../use-payments");
    renderHook(() => usePayments("student-1"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "student_id" && v === "student-1")).toBe(true);
    });
  });

  it("applies pagination with range", async () => {
    const { usePayments } = await import("../use-payments");
    renderHook(() => usePayments(undefined, { limit: 20, offset: 40 }), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockRangeFn).toHaveBeenCalledWith(40, 59);
    });
  });

  it("orders by paid_at descending", async () => {
    const { usePayments } = await import("../use-payments");
    renderHook(() => usePayments(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockOrderFn).toHaveBeenCalledWith("paid_at", { ascending: false });
    });
  });

  it("provides a refetch function", async () => {
    const { usePayments } = await import("../use-payments");
    const { result } = renderHook(() => usePayments(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });
});

describe("usePaymentsCount", () => {
  it("returns 0 when no studio", async () => {
    const { usePaymentsCount } = await import("../use-payments");
    const { result } = renderHook(() => usePaymentsCount(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(0);
  });

  it("returns count from query", async () => {
    resolvedCount = 42;
    const { usePaymentsCount } = await import("../use-payments");
    const { result } = renderHook(() => usePaymentsCount(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.count).toBe(42);
  });

  it("filters by studentId when provided", async () => {
    const { usePaymentsCount } = await import("../use-payments");
    renderHook(() => usePaymentsCount("student-1"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "student_id" && v === "student-1")).toBe(true);
    });
  });
});

describe("useMonthlyRevenue", () => {
  it("returns initial revenue when no studio", async () => {
    const { useMonthlyRevenue } = await import("../use-payments");
    const { result } = renderHook(() => useMonthlyRevenue(2026, 2), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.revenue).toEqual({
      total_amount: 0,
      cash_amount: 0,
      transfer_amount: 0,
      payment_count: 0,
    });
  });

  it("calls get_monthly_revenue RPC", async () => {
    rpcResolvedData = [{ total_amount: 500, cash_amount: 300, transfer_amount: 200, payment_count: 3 }];
    const { useMonthlyRevenue } = await import("../use-payments");
    renderHook(() => useMonthlyRevenue(2026, 2), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockRpcFn).toHaveBeenCalledWith("get_monthly_revenue", {
        p_studio_id: "studio-1",
        p_year: 2026,
        p_month: 2,
      });
    });
  });

  it("returns revenue data from RPC", async () => {
    rpcResolvedData = [{ total_amount: 500, cash_amount: 300, transfer_amount: 200, payment_count: 3 }];
    const { useMonthlyRevenue } = await import("../use-payments");
    const { result } = renderHook(() => useMonthlyRevenue(2026, 2), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.revenue.total_amount).toBe(500);
    expect(result.current.revenue.payment_count).toBe(3);
  });
});

describe("usePasses", () => {
  it("returns empty when no studio", async () => {
    const { usePasses } = await import("../use-payments");
    const { result } = renderHook(() => usePasses(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.passes).toEqual([]);
  });

  it("fetches passes for active studio", async () => {
    resolvedData = [testPass];
    const { usePasses } = await import("../use-payments");
    const { result } = renderHook(() => usePasses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.passes).toHaveLength(1);
  });

  it("filters by studentId when provided", async () => {
    const { usePasses } = await import("../use-payments");
    renderHook(() => usePasses("student-1"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "student_id" && v === "student-1")).toBe(true);
    });
  });

  it("orders by valid_until descending", async () => {
    const { usePasses } = await import("../use-payments");
    renderHook(() => usePasses(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockOrderFn).toHaveBeenCalledWith("valid_until", { ascending: false });
    });
  });
});

describe("useOverdueStudents", () => {
  it("returns empty when no studio", async () => {
    const { useOverdueStudents } = await import("../use-payments");
    const { result } = renderHook(() => useOverdueStudents(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.overdueStudents).toEqual([]);
  });

  it("calls get_overdue_students RPC", async () => {
    rpcResolvedData = [{ student_id: "s1", student_name: "Anna", last_pass_end: "2026-01-01", pass_type: "custom" }];
    const { useOverdueStudents } = await import("../use-payments");
    renderHook(() => useOverdueStudents(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockRpcFn).toHaveBeenCalledWith("get_overdue_students", { p_studio_id: "studio-1" });
    });
  });
});

describe("useUnpaidPasses", () => {
  it("returns empty when no studio", async () => {
    const { useUnpaidPasses } = await import("../use-payments");
    const { result } = renderHook(() => useUnpaidPasses(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.unpaidPasses).toEqual([]);
  });

  it("calls get_unpaid_passes RPC", async () => {
    rpcResolvedData = [];
    const { useUnpaidPasses } = await import("../use-payments");
    renderHook(() => useUnpaidPasses(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockRpcFn).toHaveBeenCalledWith("get_unpaid_passes", { p_studio_id: "studio-1" });
    });
  });

  it("provides a refetch function", async () => {
    rpcResolvedData = [];
    const { useUnpaidPasses } = await import("../use-payments");
    const { result } = renderHook(() => useUnpaidPasses(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });
});
