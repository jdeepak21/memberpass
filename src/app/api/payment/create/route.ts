
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const planPrices = {
  Basic: 1999,
  Premium: 5999,
  Enterprise: 14999,
} as const;

export async function POST() {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in before making a payment." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("requested_plan, membership_status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Membership profile not found." },
        { status: 404 }
      );
    }

    const plan = profile.requested_plan as keyof typeof planPrices;

    if (!Object.prototype.hasOwnProperty.call(planPrices, plan)) {
      return NextResponse.json(
        { error: "Invalid membership plan." },
        { status: 400 }
      );
    }

    if (profile.membership_status === "active") {
      return NextResponse.json(
        { error: "Your membership is already active." },
        { status: 409 }
      );
    }

    const amount = planPrices[plan] * 100;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `mbx_${Date.now()}`,
      notes: {
        user_id: user.id,
        membership_plan: plan,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: paymentRecordError } = await admin
      .from("membership_payments")
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        plan,
        amount,
        currency: "INR",
        status: "pending",
      });

    if (paymentRecordError) {
      console.error("Payment record error:", paymentRecordError);

      return NextResponse.json(
        { error: "Unable to save payment order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      plan,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);

    return NextResponse.json(
      { error: "Unable to create payment order." },
      { status: 500 }
    );
  }
}
