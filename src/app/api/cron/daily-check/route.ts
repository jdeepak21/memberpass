
import { NextResponse } from "next/server";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ProfileRecord {
  id: string;
  requested_plan: string | null;
  membership_plan: string | null;
  membership_status: string | null;
}

interface AttendanceRecord {
  member_id: string | null;
}

const PAGE_SIZE = 1000;

export async function GET(request: Request) {
  await connection();

  try {
    // 1. Verify cron authorization
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid CRON_SECRET." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // 2. Fetch all profiles using stable pagination
    const allProfiles: ProfileRecord[] = [];
    let profileFrom = 0;

    while (true) {
      const { data, error: profileError } = await admin
        .from("profiles")
        .select("id, requested_plan, membership_plan, membership_status")
        .order("id", { ascending: true })
        .range(profileFrom, profileFrom + PAGE_SIZE - 1);

      if (profileError) {
        console.error("Cron daily-check profile query error:", profileError);

        return NextResponse.json(
          { error: "Failed to query member profiles." },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        break;
      }

      allProfiles.push(...(data as ProfileRecord[]));

      if (data.length < PAGE_SIZE) {
        break;
      }

      profileFrom += PAGE_SIZE;
    }

    const activeProfiles = allProfiles.filter(
      (p) => p.membership_status === "active"
    );

    const pausedProfiles = allProfiles.filter(
      (p) => p.membership_status === "paused"
    );

    const pendingProfiles = allProfiles.filter(
      (p) => p.membership_status === "pending"
    );

    // 3. Find granted attendance logs from the last 14 days
    const fourteenDaysAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    const activeMemberIdsWithRecentVisit = new Set<string>();
    let logFrom = 0;

    while (true) {
      const { data, error: logError } = await admin
        .from("attendance_logs")
        .select("member_id")
        .eq("scan_result", "granted")
        .gte("scanned_at", fourteenDaysAgo)
        .order("scanned_at", { ascending: true })
        .order("id", { ascending: true })
        .range(logFrom, logFrom + PAGE_SIZE - 1);

      if (logError) {
        console.error("Cron daily-check attendance query error:", logError);

        return NextResponse.json(
          { error: "Failed to query attendance logs." },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        break;
      }

      for (const log of data as AttendanceRecord[]) {
        if (log.member_id) {
          activeMemberIdsWithRecentVisit.add(log.member_id);
        }
      }

      if (data.length < PAGE_SIZE) {
        break;
      }

      logFrom += PAGE_SIZE;
    }

    // 4. Identify active members with no visit in over 14 days
    const inactiveActiveMembers = activeProfiles.filter(
      (p) => !activeMemberIdsWithRecentVisit.has(p.id)
    );

    const breakdownByPlan = {
      Basic: inactiveActiveMembers.filter(
        (p) => (p.membership_plan || p.requested_plan) === "Basic"
      ).length,

      Premium: inactiveActiveMembers.filter(
        (p) => (p.membership_plan || p.requested_plan) === "Premium"
      ).length,

      Enterprise: inactiveActiveMembers.filter(
        (p) => (p.membership_plan || p.requested_plan) === "Enterprise"
      ).length,
    };

    // 5. Return aggregate metrics only
    return NextResponse.json({
      success: true,
      studio: "Thendral Yoga Loft, Coimbatore",
      executedAt: new Date().toISOString(),

      summary: {
        totalMembers: allProfiles.length,
        activeMembers: activeProfiles.length,
        pausedMembers: pausedProfiles.length,
        pendingMemberships: pendingProfiles.length,
        inactiveOver14DaysCount: inactiveActiveMembers.length,
      },

      reengagementQueue: {
        pendingOutreachCount: inactiveActiveMembers.length,
        breakdownByPlan,
      },
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
