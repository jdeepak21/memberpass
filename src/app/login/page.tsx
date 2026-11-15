"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
          maxWidth: "430px",
          padding: "36px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          background: "#111b15",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <p
            style={{
              color: "#7dd1a1",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              marginBottom: "8px",
            }}
          >
            THENDRAL YOGA LOFT
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>
            Member Login
          </h1>
          <p style={{ color: "#8a968e", fontSize: "14px", margin: 0 }}>
            Sign in to access your digital yoga studio pass and membership.
          </p>
        </div>

        <form onSubmit={handleLogin}>
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
            placeholder="Enter your password"
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
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {message && (
          <p role="alert" style={{ marginTop: "18px", color: "#fca5a5", fontSize: "14px" }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: "24px", color: "#8a968e", fontSize: "14px" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#7dd1a1", fontWeight: 600 }}>
            Sign up
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
