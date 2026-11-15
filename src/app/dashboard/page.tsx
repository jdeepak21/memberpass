import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import PayNowButton from "./PayNowButton";
import MembershipPassCard from "./MembershipPassCard";

async function DashboardContent() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Protect dashboard from visitors who are not logged in.
  if (error || !user) {
    redirect("/login");
  }

  // Fetch the logged-in member's own profile.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("requested_plan, membership_plan, membership_status")
    .eq("id", user.id)
    .maybeSingle();

  // Logout server action.
  async function handleLogout() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name || "Member";

  // After payment, membership_plan holds the activated plan.
  // Before payment, fall back to requested_plan (the plan they chose).
  const membershipPlan =
    profile?.membership_plan || profile?.requested_plan || "Basic";
  const membershipStatus = profile?.membership_status || "pending";
  const isActive = membershipStatus === "active";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        background: "#0c1310",
        color: "#f3ede4",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "40px auto",
          padding: "36px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "18px",
          background: "#111b15",
          boxShadow: "0 20px 45px rgba(0, 0, 0, 0.45)",
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
            THENDRAL YOGA LOFT • MEMBER PORTAL
          </p>

          <h1 style={{ fontSize: "30px", fontWeight: 700, margin: "0 0 8px" }}>
            Welcome, {fullName}!
          </h1>

          <p style={{ color: "#8a968e", margin: 0, fontSize: "15px" }}>
            {isActive
              ? "Your yoga studio membership is active. Present your QR pass upon entry."
              : "Complete your online payment to activate your membership and studio pass."}
          </p>
        </div>

        {/* ── Digital membership pass (shown only when active) ── */}
        {isActive && (
          <MembershipPassCard
            userId={user.id}
            fullName={fullName}
            plan={membershipPlan}
            email={user.email ?? ""}
          />
        )}

        {/* ── Account details ── */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#0a110d",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            marginBottom: "20px",
          }}
        >
          <p style={{ color: "#6b7a70", fontSize: "12px", fontWeight: 600, margin: "0 0 6px" }}>
            REGISTERED EMAIL
          </p>
          <p style={{ margin: 0, fontSize: "15px", color: "#f3ede4" }}>
            {user.email}
          </p>
        </div>

        {/* ── Membership status ── */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#0a110d",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "18px", margin: "0 0 16px", fontWeight: 700 }}>
            Membership Details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ color: "#6b7a70", fontSize: "12px", fontWeight: 600, margin: "0 0 4px" }}>
                PLAN
              </p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#f3ede4" }}>
                {membershipPlan} Plan
              </p>
            </div>

            <div>
              <p style={{ color: "#6b7a70", fontSize: "12px", fontWeight: 600, margin: "0 0 4px" }}>
                STATUS
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: isActive ? "#4ade80" : "#fbbf24",
                }}
              >
                {membershipStatus.toUpperCase()}
              </p>
            </div>
          </div>

          {profileError && (
            <p style={{ color: "#fca5a5", marginTop: "12px", fontSize: "13px" }}>
              We could not load your membership details. Please try again later.
            </p>
          )}

          {/* Pay Now — only when membership is not active */}
          {!isActive && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <p style={{ color: "#8a968e", fontSize: "14px", marginBottom: "14px" }}>
                Activate your membership through secure Razorpay payment:
              </p>
              <PayNowButton email={user.email || ""} />
            </div>
          )}
        </div>

        <form action={handleLogout}>
          <button
            type="submit"
            style={{
              padding: "11px 22px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#f3ede4",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}

export default function DashboardPage() {
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
          Loading Thendral Yoga Loft dashboard...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
