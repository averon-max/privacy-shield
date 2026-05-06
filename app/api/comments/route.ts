import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ comments: [] });

  await connectDB();
  const comments = await Comment.find({ articleSlug: slug, hidden: false }).sort({ createdAt: -1 }).lean() as any[];

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });

  const { articleSlug, body, parentId } = await req.json();
  if (!articleSlug || !body || body.trim().length < 2) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }
  if (body.length > 2000) return NextResponse.json({ error: "Comment too long (2000 char max)" }, { status: 400 });

  await connectDB();
  const comment = await Comment.create({
    articleSlug,
    userId: session.user.email,
    userName: session.user.name || session.user.email.split("@")[0],
    userImage: session.user.image || "",
    body: body.trim(),
    parentId: parentId || null,
    upvotes: [],
  });

  return NextResponse.json({ comment });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { commentId, action } = await req.json();
  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "upvote") {
    const userId = session.user.email;
    if (comment.upvotes.includes(userId)) {
      comment.upvotes = comment.upvotes.filter((u: string) => u !== userId);
    } else {
      comment.upvotes.push(userId);
    }
    await comment.save();
  }

  return NextResponse.json({ comment });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
  const isAdmin = adminEmails.includes(session.user.email);

  const { commentId } = await req.json();
  await connectDB();
  const comment = await Comment.findById(commentId);
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (comment.userId !== session.user.email && !isAdmin) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await Comment.deleteOne({ _id: commentId });
  return NextResponse.json({ ok: true });
}