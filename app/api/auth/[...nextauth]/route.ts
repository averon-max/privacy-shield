import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";  
import User from "@/models/User";

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
        // === LAYER 1: Input Validation ===
        if (!credentials?.email || !credentials?.password) {
          console.error("❌ AUTH BLOCKED: Missing credentials");
          return null;
        }

        // === LAYER 2: Email Normalization ===
        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // === LAYER 3: Strict Email Format ===
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
          console.error("❌ AUTH BLOCKED: Invalid email format:", email);
          return null;
        }

        // === LAYER 4: Block Obvious Typos ===
        const typoPatterns = ["gmaias", "gmase", "gmai", "gnail", "gmails", "hotmial", "outlok", "yahooo", "yaho", "gmil", "gmal"];
        const domain = email.split("@")[1]?.toLowerCase();
        if (typoPatterns.some(pattern => domain?.includes(pattern))) {
          console.error("❌ AUTH BLOCKED: Typo domain detected:", email);
          return null;
        }

        // === LAYER 5: Require Legitimate TLD ===
        const tld = email.split(".").pop()?.toLowerCase();
        if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-z]+$/.test(tld)) {
          console.error("❌ AUTH BLOCKED: Invalid TLD:", tld);
          return null;
        }

        // === LAYER 6: Whitelist Known Domains ===
        const allowedDomains = [
          "gmail.com", "googlemail.com",
          "outlook.com", "outlook.co.uk", "outlook.fr", "outlook.de",
          "hotmail.com", "hotmail.co.uk", "live.com",
          "yahoo.com", "yahoo.co.uk", "yahoo.fr",
          "icloud.com", "me.com", "mac.com",
          "proton.me", "protonmail.com", "protonmail.ch",
          "aol.com", "zoho.com", "mail.com"
        ];
        if (!allowedDomains.includes(domain)) {
          console.error("❌ AUTH BLOCKED: Domain not whitelisted:", domain);
          return null;
        }

        // === LAYER 7: Password Minimum Requirements ===
        if (password.length < 8) {
          console.error("❌ AUTH BLOCKED: Password too short");
          return null;
        }

        try {
          // === LAYER 8: Database Connection ===
          await connectDB();

          // === LAYER 9: User Must Exist in Database ===
          const user = await User.findOne({ email }).lean();
          if (!user) {
            console.error("❌ AUTH BLOCKED: User not found in database:", email);
            return null;
          }

          // === LAYER 10: User Must Have Password Hash ===
          if (!user.password || user.password.length < 60) {
            console.error("❌ AUTH BLOCKED: No password hash stored:", email);
            return null;
          }

          // === LAYER 11: Password Verification ===
          const valid = await bcrypt.compare(password, user.password);
          if (!valid) {
            console.error("❌ AUTH BLOCKED: Password mismatch:", email);
            return null;
          }

          console.log("✅ AUTH SUCCESS:", email);
          return { 
            id: user._id.toString(), 
            email: user.email, 
            name: user.name || user.email,
            image: user.image || null
          };

        } catch (error) {
          console.error("❌ AUTH BLOCKED: System error:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
    // ✅ Google login works normally - NO restrictions here
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
