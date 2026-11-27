
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
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

  if (profileError) {
    console.error("Dashboard profile error:", profileError);
  }

  // Fetch user role (staff/admin check).
  const { data: roleRecord, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    console.error("Dashboard role error:", roleError);
  }

  const isStaffOrAdmin =
    roleRecord?.role === "staff" || roleRecord?.role === "admin";

  // Determine the member's plan before loading attendance usage.
  // Premium and Enterprise plans include unlimited classes, so only Basic
  // members need an attendance count.
  const membershipPlan =
    profile?.membership_plan || profile?.requested_plan || "Basic";
  const isBasic = membershipPlan === "Basic";

  let attendanceAvailable = true;
  let classesAttended = 0;

  if (isBasic) {
    // Count verified attendance entries for the current India calendar month.
    const now = new Date();

    const indiaParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
    }).formatToParts(now);

    const indiaYear = Number(
      indiaParts.find((part) => part.type === "year")?.value
    );

    const indiaMonth = Number(
      indiaParts.find((part) => part.type === "month")?.value
    );

    // India is UTC+05:30. Convert India month boundaries to UTC.
    const indiaOffsetMs = 330 * 60 * 1000;

    const monthStartUtc = new Date(
      Date.UTC(indiaYear, indiaMonth - 1, 1) - indiaOffsetMs
    ).toISOString();

    const monthEndUtc = new Date(
      Date.UTC(indiaYear, indiaMonth, 1) - indiaOffsetMs
    ).toISOString();

    const {
      count: attendanceCount,
      error: attendanceError,
    } = await supabase
      .from("attendance_logs")
      .select("*", { count: "exact", head: true })
      .eq("member_id", user.id)
      .eq("status", "granted")
      .gte("scanned_at", monthStartUtc)
      .lt("scanned_at", monthEndUtc);

    if (attendanceError) {
      console.error("Dashboard attendance count error:", attendanceError);
      attendanceAvailable = false;
    } else {
      classesAttended = attendanceCount ?? 0;
    }
  }

  // Logout server action.
  async function handleLogout() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  // Toggle Pause / Resume server action.
  async function handleTogglePause() {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    // The database function checks the user's own membership
    // and performs the pause/resume securely.
    const { data, error: pauseError } = await supabase.rpc(
      "toggle_membership_pause"
    );

    if (pauseError) {
      console.error("Membership pause/resume error:", pauseError);
      throw new Error(
        "Membership status could not be updated. Please try again."
      );
    }

    const result = data as {
      success?: boolean;
      message?: string;
    } | null;

    if (!result?.success) {
      throw new Error(
        result?.message || "Membership status could not be updated."
      );
    }

    redirect("/dashboard");
  }

  const fullName = user.user_metadata?.full_name || "Member";

  const membershipStatus = profile?.membership_status || "pending";
  const isActive = membershipStatus === "active";
  const isPaused = membershipStatus === "paused";

  const basicLimit = 8;
  const classesRemaining = Math.max(0, basicLimit - classesAttended);

  const basicUsagePercent = Math.min(
    100,
    Math.round((classesAttended / basicLimit) * 100)
  );

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
        {/* Staff Portal Banner (shown to staff/admins) */}
        {isStaffOrAdmin && (
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              background: "rgba(125, 209, 161, 0.12)",
              border: "1px solid rgba(125, 209, 161, 0.35)",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#7dd1a1",
                  letterSpacing: "1px",
                }}
              >
                STAFF / RECEPTION PORTAL
              </span>

              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "13px",
                  color: "#f3ede4",
                }}
              >
                You have{" "}
                <strong>{roleRecord?.role?.toUpperCase()}</strong> access to
                the studio QR scanner.
              </p>
            </div>

            <Link
              href="/staff"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#3d7a5a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              Open Staff Scanner →
            </Link>
          </div>
        )}

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

          <h1
            style={{
              fontSize: "30px",
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Welcome, {fullName}!
          </h1>

          <p style={{ color: "#8a968e", margin: 0, fontSize: "15px" }}>
            {isActive
              ? "Your yoga studio membership is active. Present your QR pass upon entry."
              : isPaused
                ? "Your yoga membership is currently paused. Resume anytime to reactivate your pass."
                : "Complete your online payment to activate your membership and studio pass."}
          </p>
        </div>

        {/* Digital membership pass (shown when active or paused) */}
        {(isActive || isPaused) && (
          <MembershipPassCard
            userId={user.id}
            fullName={fullName}
            plan={membershipPlan}
            email={user.email ?? ""}
            status={membershipStatus}
          />
        )}

        {/* 8-Class Allowance Tracker (for Basic Plan) */}
        {(isActive || isPaused) && (
          <div
            style={{
              padding: "20px",
              borderRadius: "12px",
              background: "#0a110d",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <h2
                style={{
                  fontSize: "15px",
                  margin: 0,
                  fontWeight: 700,
                  color: "#f3ede4",
                }}
              >
                {isBasic
                  ? "Monthly Class Allowance (Basic Plan)"
                  : "Studio Session Usage"}
              </h2>

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color:
                    isBasic && !attendanceAvailable
                      ? "#fbbf24"
                      : isBasic && classesRemaining === 0
                        ? "#f87171"
                        : "#7dd1a1",
                }}
              >
                {isBasic
                  ? attendanceAvailable
                    ? `${classesAttended} / ${basicLimit} Classes Used`
                    : "Usage unavailable"
                  : "Unlimited Classes"}
              </span>
            </div>

            {isBasic ? (
              <div>
                {attendanceAvailable ? (
                  <>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "rgba(255, 255, 255, 0.08)",
                        borderRadius: "4px",
                        overflow: "hidden",
                        margin: "10px 0 8px",
                      }}
                    >
                      <div
                        style={{
                          width: `${basicUsagePercent}%`,
                          height: "100%",
                          background:
                            classesRemaining === 0
                              ? "#f87171"
                              : classesRemaining <= 2
                                ? "#fbbf24"
                                : "#4ade80",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#8a968e",
                      }}
                    >
                      {classesRemaining > 0
                        ? `You have ${classesRemaining} class${classesRemaining === 1 ? "" : "es"} remaining this calendar month.`
                        : "You have completed all 8 classes for this calendar month."}
                    </p>
                  </>
                ) : (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#fbbf24",
                    }}
                  >
                    We could not load your attendance usage. Please try again
                    later.
                  </p>
                )}
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#8a968e",
                }}
              >
                Your {membershipPlan} plan includes unlimited studio classes
                at Thendral Yoga Loft.
              </p>
            )}
          </div>
        )}

        {/* Account details */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#0a110d",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              color: "#6b7a70",
              fontSize: "12px",
              fontWeight: 600,
              margin: "0 0 6px",
            }}
          >
            REGISTERED EMAIL
          </p>

          <p style={{ margin: 0, fontSize: "15px", color: "#f3ede4" }}>
            {user.email}
          </p>
        </div>

        {/* Membership status & actions */}
        <div
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#0a110d",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            marginBottom: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              margin: "0 0 16px",
              fontWeight: 700,
            }}
          >
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
              <p
                style={{
                  color: "#6b7a70",
                  fontSize: "12px",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                PLAN
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#f3ede4",
                }}
              >
                {membershipPlan} Plan
              </p>
            </div>

            <div>
              <p
                style={{
                  color: "#6b7a70",
                  fontSize: "12px",
                  fontWeight: 600,
                  margin: "0 0 4px",
                }}
              >
                STATUS
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: isActive
                    ? "#4ade80"
                    : isPaused
                      ? "#fbbf24"
                      : "#fbbf24",
                }}
              >
                {membershipStatus.toUpperCase()}
              </p>
            </div>
          </div>

          {profileError && (
            <p
              style={{
                color: "#fca5a5",
                marginTop: "12px",
                fontSize: "13px",
              }}
            >
              We could not load your membership details. Please try again
              later.
            </p>
          )}

          {/* Pay Now — only when membership is not active and not paused */}
          {!isActive && !isPaused && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <p
                style={{
                  color: "#8a968e",
                  fontSize: "14px",
                  marginBottom: "14px",
                }}
              >
                Activate your membership through secure Razorpay payment:
              </p>

              <PayNowButton email={user.email || ""} />
            </div>
          )}

          {/* Pause / Resume Controls (for active or paused members) */}
          {(isActive || isPaused) && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#f3ede4",
                  }}
                >
                  {isActive
                    ? "Need to take a break?"
                    : "Ready to return to yoga?"}
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#8a968e",
                  }}
                >
                  {isActive
                    ? "Temporarily pause your membership. Your pass will be inactive until resumed."
                    : "Your membership is paused. Click Resume to reactivate your studio pass."}
                </p>
              </div>

              <form action={handleTogglePause}>
                <button
                  type="submit"
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: isPaused
                      ? "1px solid #4ade80"
                      : "1px solid rgba(251, 191, 36, 0.5)",
                    background: isPaused
                      ? "rgba(74, 222, 128, 0.15)"
                      : "rgba(251, 191, 36, 0.15)",
                    color: isPaused ? "#4ade80" : "#fbbf24",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {isPaused
                    ? "▶️ Resume Membership"
                    : "⏸️ Pause Membership"}
                </button>
              </form>
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
