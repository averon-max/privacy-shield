import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import SupportTicket from "@/models/SupportTicket";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function genTicketNumber(): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 5);
  return "SMC-" + ts + rnd;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, subject, message, category = "general" } = await req.json();
    if (!email || !email.includes("@") || !subject || !message || message.trim().length < 5) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (message.length > 5000) return NextResponse.json({ error: "Message too long" }, { status: 400 });

    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || "";

    await connectDB();

    const ticket = await SupportTicket.create({
      ticketNumber: genTicketNumber(),
      userId,
      fromEmail: email.trim(),
      fromName: name?.trim() || "",
      subject: subject.trim(),
      category,
      status: "open",
      messages: [{
        from: "user",
        body: message.trim(),
        authorEmail: email.trim(),
        authorName: name?.trim() || "",
      }],
      lastReplyAt: new Date(),
      unreadByAdmin: true,
    });

    // Send confirmation email to user
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "ScanMyCreds Support <support@scanmycreds.com>",
          to: email,
          subject: "We got your message — Ticket " + ticket.ticketNumber,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
              <h2 style="font-size: 20px; margin-bottom: 16px;">We got your message</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #555;">Thanks for reaching out — we'll reply within 24 hours.</p>
              <div style="margin: 20px 0; padding: 16px; background: #f5f5f5; border-radius: 8px; border-left: 3px solid #6c9ef7;">
                <p style="font-size: 12px; color: #888; margin-bottom: 4px;">Ticket</p>
                <p style="font-size: 14px; font-weight: 600;">${ticket.ticketNumber}</p>
                <p style="font-size: 12px; color: #888; margin: 12px 0 4px;">Subject</p>
                <p style="font-size: 14px;">${ticket.subject}</p>
              </div>
              <p style="font-size: 13px; color: #888;">A real human will respond — no autoresponders, no bots.</p>
              <p style="font-size: 13px; color: #888; margin-top: 30px;">— ScanMyCreds team</p>
            </div>
          `,
        });
      } catch (e) {
        console.error("Resend confirmation error:", e);
      }

      // Notify admin
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const adminEmails = (process.env.ADMIN_EMAILS || "kingkipr@gmail.com").split(",").map(s => s.trim());
        await resend.emails.send({
          from: "ScanMyCreds Tickets <support@scanmycreds.com>",
          to: adminEmails,
          subject: "[" + ticket.ticketNumber + "] " + ticket.subject,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
              <h2 style="font-size: 18px; margin-bottom: 12px;">New support ticket</h2>
              <p style="font-size: 13px; color: #555;"><strong>From:</strong> ${name || ""} &lt;${email}&gt;</p>
              <p style="font-size: 13px; color: #555;"><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
              <p style="font-size: 13px; color: #555;"><strong>Category:</strong> ${category}</p>
              <div style="margin: 16px 0; padding: 14px; background: #f5f5f5; border-radius: 8px; white-space: pre-wrap; font-size: 13px;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
              <a href="https://www.scanmycreds.com/admin/support" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px;">Reply in admin →</a>
            </div>
          `,
        });
      } catch (e) {
        console.error("Resend admin notify error:", e);
      }
    }

    return NextResponse.json({ ok: true, ticketNumber: ticket.ticketNumber });
  } catch (err: any) {
    console.error("ticket POST error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}