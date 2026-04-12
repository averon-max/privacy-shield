import { NextRequest, NextResponse } from "next/server";
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
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahho.com": "yahoo.com",
};

function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) return { valid: false, error: "Invalid email format" };

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, error: "Missing domain" };

  if (TYPO_DOMAINS[domain])
    return { valid: false, error: `Did you mean ${email.split("@")[0]}@${TYPO_DOMAINS[domain]}?` };

  const tld = domain.split(".").pop();
  if (!tld || tld.length < 2 || tld.length > 6 || !/^[a-z]+$/.test(tld))
    return { valid: false, error: "Invalid email domain" };

  if (!ALLOWED_DOMAINS.includes(domain))
    return { valid: false, error: "Please use a personal email (Gmail, Outlook, Yahoo, iCloud, etc.)" };

  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const { name, email: rawEmail, password } = await req.json();

    if (!name?.trim() || !rawEmail?.trim() || !password)
      return NextResponse.json({ error: "All fields required" }, { status: 400 });

    if (name.trim().length < 2)
      return NextResponse.json({ error: "Please enter your full name" }, { status: 400 });

    const email = rawEmail.toLowerCase().trim();
    const check = validateEmail(email);
    if (!check.valid)
      return NextResponse.json({ error: check.error }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return NextResponse.json({ error: "Password must contain at least one uppercase letter and one number" }, { status: 400 });

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name: name.trim(), email, password: hashed });

    console.log("✅ REGISTER SUCCESS:", email);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}