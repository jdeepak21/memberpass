import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers.get("x-razorpay-signature");

    if (!webhookSecret || !signature) {
      return NextResponse.json(
        { error: "Webhook configuration is missing." },
        { status: 400 }
      );
    }

    // Read the original request body for signature verification.
    const rawBody = await request.text();

    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const body = JSON.parse(rawBody);

    const payment = body?.payload?.payment?.entity;

    if (!payment?.order_id || !payment?.id) {
      return NextResponse.json(
        { error: "Invalid payment event." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const { data: paymentRecord, error: recordError } = await admin
      .from("membership_payments")
      .select("*")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (recordError || !paymentRecord) {
      console.error("Webhook payment record error:", recordError);

      return NextResponse.json(
        { error: "Payment order not found." },
        { status: 404 }
      );
    }

    if (
      payment.amount !== paymentRecord.amount ||
      payment.currency !== paymentRecord.currency
    ) {
      return NextResponse.json(
        { error: "Payment details do not match." },
        { status: 400 }
      );
    }

    // Handle successful payment.
    if (body.event === "payment.captured") {
      if (payment.status !== "captured") {
        return NextResponse.json(
          { error: "Payment is not captured." },
          { status: 400 }
        );
      }

      if (
        paymentRecord.status === "verified" &&
        paymentRecord.razorpay_payment_id === payment.id
      ) {
        return NextResponse.json({ received: true });
      }

      if (paymentRecord.status === "failed") {
        const { error: resetError } = await admin
          .from("membership_payments")
          .update({
            status: "pending",
            razorpay_payment_id: null,
          })
          .eq("razorpay_order_id", payment.order_id)
          .eq("status", "failed");

        if (resetError) {
          console.error("Webhook payment reset error:", resetError);

          return NextResponse.json(
            { error: "Unable to process payment." },
            { status: 500 }
          );
        }
      }

      const { data: activated, error: activationError } = await admin.rpc(
        "activate_membership_payment",
        {
          p_user_id: paymentRecord.user_id,
          p_order_id: payment.order_id,
          p_payment_id: payment.id,
        }
      );

      if (activationError || activated !== true) {
        console.error("Webhook activation error:", activationError);

        return NextResponse.json(
          { error: "Membership activation failed." },
          { status: 500 }
        );
      }

      return NextResponse.json({ received: true });
    }

    // Handle failed payment.
    if (body.event === "payment.failed") {
      if (paymentRecord.status === "verified") {
        return NextResponse.json({ received: true });
      }

      const { error: updateError } = await admin
        .from("membership_payments")
        .update({
          status: "failed",
          razorpay_payment_id: payment.id,
        })
        .eq("razorpay_order_id", payment.order_id)
        .eq("status", "pending");

      if (updateError) {
        console.error("Webhook failure update error:", updateError);

        return NextResponse.json(
          { error: "Unable to update payment status." },
          { status: 500 }
        );
      }

      return NextResponse.json({ received: true });
    }

    // Acknowledge other events without changing payment records.
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}