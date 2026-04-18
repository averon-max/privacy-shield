import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Dynamically import models to avoid TypeScript issues
    const WatchedEmail = (await import('@/models/WatchedEmail')).default;
    const Resend = (await import('resend')).Resend;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get all active watched emails
    const watchedEmails = await WatchedEmail.find({ active: true });

    let alertCount = 0;
    let checkedCount = 0;

    for (const watched of watchedEmails) {
      try {
        checkedCount++;

        // Dynamically import breach check service
        const { checkEmailBreaches } = await import('@/services/checkEmailService');
        const breachData = await checkEmailBreaches(watched.email);

        if (breachData && breachData.breachCount > (watched.lastBreachCount || 0)) {
          // New breach detected - send alert
          await resend.emails.send({
            from: 'ScanMyCreds <onboarding@resend.dev>',
            to: watched.alertEmail || watched.email,
            subject: '🚨 New Breach Detected',
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h1 style="color: #e05c4b;">New Breach Alert</h1>
                <p>Your email <strong>${watched.email}</strong> appeared in new breach(es).</p>
                <p><strong>Total Breaches:</strong> ${breachData.breachCount}</p>
                <p><strong>New Since Last Check:</strong> ${breachData.breachCount - (watched.lastBreachCount || 0)}</p>
                <br/>
                <a href="https://www.scanmycreds.com/app/dashboard" 
                   style="background: #6c9ef7; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  View Details
                </a>
              </div>
            `,
          });

          // Update last breach count
          await WatchedEmail.findByIdAndUpdate(watched._id, {
            lastBreachCount: breachData.breachCount,
            lastChecked: new Date(),
          });

          alertCount++;
        }
      } catch (emailError) {
        console.error(`Error checking ${watched.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      checked: checkedCount,
      alerts: alertCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cron job error:', error);

    return NextResponse.json(
      {
        error: 'Cron failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export {};