
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
        background: "#080b12",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "60px auto",
          padding: "36px",
          border: "1px solid #252b3a",
          borderRadius: "18px",
          background: "#111622",
        }}
      >
        <p style={{ color: "#a99cff", marginBottom: "12px" }}>
          MEMBRIX MEMBER PORTAL
        </p>

        <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
          Welcome, {fullName}!
        </h1>

        <p style={{ color: "#9ca3af", marginBottom: "28px" }}>
          {isActive
            ? "Your membership is active. Show your pass at the studio."
            : "Complete your payment to activate your membership."}
        </p>

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
            background: "#0b101b",
            border: "1px solid #343b4d",
            marginBottom: "24px",
          }}
        >
          <p style={{ color: "#9ca3af", marginBottom: "8px" }}>
            Registered email
          </p>
          <p>{user.email}</p>
        </div>

        {/* ── Membership status ── */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#0b101b",
            border: "1px solid #343b4d",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", marginBottom: "18px" }}>
            Membership Details
          </h2>

          <p style={{ color: "#9ca3af", marginBottom: "4px" }}>Plan</p>
          <p style={{ marginBottom: "16px" }}>{membershipPlan}</p>

          <p style={{ color: "#9ca3af", marginBottom: "4px" }}>Status</p>
          <p
            style={{
              color: isActive ? "#4ade80" : "#fbbf24",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            {membershipStatus.toUpperCase()}
          </p>

          {profileError && (
            <p style={{ color: "#fca5a5", marginTop: "12px" }}>
              We could not load your membership details. Please try again later.
            </p>
          )}

          {/* Pay Now — only when membership is not active */}
          {!isActive && (
            <div style={{ marginTop: "20px" }}>
              <p style={{ color: "#9ca3af", marginBottom: "14px" }}>
                Complete your payment to activate your membership and get your
                digital pass.
              </p>
              <PayNowButton email={user.email || ""} />
            </div>
          )}
        </div>

        <form action={handleLogout}>
          <button
            type="submit"
            style={{
              padding: "13px 24px",
              border: "none",
              borderRadius: "9px",
              background: "#343b4d",
              color: "#ffffff",
              fontWeight: 700,
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
            background: "#080b12",
            color: "#ffffff",
          }}
        >
          Loading your Membrix dashboard...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
