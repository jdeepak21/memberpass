
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const planDetails = {
  Basic: {
    price: "₹1,999",
    description: "Essential digital access for local club exploration and city events.",
  },
  Premium: {
    price: "₹5,999",
    description: "Complete global passport for frequent travelers and lifestyle enthusiasts.",
  },
  Enterprise: {
    price: "₹14,999",
    description: "Sovereign infrastructure for family offices, clubs, and executive teams.",
  },
};

type PlanName = keyof typeof planDetails;

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlan] = useState<PlanName>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const plan = params.get("plan");
      if (plan && Object.prototype.hasOwnProperty.call(planDetails, plan)) {
        return plan as PlanName;
      }
    }
    return "Basic";
  });

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
            membership_plan: selectedPlan,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Account created! Please check your email and click the verification link."
        );
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#080b12",
        color: "#ffffff",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "430px",
          padding: "36px",
          border: "1px solid #252b3a",
          borderRadius: "18px",
          background: "#111622",
        }}
      >
        <h1 style={{ fontSize: "30px", marginBottom: "8px" }}>
          Create your account
        </h1>

        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
          Join Membrix and get your digital membership pass.
        </p>

        {/* Selected membership plan */}
        <div
          style={{
            padding: "18px",
            marginBottom: "28px",
            border: "1px solid #8b7cff",
            borderRadius: "12px",
            background: "#19182c",
          }}
        >
          <p
            style={{
              color: "#a99cff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              marginBottom: "8px",
            }}
          >
            YOUR SELECTED MEMBERSHIP
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <h2 style={{ fontSize: "24px" }}>{selectedPlan}</h2>

            <strong style={{ fontSize: "20px", color: "#c4b5fd" }}>
              {planDetails[selectedPlan].price}
            </strong>
          </div>

          <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "8px" }}>
            {planDetails[selectedPlan].description}
          </p>

          <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "8px" }}>
            Billed monthly
          </p>

          <Link
            href="/#pricing"
            style={{
              display: "inline-block",
              marginTop: "14px",
              color: "#a99cff",
              fontSize: "13px",
            }}
          >
            ← Change membership plan
          </Link>
        </div>

        <form onSubmit={handleSignup}>
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            style={inputStyle}
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "12px",
              border: "none",
              borderRadius: "9px",
              background: "#8b7cff",
              color: "#ffffff",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : `Continue with ${selectedPlan}`}
          </button>
        </form>

        {message && (
          <p
            role="status"
            style={{
              marginTop: "18px",
              color: "#c4b5fd",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "24px", color: "#9ca3af" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#a99cff" }}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "20px",
  border: "1px solid #343b4d",
  borderRadius: "8px",
  background: "#0b101b",
  color: "#ffffff",
  outline: "none",
};
