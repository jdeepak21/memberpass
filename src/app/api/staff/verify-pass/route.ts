import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseMembershipQrPayload, SUPPORTED_PLANS, MembershipPlan } from "@/lib/qr/parsePass";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify caller authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in with your staff account." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    let memberId: string;
    let plan: MembershipPlan;

    if (typeof body.qrPayload === "string") {
      const parseResult = parseMembershipQrPayload(body.qrPayload);
      if (!parseResult.valid) {
        return NextResponse.json(
          {
            success: false,
            status: "invalid_qr",
            error: parseResult.error,
            code: parseResult.code,
          },
          { status: 400 }
        );
      }
      memberId = parseResult.data.memberId;
      plan = parseResult.data.plan;
    } else if (typeof body.memberId === "string" && typeof body.plan === "string") {
      const trimmedId = body.memberId.trim().toLowerCase();
      const trimmedPlan = body.plan.trim() as MembershipPlan;

      if (!SUPPORTED_PLANS.includes(trimmedPlan)) {
        return NextResponse.json(
          {
            success: false,
            status: "unsupported_plan",
            error: `Unsupported membership plan: ${trimmedPlan}.`,
          },
          { status: 400 }
        );
      }

      memberId = trimmedId;
      plan = trimmedPlan;
    } else {
      return NextResponse.json(
        {
          success: false,
          status: "invalid_request",
          error: "Either qrPayload or (memberId and plan) must be provided.",
        },
        { status: 400 }
      );
    }

    // 3. Check 8-Class Monthly Allowance for Basic Plan members
    if (plan === "Basic") {
      const { count: currentAttendanceCount } = await supabase
        .from("attendance_logs")
        .select("*", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("scan_result", "granted");

      if ((currentAttendanceCount || 0) >= 8) {
        return NextResponse.json({
          success: false,
          status: "classes_exceeded",
          message:
            "Monthly 8-class limit reached for Basic plan. Member can upgrade to Premium for unlimited classes.",
          classesAttended: currentAttendanceCount,
          verifiedBy: user.email,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 4. Execute verify_member_pass RPC as the authenticated staff user
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "verify_member_pass",
      {
        p_member_id: memberId,
        p_scanned_plan: plan,
      }
    );

    if (rpcError) {
      if (rpcError.message.includes("Unauthorized") || rpcError.code === "42501") {
        return NextResponse.json(
          {
            success: false,
            status: "unauthorized",
            error: "Access denied. Only studio staff and administrators may verify member passes.",
          },
          { status: 403 }
        );
      }

      console.error("Pass verification RPC error:", rpcError);
      return NextResponse.json(
        {
          success: false,
          status: "error",
          error: rpcError.message || "Failed to verify member pass.",
        },
        { status: 500 }
      );
    }

    // Count updated attendance if successful for Basic plan
    let classesAttended: number | undefined;
    if (rpcResult?.success && plan === "Basic") {
      const { count: updatedCount } = await supabase
        .from("attendance_logs")
        .select("*", { count: "exact", head: true })
        .eq("member_id", memberId)
        .eq("scan_result", "granted");
      classesAttended = updatedCount || 1;
    }

    return NextResponse.json({
      ...rpcResult,
      classesAttended,
      verifiedBy: user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unexpected error in verify-pass API:", error);
    return NextResponse.json(
      {
        success: false,
        status: "server_error",
        error: "Internal server error during pass verification.",
      },
      { status: 500 }
    );
  }
}
