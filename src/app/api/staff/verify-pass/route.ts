
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  parseMembershipQrPayload,
  SUPPORTED_PLANS,
  MembershipPlan,
} from "@/lib/qr/parsePass";

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
        {
          success: false,
          status: "unauthorized",
          error: "Authentication required. Please log in with your staff account.",
        },
        { status: 401 }
      );
    }

    // 2. Read request body
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          status: "invalid_request",
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    let memberId: string;
    let plan: MembershipPlan;

    // 3. Parse QR code or manual member details
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
    } else if (
      typeof body.memberId === "string" &&
      typeof body.plan === "string"
    ) {
      const trimmedId = body.memberId.trim().toLowerCase();
      const trimmedPlan = body.plan.trim() as MembershipPlan;

      // Validate member UUID
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

      if (!uuidPattern.test(trimmedId)) {
        return NextResponse.json(
          {
            success: false,
            status: "invalid_member_id",
            error: "Please enter a valid member ID.",
          },
          { status: 400 }
        );
      }

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

    // 4. Verify pass through the database RPC
    // The database will enforce staff permissions,
    // membership status, duplicate scans, and monthly limits.
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "verify_member_pass",
      {
        p_member_id: memberId,
        p_scanned_plan: plan,
      }
    );

    if (rpcError) {
      if (
        rpcError.message.includes("Unauthorized") ||
        rpcError.code === "42501"
      ) {
        return NextResponse.json(
          {
            success: false,
            status: "unauthorized",
            error:
              "Access denied. Only studio staff and administrators may verify member passes.",
          },
          { status: 403 }
        );
      }

      console.error("Pass verification RPC error:", rpcError);

      return NextResponse.json(
        {
          success: false,
          status: "error",
          error: "Failed to verify member pass.",
        },
        { status: 500 }
      );
    }

    // 5. Return the database verification result
    return NextResponse.json({
      ...rpcResult,
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
