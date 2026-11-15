"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const planDetails = {
  Basic: {
    price: "₹1,999",
    description: "Essential studio membership plan designed for foundational yoga practice.",
  },
  Premium: {
    price: "₹5,999",
    description: "Comprehensive membership plan for dedicated and regular yoga practitioners.",
  },
  Enterprise: {
    price: "₹14,999",
    description: "Custom membership plan for private groups, teams, or organizational wellness.",
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
        background: "#0c1310",
        color: "#f3ede4",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          background: "#111b15",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <p
          style={{
            color: "#7dd1a1",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            marginBottom: "6px",
          }}
        >
          THENDRAL YOGA LOFT
        </p>

        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>
          Join the Studio
        </h1>

        <p style={{ color: "#8a968e", fontSize: "14px", marginBottom: "22px" }}>
          Create an account to activate your yoga membership and digital pass.
        </p>

        {/* Selected membership plan card */}
        <div
          style={{
            padding: "16px 18px",
            marginBottom: "24px",
            border: "1px solid rgba(125, 209, 161, 0.35)",
            borderRadius: "12px",
            background: "#15241b",
          }}
        >
          <p
            style={{
              color: "#7dd1a1",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.2px",
              margin: "0 0 6px",
            }}
          >
            SELECTED MEMBERSHIP PLAN
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <h2 style={{ fontSize: "22px", margin: 0 }}>{selectedPlan} Plan</h2>

            <strong style={{ fontSize: "19px", color: "#7dd1a1" }}>
              {planDetails[selectedPlan].price}
            </strong>
          </div>

          <p style={{ color: "#a5b0a8", fontSize: "13px", margin: "8px 0 0", lineHeight: 1.5 }}>
            {planDetails[selectedPlan].description}
          </p>

          <p style={{ color: "#6b7a70", fontSize: "11px", margin: "6px 0 0" }}>
            Billed monthly • Coimbatore, Tamil Nadu
          </p>

          <Link
            href="/#pricing"
            style={{
              display: "inline-block",
              marginTop: "10px",
              color: "#7dd1a1",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            ← Change plan
          </Link>
        </div>

        <form onSubmit={handleSignup}>
          <label
            htmlFor="name"
            style={{ fontSize: "13px", color: "#b0baa2", fontWeight: 600 }}
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            style={inputStyle}
          />

          <label
            htmlFor="email"
            style={{ fontSize: "13px", color: "#b0baa2", fontWeight: 600 }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={inputStyle}
          />

          <label
            htmlFor="password"
            style={{ fontSize: "13px", color: "#b0baa2", fontWeight: 600 }}
          >
            Password
          </label>
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
              padding: "13px",
              marginTop: "8px",
              border: "none",
              borderRadius: "9px",
              background: "#3d7a5a",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "15px",
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
              marginTop: "16px",
              color: "#7dd1a1",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        )}

        <p style={{ marginTop: "24px", color: "#8a968e", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#7dd1a1", fontWeight: 600 }}>
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
  marginBottom: "18px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "8px",
  background: "#080e0a",
  color: "#f3ede4",
  outline: "none",
  fontSize: "14px",
};
