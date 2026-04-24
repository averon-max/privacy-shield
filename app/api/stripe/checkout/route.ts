import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.error("STRIPE_SECRET_KEY missing");
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new (Stripe as any)(key);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "family" ? "family" : "pro";
    const priceId = plan === "family"
      ? process.env.STRIPE_FAMILY_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      console.error("Price ID missing for plan: " + plan);
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean() as any;
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || session.user.email,
        metadata: { userId: session.user.email },
      });
      customerId = customer.id;
      await User.findOneAndUpdate({ email: session.user.email }, { stripeCustomerId: customerId });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: process.env.NEXTAUTH_URL + "/app/dashboard?upgraded=true",
      cancel_url: process.env.NEXTAUTH_URL + "/pricing?cancelled=true",
      metadata: { userEmail: session.user.email, plan },
      subscription_data: { metadata: { userEmail: session.user.email, plan } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}