import { NextResponse } from "next/server";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  await connection();
  try {
    // 1. Verify cron authorization if CRON_SECRET is configured
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized cron trigger." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 2. Fetch all profiles
    const { data: profiles, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name, membership_plan, requested_plan, membership_status");

    if (profileError) {
      console.error("Cron daily-check profile query error:", profileError);
      return NextResponse.json(
        { error: "Failed to query member profiles." },
        { status: 500 }
      );
    }

    const allProfiles = profiles || [];
    const activeProfiles = allProfiles.filter((p) => p.membership_status === "active");
    const pausedProfiles = allProfiles.filter((p) => p.membership_status === "paused");
    const pendingProfiles = allProfiles.filter((p) => p.membership_status === "pending");

    // 3. Find attendance logs to detect inactive practitioners (> 14 days without a visit)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: recentLogs } = await admin
      .from("attendance_logs")
      .select("member_id, scanned_at")
      .eq("scan_result", "granted")
      .gte("scanned_at", fourteenDaysAgo);

    const activeMemberIdsWithRecentVisit = new Set(
      (recentLogs || []).map((l) => l.member_id).filter(Boolean)
    );

    // Identify active members who have not visited in the last 14 days
    const inactiveMembers = activeProfiles
      .filter((p) => !activeMemberIdsWithRecentVisit.has(p.id))
      .map((p) => ({
        id: p.id,
        name: p.full_name,
        plan: p.membership_plan || p.requested_plan || "Basic",
        needsReengagement: true,
      }));

    // 4. Return daily health summary
    return NextResponse.json({
      success: true,
      studio: "Thendral Yoga Loft, Coimbatore",
      executedAt: new Date().toISOString(),
      summary: {
        totalMembers: allProfiles.length,
        activeMembers: activeProfiles.length,
        pausedMembers: pausedProfiles.length,
        pendingPayments: pendingProfiles.length,
        inactiveOver14DaysCount: inactiveMembers.length,
      },
      inactiveMembersForReengagement: inactiveMembers.slice(0, 50),
    });
  } catch (error) {
    console.error("Cron daily check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during daily scheduled check.",
      },
      { status: 500 }
    );
  }
}
