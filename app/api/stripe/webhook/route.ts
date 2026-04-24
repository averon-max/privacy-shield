import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    // @ts-ignore
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    await connectDB();

    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.userEmail;
        const plan = session.metadata?.plan || "pro";
        const subscriptionId = session.subscription as string;
        if (email) {
          await User.findOneAndUpdate(
            { email },
            { isPro: true, plan, stripeSubscriptionId: subscriptionId }
          );
          console.log(`✅ ${plan} activated for ${email}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        if (customer.email) {
          await User.findOneAndUpdate({ email: customer.email }, { isPro: true });
          console.log(`✅ Pro renewed for ${customer.email}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`⚠ Payment failed for customer ${invoice.customer}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        if (customer.email) {
          await User.findOneAndUpdate(
            { email: customer.email },
            { isPro: false, plan: "free", stripeSubscriptionId: null, proCancelledAt: new Date() }
          );
          console.log(`❌ Cancelled for ${customer.email}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
        if (customer.email && sub.status !== "active") {
          await User.findOneAndUpdate(
            { email: customer.email },
            { isPro: false, plan: "free" }
          );
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