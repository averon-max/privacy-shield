import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Not configured" }, { status: 500 });

    const { default: Stripe } = await import("stripe");
    const stripe = new (Stripe as any)(key);

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: any;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectDB();

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const email = s.metadata?.userEmail;
        const plan = s.metadata?.plan || "pro";
        if (email) {
          await User.findOneAndUpdate({ email }, { isPro: true, plan, stripeSubscriptionId: s.subscription });
          console.log(plan + " activated for " + email);
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customer = await stripe.customers.retrieve(invoice.customer);
        if (customer.email) {
          await User.findOneAndUpdate({ email: customer.email }, { isPro: true });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer.email) {
          await User.findOneAndUpdate(
            { email: customer.email },
            { isPro: false, plan: "free", stripeSubscriptionId: null, proCancelledAt: new Date() }
          );
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        if (customer.email && sub.status !== "active") {
          await User.findOneAndUpdate({ email: customer.email }, { isPro: false, plan: "free" });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}