import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockSupabaseClient,
  setMockSupabaseClient,
} from "@/__tests__/mocks/supabase";
import { testStudent, testStudent2, testGroup } from "@/__tests__/mocks/fixtures";

// Mock "server-only" to be a no-op (it throws when imported outside of RSC)
vi.mock("server-only", () => ({}));

// Mock the server supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => {
    const { getMockSupabaseClient } = await import("@/__tests__/mocks/supabase");
    return getMockSupabaseClient();
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getStudents
// ---------------------------------------------------------------------------
describe("getStudents", () => {
  it("returns student data for a studio", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: [testStudent, testStudent2], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudents } = await import("../queries");
    const result = await getStudents("studio-1");

    expect(result).toEqual([testStudent, testStudent2]);
    expect(mockClient.from).toHaveBeenCalledWith("students");
  });

  it("returns empty array when no data", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: null, error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudents } = await import("../queries");
    const result = await getStudents("studio-1");

    expect(result).toEqual([]);
  });

  it("applies search filter via ilike", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: [testStudent], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudents } = await import("../queries");
    const result = await getStudents("studio-1", "Ola");

    expect(result).toEqual([testStudent]);
    // The chain should have called ilike - verify via the proxy chain
    const chain = mockClient._fromChains["students"]?.chain;
    expect(chain?.ilike).toHaveBeenCalledWith("full_name", "%Ola%");
  });

  it("does not call ilike when search is undefined", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: [], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudents } = await import("../queries");
    await getStudents("studio-1");

    const chain = mockClient._fromChains["students"]?.chain;
    expect(chain?.ilike).not.toHaveBeenCalled();
  });

  it("throws on supabase error", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: null, error: { message: "DB error", code: "500" } },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudents } = await import("../queries");
    await expect(getStudents("studio-1")).rejects.toEqual({ message: "DB error", code: "500" });
  });
});

// ---------------------------------------------------------------------------
// getStudent
// ---------------------------------------------------------------------------
describe("getStudent", () => {
  it("returns a single student by id", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: testStudent, error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudent } = await import("../queries");
    const result = await getStudent("student-1");

    expect(result).toEqual(testStudent);
    expect(mockClient.from).toHaveBeenCalledWith("students");
  });

  it("throws when student not found", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: null, error: { message: "Not found", code: "PGRST116" } },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getStudent } = await import("../queries");
    await expect(getStudent("nonexistent")).rejects.toEqual({ message: "Not found", code: "PGRST116" });
  });
});

// ---------------------------------------------------------------------------
// getGroups
// ---------------------------------------------------------------------------
describe("getGroups", () => {
  const groupWithMembership = {
    ...testGroup,
    group_memberships: [{ count: 5 }],
  };

  it("returns groups with member_count", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: [groupWithMembership], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getGroups } = await import("../queries");
    const result = await getGroups("studio-1");

    expect(result).toHaveLength(1);
    expect(result[0].member_count).toBe(5);
  });

  it("applies dayOfWeek filter", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: [groupWithMembership], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getGroups } = await import("../queries");
    await getGroups("studio-1", { dayOfWeek: 1 });

    const chain = mockClient._fromChains["groups"]?.chain;
    // eq is called multiple times: studio_id, is_active, group_memberships.is_active, and dayOfWeek
    expect(chain?.eq).toHaveBeenCalledWith("day_of_week", 1);
  });

  it("applies instructorId filter", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: [groupWithMembership], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getGroups } = await import("../queries");
    await getGroups("studio-1", { instructorId: "instr-1" });

    const chain = mockClient._fromChains["groups"]?.chain;
    expect(chain?.eq).toHaveBeenCalledWith("instructor_id", "instr-1");
  });

  it("defaults member_count to 0 when group_memberships is empty", async () => {
    const groupNoMembers = {
      ...testGroup,
      group_memberships: [],
    };
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: [groupNoMembers], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getGroups } = await import("../queries");
    const result = await getGroups("studio-1");

    expect(result[0].member_count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getGroup
// ---------------------------------------------------------------------------
describe("getGroup", () => {
  it("returns a single group by id", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: testGroup, error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getGroup } = await import("../queries");
    const result = await getGroup("group-1");

    expect(result).toEqual(testGroup);
  });
});

// ---------------------------------------------------------------------------
// getPayments
// ---------------------------------------------------------------------------
describe("getPayments", () => {
  const mockPayment = {
    id: "pay-1",
    student_id: "student-1",
    amount: 160,
    method: "cash",
  };

  it("returns payments for a studio", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        payments: { data: [mockPayment], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getPayments } = await import("../queries");
    const result = await getPayments("studio-1");

    expect(result).toEqual([mockPayment]);
  });

  it("applies studentId filter", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        payments: { data: [mockPayment], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getPayments } = await import("../queries");
    await getPayments("studio-1", { studentId: "student-1" });

    const chain = mockClient._fromChains["payments"]?.chain;
    expect(chain?.eq).toHaveBeenCalledWith("student_id", "student-1");
  });

  it("applies limit and offset via range", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        payments: { data: [mockPayment], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getPayments } = await import("../queries");
    await getPayments("studio-1", { limit: 10, offset: 20 });

    const chain = mockClient._fromChains["payments"]?.chain;
    expect(chain?.range).toHaveBeenCalledWith(20, 29);
  });

  it("defaults offset to 0 when only limit is provided", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        payments: { data: [mockPayment], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getPayments } = await import("../queries");
    await getPayments("studio-1", { limit: 5 });

    const chain = mockClient._fromChains["payments"]?.chain;
    expect(chain?.range).toHaveBeenCalledWith(0, 4);
  });
});

// ---------------------------------------------------------------------------
// getDashboardStats
// ---------------------------------------------------------------------------
describe("getDashboardStats", () => {
  it("returns stats shape for non-manager role", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: null, error: null, count: 25 },
        groups: { data: null, error: null, count: 8 },
      },
    });
    // Override the from chain to return count
    const studentsChain = mockClient._fromChains["students"];
    const groupsChain = mockClient._fromChains["groups"];
    // The mock chain resolves with data/error, but getDashboardStats reads .count
    // We need to override the resolved value to include count
    setMockSupabaseClient(
      createMockSupabaseClient({
        fromData: {
          students: { data: null, error: null, count: 25 } as unknown as { data: unknown; error: unknown },
          groups: { data: null, error: null, count: 8 } as unknown as { data: unknown; error: unknown },
        },
      })
    );

    const { getDashboardStats } = await import("../queries");
    const result = await getDashboardStats("studio-1", "instructor");

    expect(result).toHaveProperty("activeStudents");
    expect(result).toHaveProperty("activeGroups");
    expect(result).toHaveProperty("monthRevenue");
    expect(result).toHaveProperty("overdueCount");
    // instructor role should not fetch revenue/overdue
    expect(result.monthRevenue).toBe(0);
    expect(result.overdueCount).toBe(0);
  });

  it("returns stats shape for manager role (fetches revenue and overdue)", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: null, error: null, count: 10 } as unknown as { data: unknown; error: unknown },
        groups: { data: null, error: null, count: 3 } as unknown as { data: unknown; error: unknown },
      },
      rpcData: {
        get_monthly_revenue: { data: [{ total_amount: 5000 }], error: null },
        get_overdue_students: { data: [{ id: "s1" }, { id: "s2" }], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getDashboardStats } = await import("../queries");
    const result = await getDashboardStats("studio-1", "manager");

    expect(result).toHaveProperty("activeStudents");
    expect(result).toHaveProperty("activeGroups");
    expect(result.monthRevenue).toBe(5000);
    expect(result.overdueCount).toBe(2);
  });

  it("returns stats shape for super_admin role", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        students: { data: null, error: null, count: 15 } as unknown as { data: unknown; error: unknown },
        groups: { data: null, error: null, count: 5 } as unknown as { data: unknown; error: unknown },
      },
      rpcData: {
        get_monthly_revenue: { data: [{ total_amount: 12000 }], error: null },
        get_overdue_students: { data: [], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getDashboardStats } = await import("../queries");
    const result = await getDashboardStats("studio-1", "super_admin");

    expect(result.monthRevenue).toBe(12000);
    expect(result.overdueCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getTodayGroupsWithMemberCounts
// ---------------------------------------------------------------------------
describe("getTodayGroupsWithMemberCounts", () => {
  it("returns groups for today with member counts", async () => {
    const groupWithMembers = {
      ...testGroup,
      group_memberships: [{ count: 7 }],
    };
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: [groupWithMembers], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getTodayGroupsWithMemberCounts } = await import("../queries");
    const result = await getTodayGroupsWithMemberCounts("studio-1");

    expect(result).toHaveLength(1);
    expect(result[0].member_count).toBe(7);
  });

  it("filters by today's day of week", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: [], error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getTodayGroupsWithMemberCounts } = await import("../queries");
    await getTodayGroupsWithMemberCounts("studio-1");

    const chain = mockClient._fromChains["groups"]?.chain;
    const today = new Date().getDay();
    expect(chain?.eq).toHaveBeenCalledWith("day_of_week", today);
  });

  it("returns empty array when no groups today", async () => {
    const mockClient = createMockSupabaseClient({
      fromData: {
        groups: { data: null, error: null },
      },
    });
    setMockSupabaseClient(mockClient);

    const { getTodayGroupsWithMemberCounts } = await import("../queries");
    const result = await getTodayGroupsWithMemberCounts("studio-1");

    expect(result).toEqual([]);
  });
});
