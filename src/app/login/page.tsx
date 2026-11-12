
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
          Welcome back
        </h1>

        <p style={{ color: "#9ca3af", marginBottom: "28px" }}>
          Log in to access your Membrix membership.
        </p>

        <form onSubmit={handleLogin}>
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
            placeholder="Enter your password"
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
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {message && (
          <p role="alert" style={{ marginTop: "18px", color: "#fca5a5" }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: "24px", color: "#9ca3af" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#a99cff" }}>
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
  marginBottom: "20px",
  border: "1px solid #343b4d",
  borderRadius: "8px",
  background: "#0b101b",
  color: "#ffffff",
  outline: "none",
};
