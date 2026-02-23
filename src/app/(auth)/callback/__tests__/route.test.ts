import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock "server-only" to be a no-op
vi.mock("server-only", () => ({}));

// Track the mock supabase client for each test
const mockExchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
    },
  })),
}));

// We need to mock NextResponse.redirect since it won't work in jsdom
const mockRedirect = vi.fn((url: string | URL) => {
  return { redirectUrl: typeof url === "string" ? url : url.toString(), type: "redirect" };
});

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: string | URL) => mockRedirect(url),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockExchangeCodeForSession.mockResolvedValue({ error: null });
});

function makeRequest(url: string): Request {
  return new Request(url);
}

describe("OAuth callback route", () => {
  // -------------------------------------------------------------------------
  // Valid internal paths
  // -------------------------------------------------------------------------
  describe("valid internal paths", () => {
    it("allows /dashboard redirect", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/dashboard");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });

    it("allows /students path", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/students");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/students");
    });

    it("allows nested path like /students/abc", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/students/abc");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/students/abc");
    });

    it("allows /groups path", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/groups");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/groups");
    });

    it("allows /payments path", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/payments");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/payments");
    });

    it("allows /settings path", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/settings");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/settings");
    });

    it("allows path with query parameters", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/dashboard?tab=overview");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard?tab=overview");
    });
  });

  // -------------------------------------------------------------------------
  // Open redirect blocking
  // -------------------------------------------------------------------------
  describe("open redirect protection", () => {
    it("blocks //evil.com (protocol-relative URL)", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=//evil.com");

      await GET(request);

      // Should fall back to /dashboard, not redirect to evil.com
      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });

    it("blocks https://evil.com (absolute URL)", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=https://evil.com");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });

    it("blocks http://evil.com (absolute URL)", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=http://evil.com");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });

    it("blocks paths not in allowlist (e.g., /admin)", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/admin");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });

    it("blocks empty path", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=");

      await GET(request);

      // Empty string is not a valid redirect, falls back to /dashboard
      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });
  });

  // -------------------------------------------------------------------------
  // Default fallback
  // -------------------------------------------------------------------------
  describe("fallback behavior", () => {
    it("falls back to /dashboard when no next parameter", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });

    it("falls back to /dashboard for invalid next paths", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=valid-code&next=/unknown-page");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/dashboard");
    });
  });

  // -------------------------------------------------------------------------
  // Missing code parameter
  // -------------------------------------------------------------------------
  describe("missing code parameter", () => {
    it("redirects to /login?error=auth when no code is present", async () => {
      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?next=/dashboard");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/login?error=auth");
    });

    it("redirects to /login?error=auth when code exchange fails", async () => {
      mockExchangeCodeForSession.mockResolvedValue({ error: { message: "Invalid code" } });

      const { GET } = await import("../route");
      const request = makeRequest("http://localhost:3000/callback?code=bad-code&next=/dashboard");

      await GET(request);

      expect(mockRedirect).toHaveBeenCalledWith("http://localhost:3000/login?error=auth");
    });
  });
});
