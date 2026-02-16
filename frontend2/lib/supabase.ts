// Minimal supabase stub to satisfy imports in dev environment
const createChain = () => {
  const chain = {
    select: (_args?: any) => chain,
    eq: (_col?: string, _val?: any) => chain,
    single: async () => ({ data: {} as any, error: null as any }),
    order: (_col?: string, _opts?: any) => chain,
    insert: async (_data: any) => ({ data: [], error: null }),
    update: async (_data: any) => ({ data: [], error: null }),
  };
  return chain;
};

export const supabase = {
  from: (_tableName: string) => createChain(),
  auth: {
    getUser: async () => ({ data: { user: { id: 'dummy' } }, error: null }),
    getSession: async () => ({ data: { session: { user: { id: 'dummy' } } }, error: null }),
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => ({ data: null, error: null })
  }
};

export default supabase;
