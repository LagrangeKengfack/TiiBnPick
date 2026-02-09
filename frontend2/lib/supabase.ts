/**
 * @file lib/supabase.ts
 * @description Enhanced Supabase stub to satisfy TypeScript chaining and fluent API.
 */

const mockQueryResponse = {
  // .eq() needs to return the object again to allow further chaining
  eq: function (column: string, value: any) {
    return this;
  },
  // .single() returns a Promise that resolves to data/error
  single: async function () {
    return { data: null, error: null };
  },
  // .select() returns the query object (this) to allow .eq()
  select: function (...args: any[]) {
    return this;
  },
  insert: async (data: any) => ({ data: [], error: null }),
  update: async (data: any) => ({ data: [], error: null }),
};

export const supabase = {
  from: (tableName: string) => mockQueryResponse,
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({
      data: {
        session: {
          user: { id: "mock-id", email: "mock@example.com" },
        },
      },
      error: null,
    }),
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null }),
  },
};

export default supabase;
