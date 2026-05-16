import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import WatchlistEntry from "@/models/WatchlistEntry";
import { checkEmailBreaches } from "@/services/checkEmailService";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildAlertEmail(email: string, breachCount: number, newBreaches: number, breachSources: string[]): string {
  const sourcesList = breachSources.slice(0, 8).map(s =>
    `<span style="display:inline-block;margin:3px;padding:3px 10px;background:#1a0a0a;border:1px solid rgba(224,92,75,0.3);border-radius:4px;font-size:12px;color:#e05c4b;">${s}</span>`
  ).join("");
  const moreCount = breachSources.length > 8 ? breachSources.length - 8 : 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(224,92,75,0.08);border:1px solid rgba(224,92,75,0.35);border-radius:16px;overflow:hidden;">
            <tr><td style="height:3px;background:linear-gradient(to right,#e05c4b,#b47fe8);font-size:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#e05c4b;">⚠ New breach detected</h1>
              <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">
                <strong style="color:#fff;">${email}</strong> appeared in ${newBreaches} new breach${newBreaches > 1 ? "es" : ""}.
                Total breaches found: <strong style="color:#e05c4b;">${breachCount}</strong>
              </p>
              ${breachSources.length > 0 ? `
              <div style="margin-bottom:20px;">
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.15em;color:rgba(255,255,255,0.25);text-transform:uppercase;">Sources</p>
                ${sourcesList}${moreCount > 0 ? `<span style="display:inline-block;margin:3px;padding:3px 10px;background:rgba(255,255,255,0.04);border-radius:4px;font-size:12px;color:rgba(255,255,255,0.3);">+${moreCount} more</span>` : ""}
              </div>` : ""}
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right:10px;">
                  <a href="https://www.scanmycreds.com/app" style="display:inline-block;background:#fff;color:#000;font-weight:700;font-size:13px;padding:13px 28px;border-radius:9px;text-decoration:none;">View Full Report →</a>
                </td>
                <td>
                  <a href="https://www.scanmycreds.com/app/watchlist" style="display:inline-block;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-weight:600;font-size:13px;padding:13px 20px;border-radius:9px;text-decoration:none;border:1px solid rgba(255,255,255,0.1);">Manage Watchlist</a>
                </td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.07);">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
            You're receiving this because ${email} is on your ScanMyCreds watchlist. 
            <a href="https://www.scanmycreds.com/app/watchlist" style="color:rgba(255,255,255,0.3);">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Берём все активные записи — WatchlistEntry не имеет поля active,
    // поэтому берём все и фильтруем по тому что не проверялись > 23ч
    const cutoff = Date.now() - 23 * 60 * 60 * 1000;
    const entries = await WatchlistEntry.find({
      $or: [
        { lastChecked: null },
        { lastChecked: { $lt: cutoff } },
      ],
    }).limit(200);

    let checkedCount = 0;
    let alertCount = 0;
    const errors: string[] = [];

    for (const entry of entries) {
      try {
        const breachData = await checkEmailBreaches(entry.email);

        // null = ошибка API, пропускаем но не обновляем lastChecked
        if (breachData === null) {
          errors.push(`${entry.email}: API error`);
          continue;
        }

        const currentCount = breachData.breachCount;
        const previousCount = entry.breachCount || 0;
        const isNewBreach = currentCount > previousCount;

        // Обновляем запись
        await WatchlistEntry.findByIdAndUpdate(entry._id, {
          lastChecked: Date.now(),
          breached: breachData.breached,
          breachCount: currentCount,
          breachSources: breachData.breachSources,
        });

        // Отправляем алерт если новые бреши
        if (isNewBreach && entry.userId) {
          const newBreaches = currentCount - previousCount;
          try {
            await resend.emails.send({
              from: "ScanMyCreds <noreply@scanmycreds.com>",
              to: entry.userId, // userId = email пользователя
              subject: `⚠ ${newBreaches} new breach${newBreaches > 1 ? "es" : ""} detected — ${entry.email}`,
              html: buildAlertEmail(entry.email, currentCount, newBreaches, breachData.breachSources),
            });
            alertCount++;
          } catch (emailErr) {
            console.error(`Email send failed for ${entry.userId}:`, emailErr);
          }
        }

        checkedCount++;

        // Пауза чтобы не спамить XposedOrNot
        await new Promise(r => setTimeout(r, 400));

      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown";
        errors.push(`${entry.email}: ${msg}`);
        console.error(`Cron error for ${entry.email}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      checked: checkedCount,
      alerts: alertCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({
      error: "Cron failed",
      details: error instanceof Error ? error.message : "Unknown",
    }, { status: 500 });
  }
}