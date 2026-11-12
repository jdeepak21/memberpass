"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error?: {
    description?: string;
    reason?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    email?: string;
  };
  handler: (response: RazorpayResponse) => void;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions
    ) => {
      open: () => void;
      on: (
        event: "payment.failed",
        callback: (response: RazorpayFailure) => void
      ) => void;
    };
  }
}

export default function PayNowButton({
  email,
}: {
  email: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handlePayment() {
    if (!window.Razorpay) {
      setMessage("Payment system is still loading. Please try again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const orderResponse = await fetch("/api/payment/create", {
        method: "POST",
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.error || "Could not create payment order."
        );
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Membrix",
        description: "Membership Payment",
        order_id: orderData.orderId,
        prefill: {
          email,
        },
        theme: {
          color: "#8b7cff",
        },

        modal: {
          ondismiss: () => {
            setMessage("Payment cancelled. No payment was completed.");
            setLoading(false);
          },
        },

        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || "Payment verification failed."
              );
            }

            setMessage(
              "Payment successful! Your membership is activated."
            );

            router.refresh();
          } catch (error) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        setMessage(
          response.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      checkout.open();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: "13px 24px",
          border: "none",
          borderRadius: "9px",
          background: loading ? "#55516f" : "#8b7cff",
          color: "#ffffff",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "16px",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      {message && (
        <p
          role="status"
          style={{
            color: "#c4b5fd",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
      )}
    </>
  );
}