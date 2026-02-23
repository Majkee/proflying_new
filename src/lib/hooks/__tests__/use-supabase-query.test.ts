import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useSupabaseQuery } from "../use-supabase-query";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSupabaseQuery", () => {
  it("starts with loading=true and initial data", () => {
    const queryFn = vi.fn(async () => ["result"]);
    const { result } = renderHook(() =>
      useSupabaseQuery(queryFn, [], [])
    );
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("fetches data and sets loading=false", async () => {
    const queryFn = vi.fn(async () => ["item1", "item2"]);
    const { result } = renderHook(() =>
      useSupabaseQuery(queryFn, [], [])
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(["item1", "item2"]);
    expect(result.current.error).toBeNull();
  });

  it("captures errors", async () => {
    const queryFn = vi.fn(async () => {
      throw new Error("Network error");
    });
    const { result } = renderHook(() =>
      useSupabaseQuery(queryFn, [], [])
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Network error");
    expect(result.current.data).toEqual([]);
  });

  it("returns initialData when enabled=false", async () => {
    const queryFn = vi.fn(async () => ["data"]);
    const { result } = renderHook(() =>
      useSupabaseQuery(queryFn, [], ["default"], { enabled: false })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(["default"]);
    expect(queryFn).not.toHaveBeenCalled();
  });

  it("refetch re-runs query", async () => {
    let counter = 0;
    const queryFn = vi.fn(async () => {
      counter++;
      return [`call-${counter}`];
    });

    const { result } = renderHook(() =>
      useSupabaseQuery(queryFn, [], [])
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(["call-1"]);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual(["call-2"]);
  });

  it("wraps non-Error throws in Error", async () => {
    const queryFn = vi.fn(async () => {
      throw "string error";
    });
    const { result } = renderHook(() =>
      useSupabaseQuery(queryFn, [], null)
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
