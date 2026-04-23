import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const ALLOWED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "outlook.com", "outlook.co.uk", "outlook.fr", "outlook.de",
  "hotmail.com", "hotmail.co.uk", "live.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "protonmail.ch",
  "aol.com", "zoho.com", "mail.com"
];

const TYPO_DOMAINS: Record<string, string> = {
  "gmial.com": "gmail.com", "gnail.com": "gmail.com", "gmal.com": "gmail.com",
  "gmil.com": "gmail.com", "gmaill.com": "gmail.com", "gamil.com": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com", "outloook.com": "outlook.com",
  "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com", "yahho.com": "yahoo.com",
};

function validateEmail(email: string): { valid: boolean; reason?: string } {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) return { valid: false, reason: "Invalid email format" };
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, reason: "Missing domain" };
  if (TYPO_DOMAINS[domain]) return { valid: false, reason: `Did you mean ${email.split("@")[0]}@${TYPO_DOMAINS[domain]}?` };
  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-z]+$/.test(tld)) return { valid: false, reason: "Invalid domain" };
  if (!ALLOWED_DOMAINS.includes(domain)) return { valid: false, reason: "Please use a personal email (Gmail, Outlook, Yahoo, iCloud, etc.)" };
  return { valid: true };
}

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
        const check = validateEmail(email);
        if (!check.valid) return null;
        if (credentials.password.length < 8) return null;
        try {
          await connectDB();
          const user = await User.findOne({ email }).lean() as any;
          if (!user || !user.password || user.password.length < 60) return null;
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || user.email,
            image: user.image || null,
            isPro: user.isPro || false,
          };
        } catch { return null; }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.isPro = (user as any).isPro || false;
      }
      // Refresh isPro from DB on each request so upgrades take effect immediately
      if (token.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email }).lean() as any;
          if (dbUser) token.isPro = dbUser.isPro || false;
        } catch {}
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.isPro = token.isPro || false;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };