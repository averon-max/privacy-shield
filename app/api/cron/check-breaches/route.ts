import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { connectDB } from "@/lib/db";
import WatchedEmail from "@/models/WatchedEmail";
import BreachNews, { computeSeverity } from "@/models/BreachNews";
import { checkEmailBreaches } from "@/services/checkEmailService";
import { summarizeBreachForNews } from "@/services/aiExplainer";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildAlertEmail(
  email: string,
  breachCount: number,
  newBreaches: number,
  breachSources: string[]
): string {
  const sourcesList = breachSources.slice(0, 8).map(s =>
    `<span style="display:inline-block;margin:3px;padding:3px 10px;background:#1a0a0a;border:1px solid rgba(224,92,75,0.3);border-radius:4px;font-size:12px;color:#e05c4b;">${s}</span>`
  ).join("");

  const moreCount = breachSources.length > 8 ? breachSources.length - 8 : 0;
  const score = breachCount >= 10 ? 12 : breachCount >= 5 ? 28 : breachCount >= 2 ? 45 : 60;
  const scoreColor = score < 30 ? "#e05c4b" : score < 50 ? "#c48b20" : "#6c9ef7";
  const threatLabel = score < 30 ? "Critical" : score < 50 ? "High Risk" : "Medium";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Breach Alert — ScanMyCreds</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><span style="font-size:11px;font-weight:800;letter-spacing:0.2em;color:rgba(255,255,255,0.3);text-transform:uppercase;">SCANMYCREDS</span></td>
                  <td align="right"><span style="font-size:10px;color:rgba(255,255,255,0.2);">Breach Monitoring Alert</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(224,92,75,0.08);border:1px solid rgba(224,92,75,0.35);border-radius:16px;overflow:hidden;">
                <tr><td style="height:3px;background:linear-gradient(to right,#e05c4b,#b47fe8);font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:28px 32px;">
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td style="padding-right:12px;vertical-align:middle;">
                          <div style="width:40px;height:40px;border-radius:50%;background:rgba(224,92,75,0.15);border:1px solid rgba(224,92,75,0.4);text-align:center;line-height:40px;font-size:18px;">⚠</div>
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);text-transform:uppercase;margin-bottom:4px;">Breach detected</p>
                          <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em;">New breach found</h1>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 20px;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;">
                      Your monitored email address
                      <span style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:5px;padding:2px 10px;margin:0 4px;color:#fff;font-weight:600;">${email}</span>
                      has appeared in ${newBreaches} new breach${newBreaches > 1 ? "es" : ""}.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                      <tr>
                        <td width="33%" style="padding-right:8px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;">
                            <tr><td style="padding:14px;text-align:center;">
                              <p style="margin:0;font-size:28px;font-weight:800;color:${scoreColor};letter-spacing:-0.03em;">${score}</p>
                              <p style="margin:4px 0 0;font-size:9px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.1em;">Security Score</p>
                            </td></tr>
                          </table>
                        </td>
                        <td width="33%" style="padding-right:8px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;">
                            <tr><td style="padding:14px;text-align:center;">
                              <p style="margin:0;font-size:28px;font-weight:800;color:#e05c4b;letter-spacing:-0.03em;">+${newBreaches}</p>
                              <p style="margin:4px 0 0;font-size:9px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.1em;">New Breaches</p>
                            </td></tr>
                          </table>
                        </td>
                        <td width="33%">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.07);border-radius:10px;">
                            <tr><td style="padding:14px;text-align:center;">
                              <p style="margin:0;font-size:28px;font-weight:800;color:#c48b20;letter-spacing:-0.03em;">${breachCount}</p>
                              <p style="margin:4px 0 0;font-size:9px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.1em;">Total Found</p>
                            </td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-bottom:20px;">
                      <span style="display:inline-flex;align-items:center;gap:6px;background:${scoreColor}18;border:1px solid ${scoreColor}40;border-radius:100px;padding:5px 14px;">
                        <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${scoreColor};"></span>
                        <span style="font-size:11px;font-weight:700;color:${scoreColor};">${threatLabel}</span>
                      </span>
                    </div>
                    ${breachSources.length > 0 ? `
                    <div style="margin-bottom:24px;">
                      <p style="margin:0 0 10px;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);text-transform:uppercase;">Breach sources</p>
                      <div>${sourcesList}${moreCount > 0 ? `<span style="display:inline-block;margin:3px;padding:3px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:4px;font-size:12px;color:rgba(255,255,255,0.3);">+${moreCount} more</span>` : ""}</div>
                    </div>
                    ` : ""}
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:10px;">
                          <a href="https://www.scanmycreds.com/app" style="display:inline-block;background:#fff;color:#000;font-weight:700;font-size:13px;padding:13px 28px;border-radius:9px;text-decoration:none;letter-spacing:-0.01em;">View Full Report →</a>
                        </td>
                        <td>
                          <a href="https://www.scanmycreds.com/app/tools" style="display:inline-block;background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.6);font-weight:600;font-size:13px;padding:13px 20px;border-radius:9px;text-decoration:none;border:1px solid rgba(255,255,255,0.1);">Change Password</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:14px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 14px;font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);text-transform:uppercase;">Immediate actions</p>
                    ${[
                      { color: "#e05c4b", text: "Change your password for this email account immediately" },
                      { color: "#c48b20", text: "Enable 2FA on all accounts linked to this email" },
                      { color: "#6c9ef7", text: "Check if you reused this password on other sites" },
                      { color: "#b47fe8", text: "Be alert for phishing emails — your address is now known to attackers" },
                    ].map(a => `
                      <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;width:100%;">
                        <tr>
                          <td width="16" style="vertical-align:top;padding-top:5px;">
                            <div style="width:6px;height:6px;border-radius:50%;background:${a.color};"></div>
                          </td>
                          <td style="padding-left:8px;">
                            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.55;">${a.text}</p>
                          </td>
                        </tr>
                      </table>
                    `).join("")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.07);padding-top:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
                      You're receiving this because <strong style="color:rgba(255,255,255,0.35);">${email}</strong> is on your ScanMyCreds watchlist.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:8px;">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.12);">
                      © 2026 ScanMyCreds · k-Anonymity · Zero data retention ·
                      <a href="https://www.scanmycreds.com/app/watchlist" style="color:rgba(255,255,255,0.25);text-decoration:none;">Manage watchlist</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Pull latest breaches from HIBP and cache with AI summaries
    try {
      const hibpRes = await fetch("https://haveibeenpwned.com/api/v3/breaches", {
        headers: { "hibp-api-key": process.env.HIBP_API_KEY || "" },
      });
      if (hibpRes.ok) {
        const allBreaches = await hibpRes.json();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        for (const breach of allBreaches) {
          if (new Date(breach.AddedDate) < thirtyDaysAgo) continue;
          const existing = await BreachNews.findOne({ name: breach.Name });
          if (!existing) {
            const summary = await summarizeBreachForNews(
              breach.Name, breach.Domain, breach.DataClasses, breach.PwnCount
            );
            await BreachNews.create({
              name: breach.Name,
              domain: breach.Domain,
              breachDate: breach.BreachDate,
              addedDate: new Date(breach.AddedDate),
              pwnCount: breach.PwnCount,
              dataClasses: breach.DataClasses,
              aiSummary: summary,
              isVerified: breach.IsVerified,
              isFabricated: breach.IsFabricated,
              isSensitive: breach.IsSensitive,
              severity: computeSeverity(breach.DataClasses, breach.PwnCount),
            });
          }
        }
      }
    } catch (err) {
      console.error("Breach news fetch error:", err);
    }

    // Check all watched emails and send alerts
    const watchedEmails = await WatchedEmail.find({ active: true });
    let checkedCount = 0;
    let alertCount = 0;
    const errors: string[] = [];

    for (const watched of watchedEmails) {
      try {
        checkedCount++;
        const breachData = await checkEmailBreaches(watched.email);
        const currentCount = breachData?.breachCount || 0;
        const previousCount = watched.lastBreachCount || 0;

        if (currentCount > previousCount) {
          const newBreaches = currentCount - previousCount;
          const sources = breachData?.breachSources || [];

          await resend.emails.send({
            from: "ScanMyCreds <noreply@scanmycreds.com>",
            to: watched.alertEmail || watched.userId,
            subject: `⚠ ${newBreaches} new breach${newBreaches > 1 ? "es" : ""} detected — ${watched.email}`,
            html: buildAlertEmail(watched.email, currentCount, newBreaches, sources),
          });

          await WatchedEmail.findByIdAndUpdate(watched._id, {
            lastBreachCount: currentCount,
            lastChecked: new Date(),
          });

          alertCount++;
        } else {
          await WatchedEmail.findByIdAndUpdate(watched._id, {
            lastChecked: new Date(),
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${watched.email}: ${msg}`);
        console.error(`Cron error for ${watched.email}:`, err);
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
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}