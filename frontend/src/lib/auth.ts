import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" } // 'login' or 'register'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const endpoint = credentials.action === 'register' ? '/auth/register' : '/auth/login';
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          
          const res = await fetch(`${apiUrl}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
            headers: { "Content-Type": "application/json" }
          });
          
          const data = await res.json();
          if (res.ok && data.access_token) {
            return {
              id: data.user?.id || credentials.email,
              email: credentials.email,
              accessToken: data.access_token
            };
          }
          throw new Error(data.message || "Authentication failed");
        } catch (error: unknown) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as import("next-auth").User & { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session as import("next-auth").Session & { accessToken?: unknown }).accessToken = token.accessToken;
      return session;
    }
  },
  pages: {
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret",
};
