import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Minimal NextAuth config using Credentials (email/password) with Supabase auth
// No Prisma, no DB adapter – session strategy is JWT
const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        // Authenticate against Supabase on the server
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        // Return a user object for NextAuth JWT
        return {
          id: data.user.id,
          email: data.user.email,
          name: (data.user.user_metadata as any)?.full_name || data.user.email || undefined,
        } as any;
      },
    }),
  ],
};

export default authConfig;


