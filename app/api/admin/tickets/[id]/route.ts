import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function isAdmin(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || "kingkipr@gmail.com").split(",").map(s => s.trim());
  return list.includes(email);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const ticket = await SupportTicket.findById(id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (ticket.unreadByAdmin) {
    ticket.unreadByAdmin = false;
    await ticket.save();
  }

  return NextResponse.json({ ticket: ticket.toObject() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reply } = await req.json();
  if (!reply || reply.trim().length < 2) return NextResponse.json({ error: "Empty reply" }, { status: 400 });

  await connectDB();
  const ticket = await SupportTicket.findById(id);
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  ticket.messages.push({
    from: "admin",
    body: reply.trim(),
    authorEmail: session.user.email,
    authorName: session.user.name || "Support",
  });
  ticket.status = "replied";
  ticket.lastReplyAt = new Date();
  ticket.unreadByAdmin = false;
  await ticket.save();

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const safeReply = reply.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      await resend.emails.send({
        from: "ScanMyCreds Support <support@scanmycreds.com>",
        to: ticket.fromEmail,
        subject: "Re: " + ticket.subject + " [" + ticket.ticketNumber + "]",
        html: '<div style="font-family: system-ui, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #1a1a1a;"><p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">' + safeReply + '</p><hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;"><p style="font-size: 12px; color: #888;">Ticket ' + ticket.ticketNumber + '</p><p style="font-size: 12px; color: #888;">Reply directly to this email to continue the conversation.</p></div>',
      });
    } catch (e) {
      console.error("Resend reply error:", e);
    }
  }

  return NextResponse.json({ ticket: ticket.toObject() });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  if (!["open", "replied", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const ticket = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });
  return NextResponse.json({ ticket });
}