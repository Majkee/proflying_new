import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { StudioContext } from "../use-studio";
import { testStudio, testStudent, testStudent2 } from "@/__tests__/mocks/fixtures";

let mockEqFns: Array<[string, unknown]>;
let mockIlikeFn: ReturnType<typeof vi.fn>;
let mockOrderFn: ReturnType<typeof vi.fn>;
let mockRpcFn: ReturnType<typeof vi.fn>;
let resolvedData: unknown;
let resolvedError: unknown;
let rpcResolvedData: unknown;
let rpcResolvedError: unknown;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => {
      const chain = {
        select: vi.fn(() => chain),
        eq: (...args: unknown[]) => { mockEqFns.push(args as [string, unknown]); return chain; },
        ilike: (...args: unknown[]) => { mockIlikeFn(...args); return chain; },
        order: (...args: unknown[]) => { mockOrderFn(...args); return chain; },
        single: vi.fn(() => ({ then: (resolve: (v: unknown) => void) => resolve({ data: resolvedData, error: resolvedError }) })),
        then: (resolve: (v: unknown) => void) => resolve({ data: resolvedData, error: resolvedError }),
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
  mockIlikeFn = vi.fn();
  mockOrderFn = vi.fn();
  mockRpcFn = vi.fn();
  resolvedData = [testStudent, testStudent2];
  resolvedError = null;
  rpcResolvedData = [
    { student_id: "student-1", full_name: "Ola Malinowska", phone: null, email: null, pass_id: null, pass_type: null, template_name: null, valid_from: null, valid_until: null, auto_renew: null, price_amount: null, is_paid: null },
    { student_id: "student-2", full_name: "Maja Krawczyk", phone: null, email: null, pass_id: "pass-1", pass_type: "custom", template_name: "Karnet 2x", valid_from: "2026-02-01", valid_until: "2026-03-02", auto_renew: true, price_amount: 160, is_paid: true },
  ];
  rpcResolvedError = null;
});

describe("useStudents", () => {
  it("returns empty when no studio", async () => {
    const { useStudents } = await import("../use-students");
    const { result } = renderHook(() => useStudents(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.students).toEqual([]);
  });

  it("fetches students for active studio", async () => {
    const { useStudents } = await import("../use-students");
    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.students).toHaveLength(2);
  });

  it("filters by studio_id and is_active", async () => {
    const { useStudents } = await import("../use-students");
    renderHook(() => useStudents(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockEqFns.some(([k, v]) => k === "studio_id" && v === "studio-1")).toBe(true);
      expect(mockEqFns.some(([k, v]) => k === "is_active" && v === true)).toBe(true);
    });
  });

  it("orders by full_name", async () => {
    const { useStudents } = await import("../use-students");
    renderHook(() => useStudents(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockOrderFn).toHaveBeenCalledWith("full_name");
    });
  });

  it("applies search filter with ilike", async () => {
    const { useStudents } = await import("../use-students");
    renderHook(() => useStudents("Ola"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockIlikeFn).toHaveBeenCalledWith("full_name", "%Ola%");
    });
  });

  it("exposes error state", async () => {
    const { useStudents } = await import("../use-students");
    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it("provides a refetch function", async () => {
    const { useStudents } = await import("../use-students");
    const { result } = renderHook(() => useStudents(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(typeof result.current.refetch).toBe("function");
  });
});

describe("useStudentsWithPassStatus", () => {
  it("returns empty when no studio", async () => {
    const { useStudentsWithPassStatus } = await import("../use-students");
    const { result } = renderHook(() => useStudentsWithPassStatus(), { wrapper: createNullWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.students).toEqual([]);
  });

  it("calls get_students_with_pass_status RPC", async () => {
    const { useStudentsWithPassStatus } = await import("../use-students");
    renderHook(() => useStudentsWithPassStatus(), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockRpcFn).toHaveBeenCalledWith("get_students_with_pass_status", { p_studio_id: "studio-1" });
    });
  });

  it("returns students with pass status", async () => {
    const { useStudentsWithPassStatus } = await import("../use-students");
    const { result } = renderHook(() => useStudentsWithPassStatus(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.students).toHaveLength(2);
    expect(result.current.students[1].is_paid).toBe(true);
  });

  it("applies client-side search filter", async () => {
    const { useStudentsWithPassStatus } = await import("../use-students");
    const { result } = renderHook(() => useStudentsWithPassStatus("Maja"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.students).toHaveLength(1);
    expect(result.current.students[0].full_name).toBe("Maja Krawczyk");
  });
});

describe("useStudent", () => {
  it("fetches a single student by id", async () => {
    resolvedData = testStudent;
    const { useStudent } = await import("../use-students");
    const { result } = renderHook(() => useStudent("student-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.student).toEqual(testStudent);
  });

  it("returns null when studentId is empty", async () => {
    const { useStudent } = await import("../use-students");
    const { result } = renderHook(() => useStudent(""), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.student).toBeNull();
  });
});
