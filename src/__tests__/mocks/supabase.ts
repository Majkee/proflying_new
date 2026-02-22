import { vi } from "vitest";

type SupabaseResponse = { data: unknown; error: unknown };

export function createMockChain(resolvedValue: SupabaseResponse = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  const createChainMethod = (name: string) => {
    chain[name] = vi.fn().mockReturnValue(chainProxy);
    return chain[name];
  };

  const chainProxy = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === "then") {
          return (resolve: (v: SupabaseResponse) => void) => resolve(resolvedValue);
        }
        if (!chain[prop]) {
          createChainMethod(prop);
        }
        return chain[prop];
      },
    }
  ) as Record<string, ReturnType<typeof vi.fn>> & PromiseLike<SupabaseResponse>;

  return { chain: chainProxy, methods: chain };
}

export function createMockSupabaseClient(
  overrides: {
    fromData?: Record<string, SupabaseResponse>;
    rpcData?: Record<string, SupabaseResponse>;
    authUser?: { id: string; email: string } | null;
  } = {}
) {
  const fromChains: Record<string, ReturnType<typeof createMockChain>> = {};

  const fromFn = vi.fn((table: string) => {
    if (!fromChains[table]) {
      const resolvedValue = overrides.fromData?.[table] ?? { data: null, error: null };
      fromChains[table] = createMockChain(resolvedValue);
    }
    return fromChains[table].chain;
  });

  const rpcFn = vi.fn((fn: string, _params?: Record<string, unknown>) => {
    const resolvedValue = overrides.rpcData?.[fn] ?? { data: null, error: null };
    return Promise.resolve(resolvedValue);
  });

  const authUser = overrides.authUser ?? null;

  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: authUser },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }),
  };

  return {
    from: fromFn,
    rpc: rpcFn,
    auth,
    _fromChains: fromChains,
  };
}

// Default mock for the Supabase client module
let mockClient = createMockSupabaseClient();

export function setMockSupabaseClient(client: ReturnType<typeof createMockSupabaseClient>) {
  mockClient = client;
}

export function getMockSupabaseClient() {
  return mockClient;
}

// This is the mock factory used with vi.mock
export const createClient = vi.fn(() => mockClient);
