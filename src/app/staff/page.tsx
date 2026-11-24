
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StaffScannerClient from "./StaffScannerClient";

async function StaffPageContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: roleRecord } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const role = roleRecord?.role as "staff" | "admin" | undefined;
  const isAuthorized = role === "staff" || role === "admin";

  if (!isAuthorized) {
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
            maxWidth: "480px",
            width: "100%",
            padding: "36px",
            borderRadius: "18px",
            background: "#111b15",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            boxShadow: "0 20px 45px rgba(0, 0, 0, 0.5)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 16px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #f87171",
              display: "grid",
              placeItems: "center",
              fontSize: "24px",
            }}
          >
            🔒
          </div>

          <p
            style={{
              color: "#f87171",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              marginBottom: "8px",
            }}
          >
            RESTRICTED ACCESS
          </p>

          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 12px" }}>
            Staff Scanner Portal
          </h1>

          <p
            style={{
              color: "#8a968e",
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            This portal is reserved for studio receptionists and administrators of{" "}
            <strong>Thendral Yoga Loft, Coimbatore</strong> to verify member entry passes.
          </p>

          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "#080e0a",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#6b7a70",
            }}
          >
            Signed in as: <strong style={{ color: "#f3ede4" }}>{user.email}</strong>
            <br />
            Current role: <strong style={{ color: "#fbbf24" }}>{role || "customer"}</strong>
          </div>

          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "#3d7a5a",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            ← Return to Member Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0c1310",
        color: "#f3ede4",
        padding: "24px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto 20px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Link
          href="/staff/re-engagement"
          style={{
            display: "inline-block",
            padding: "11px 18px",
            borderRadius: "8px",
            background: "#3d7a5a",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          ✨ AI Re-engagement Assistant →
        </Link>
      </div>

      <StaffScannerClient staffEmail={user.email ?? "staff"} role={role} />
    </main>
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#0c1310",
            color: "#f3ede4",
          }}
        >
          Loading Thendral Yoga Loft Staff Scanner...
        </main>
      }
    >
      <StaffPageContent />
    </Suspense>
  );
}
