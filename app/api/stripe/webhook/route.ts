import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-04-10" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    // Payment succeeded — activate Pro
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.userEmail;
      const subscriptionId = session.subscription as string;
      if (email) {
        await User.findOneAndUpdate(
          { email },
          { isPro: true, stripeSubscriptionId: subscriptionId }
        );
        console.log(`✅ Pro activated for ${email}`);
      }
      break;
    }

    // Subscription renewed
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const email = customer.email;
      if (email) {
        await User.findOneAndUpdate({ email }, { isPro: true });
        console.log(`✅ Pro renewed for ${email}`);
      }
      break;
    }

    // Payment failed — keep Pro for now, Stripe will retry
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.warn(`⚠ Payment failed for customer ${invoice.customer}`);
      break;
    }

    // Subscription cancelled
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const email = customer.email;
      if (email) {
        await User.findOneAndUpdate(
          { email },
          { isPro: false, stripeSubscriptionId: null, proCancelledAt: new Date() }
        );
        console.log(`❌ Pro cancelled for ${email}`);
      }
      break;
    }

    // Subscription paused/updated
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      const email = customer.email;
      if (email && sub.status !== "active") {
        await User.findOneAndUpdate({ email }, { isPro: false });
        console.log(`⚠ Pro deactivated (status: ${sub.status}) for ${email}`);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}