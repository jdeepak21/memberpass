
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment configuration is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid payment details." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: paymentRecord, error: recordError } = await admin
      .from("membership_payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (recordError || !paymentRecord) {
      return NextResponse.json(
        { error: "Payment order not found." },
        { status: 404 }
      );
    }

    if (paymentRecord.status !== "pending") {
      return NextResponse.json(
        { error: "This payment has already been processed." },
        { status: 409 }
      );
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${paymentRecord.razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== paymentRecord.razorpay_order_id ||
      payment.amount !== paymentRecord.amount ||
      payment.currency !== paymentRecord.currency ||
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return NextResponse.json(
        { error: "Payment is not successfully captured." },
        { status: 400 }
      );
    }

    const { data: activated, error: activationError } = await admin.rpc(
      "activate_membership_payment",
      {
        p_user_id: user.id,
        p_order_id: paymentRecord.razorpay_order_id,
        p_payment_id: razorpay_payment_id,
      }
    );

    if (activationError || activated !== true) {
      console.error("Membership activation error:", activationError);

      return NextResponse.json(
        { error: "Unable to activate membership." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and membership activated.",
      plan: paymentRecord.plan,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 500 }
    );
  }
}
