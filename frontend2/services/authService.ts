/**
 * @file services/authService.ts
 */
import { supabase } from "@/lib/supabase";
import { LoggedInUser } from "@/types/package";

export const authService = {
  getProfile: async (): Promise<LoggedInUser | null> => {
    // 1. Get Session
    const { data: authData } = await supabase.auth.getSession();
    const session = authData?.session;

    // In the stub, session.user exists because we defined it above
    if (!session || !session.user) return null;

    // 2. Get Profile
    // Now .from().select().eq().single() will work with the new stub
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error || !profile) return null;

    return {
      id: (profile as any).id,
      full_name: (profile as any).full_name,
      phone: (profile as any).phone,
      email: (profile as any).email,
      address: (profile as any).address,
      lieu_dit: (profile as any).lieu_dit,
    };
  },
};
