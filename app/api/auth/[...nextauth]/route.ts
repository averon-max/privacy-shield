import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ALLOWED_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "outlook.co.uk", "outlook.fr",
  "outlook.de", "hotmail.com", "hotmail.co.uk", "live.com", "yahoo.com",
  "yahoo.co.uk", "yahoo.fr", "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "protonmail.ch", "aol.com", "zoho.com", "mail.com"
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        if (credentials.password.length < 8) return null;
        try {
          await connectDB();
          const user = await User.findOne({ email }).lean() as any;
          if (!user || !user.password) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email,
            image: user.image || null,
            isPro: user.isPro || false,
            plan: user.plan || "free",
          };
        } catch { return null; }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              isPro: false,
              plan: "free",
            });
          }
        } catch (err) {
          console.error("Google signIn DB error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isPro = (user as any).isPro || false;
        token.plan = (user as any).plan || "free";
      }
      if (account?.provider === "google" && token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).lean() as any;
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.isPro = dbUser.isPro || false;
            token.plan = dbUser.plan || "free";
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        (session.user as any).isPro = token.isPro || false;
        (session.user as any).plan = token.plan || "free";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return baseUrl + url;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl + "/app";
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };