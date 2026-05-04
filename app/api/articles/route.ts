import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Article from "@/models/Article";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

function isAdmin(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function calcReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const limit = parseInt(url.searchParams.get("limit") || "0", 10);

  const session = await getServerSession(authOptions);
  const admin = isAdmin(session?.user?.email);

  const filter = (all && admin) ? {} : { published: true };
  let query = Article.find(filter).sort({ publishedAt: -1, createdAt: -1 });
  if (limit > 0) query = query.limit(limit);
  const articles = await query.lean();
  return NextResponse.json({ articles, admin });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const { title, excerpt, content, category, coverEmoji, coverColor, published } = body;

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let n = 1;
  while (await Article.findOne({ slug })) { slug = `${baseSlug}-${n}`; n++; }

  const article = await Article.create({
    slug,
    title: title.trim(),
    excerpt: excerpt?.trim() || "",
    content: content || "",
    category: category || "guide",
    coverEmoji: coverEmoji || "🔐",
    coverColor: coverColor || "#6c9ef7",
    published: !!published,
    publishedAt: published ? new Date() : null,
    readMinutes: calcReadTime(content || ""),
  });

  return NextResponse.json({ article });
}