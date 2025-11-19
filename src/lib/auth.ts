/**
 * Authentication Configuration
 * 
 * Magic link authentication using NextAuth.js Email provider
 * Users receive a magic link via email to sign in
 * 
 * @module lib/auth
 */

import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { sendMagicLinkEmail } from "./email-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Required for NextAuth v5
  providers: [
    EmailProvider({
      // Minimal server config (required by NextAuth but not used since we override sendVerificationRequest)
      server: {
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY || "",
        },
      },
      from: process.env.EMAIL_FROM || "noreply@example.com",
      sendVerificationRequest: async ({ identifier, url }) => {
        // Use our custom SendGrid email sending
        await sendMagicLinkEmail({
          email: identifier,
          url,
        });
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        if (user?.email) {
          // Fetch user from database to get the ID
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
          }
        } else if (trigger === "update" && token.email) {
          // Refresh user data if needed
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
          }
        }
      } catch (error) {
        console.error("[auth] JWT callback error:", error);
        // Don't fail authentication if database query fails
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
        }
      } catch (error) {
        console.error("[auth] Session callback error:", error);
        // Don't fail session creation if there's an error
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful authentication, always redirect to /tasks
      // Handle both relative and absolute URLs
      if (url.startsWith("/")) {
        // If it's /tasks or a valid path, use it
        if (url === "/tasks" || url.startsWith("/tasks")) {
          return `${baseUrl}${url}`;
        }
        // Otherwise default to /tasks
        return `${baseUrl}/tasks`;
      }
      // If it's an absolute URL from the same origin, extract the path
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return urlObj.pathname === "/tasks" || urlObj.pathname.startsWith("/tasks") 
            ? url 
            : `${baseUrl}/tasks`;
        }
      } catch {
        // Invalid URL, default to /tasks
      }
      return `${baseUrl}/tasks`;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify", // Custom page for "check your email"
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
// Latest deployment
