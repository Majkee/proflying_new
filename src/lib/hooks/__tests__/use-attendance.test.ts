import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAttendance, useEnsureSession } from "../use-attendance";

// Mock the logger
vi.mock("@/lib/utils/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

let mockSelectResult: { data: unknown; error: unknown };
let mockRpcResult: { data: unknown; error: unknown };
let mockRpcFn: ReturnType<typeof vi.fn>;

function makeMockChain(result: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.in = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  // Make it thenable
  (chain as Record<string, unknown>).then = (resolve: (v: unknown) => void) =>
    resolve(result);
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: vi.fn(() => makeMockChain(mockSelectResult)),
    rpc: (...args: unknown[]) => {
      mockRpcFn(...args);
      return Promise.resolve(mockRpcResult);
    },
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSelectResult = { data: [], error: null };
  mockRpcResult = { data: "session-1", error: null };
  mockRpcFn = vi.fn();
});

describe("useEnsureSession", () => {
  it("returns null when groupId is empty", async () => {
    const { result } = renderHook(() => useEnsureSession("", "2026-02-22"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessionId).toBeNull();
  });

  it("returns null when date is empty", async () => {
    const { result } = renderHook(() => useEnsureSession("group-1", ""));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.sessionId).toBeNull();
  });

  it("calls ensure_session RPC with correct params", async () => {
    const { result } = renderHook(() => useEnsureSession("group-1", "2026-02-22"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockRpcFn).toHaveBeenCalledWith("ensure_session", {
      p_group_id: "group-1",
      p_date: "2026-02-22",
    });
    expect(result.current.sessionId).toBe("session-1");
  });

  it("returns error when RPC fails", async () => {
    mockRpcResult = { data: null, error: new Error("RPC failed") };

    const { result } = renderHook(() => useEnsureSession("group-1", "2026-02-22"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe("useAttendance", () => {
  it("returns empty records when sessionId is null", async () => {
    const { result } = renderHook(() => useAttendance(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
  });

  it("fetches attendance records for a session", async () => {
    const mockRecords = [
      {
        id: "att-1",
        session_id: "session-1",
        student_id: "student-1",
        status: "present",
        note: null,
        is_substitute: false,
        substitute_name: null,
        marked_by: "user-1",
        marked_at: "2026-02-22T17:30:00Z",
      },
    ];
    mockSelectResult = { data: mockRecords, error: null };

    const { result } = renderHook(() => useAttendance("session-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0].status).toBe("present");
  });

  it("provides toggleAttendance function", async () => {
    mockSelectResult = { data: [], error: null };
    mockRpcResult = { data: null, error: null };

    const { result } = renderHook(() => useAttendance("session-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.toggleAttendance).toBe("function");
  });

  it("performs optimistic update on toggle", async () => {
    mockSelectResult = { data: [], error: null };
    mockRpcResult = { data: null, error: null };

    const { result } = renderHook(() => useAttendance("session-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggleAttendance("student-1", "present");
    });

    // Optimistic update should add a record immediately
    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0].student_id).toBe("student-1");
    expect(result.current.records[0].status).toBe("present");
  });

  it("returns error state when fetch fails", async () => {
    mockSelectResult = { data: null, error: new Error("Fetch failed") };

    const { result } = renderHook(() => useAttendance("session-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
