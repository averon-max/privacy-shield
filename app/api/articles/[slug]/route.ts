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

function calcReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const params = await ctx.params;
  await connectDB();
  const article = await Article.findOne({ slug: params.slug }).lean() as any;
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (!article.published && !isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  Article.updateOne({ slug: params.slug }, { $inc: { views: 1 } }).exec();

  return NextResponse.json({ article });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const params = await ctx.params;
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();
  const updates: any = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt.trim();
  if (body.content !== undefined) {
    updates.content = body.content;
    updates.readMinutes = calcReadTime(body.content);
  }
  if (body.category !== undefined) updates.category = body.category;
  if (body.coverEmoji !== undefined) updates.coverEmoji = body.coverEmoji;
  if (body.coverColor !== undefined) updates.coverColor = body.coverColor;
  if (body.published !== undefined) {
    updates.published = !!body.published;
    if (body.published) {
      const existing = await Article.findOne({ slug: params.slug }).lean() as any;
      if (existing && !existing.publishedAt) updates.publishedAt = new Date();
    }
  }

  const article = await Article.findOneAndUpdate({ slug: params.slug }, updates, { new: true });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ article });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const params = await ctx.params;
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  await Article.findOneAndDelete({ slug: params.slug });
  return NextResponse.json({ ok: true });
}