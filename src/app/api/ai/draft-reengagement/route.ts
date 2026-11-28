
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const VALID_PLANS = ["Basic", "Premium", "Enterprise"];
const GEMINI_MODEL = "gemini-3.5-flash";
const PAGE_SIZE = 1000;
const GEMINI_TIMEOUT_MS = 25000;
const GEMINI_MAX_ATTEMPTS = 2;

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
};

async function verifyStaffAccess() {
  const sessionClient = await createClient();

  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const { data: roleRecord, error: roleError } = await sessionClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    roleError ||
    !roleRecord ||
    !["staff", "admin"].includes(roleRecord.role)
  ) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Staff or admin access required." },
        { status: 403 }
      ),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase server environment configuration is missing.");

    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: "Server database configuration is missing." },
        { status: 500 }
      ),
    };
  }

  const adminSupabase = createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return {
    authorized: true as const,
    supabase: adminSupabase,
  };
}

function getDaysInactive(lastAttendanceAt: string | null): number | null {
  if (!lastAttendanceAt) return null;

  const timestamp = new Date(lastAttendanceAt).getTime();

  if (!Number.isFinite(timestamp)) return null;

  return Math.max(
    0,
    Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000))
  );
}

function getCuratedFallbackDraft(
  name: string,
  days: number | null,
  plan: string
) {
  if (days === null) {
    return `Namaste ${name}, we would love to welcome you to Thendral Yoga Loft for your first studio session. Your ${plan} membership is ready whenever you feel called to begin your practice. We look forward to meeting you on the mat in Coimbatore!`;
  }

  return `Namaste ${name}, we've missed your presence on the mat at Thendral Yoga Loft! It's been ${days} days since your last studio session. Your ${plan} membership pass is ready whenever you feel called to return to your practice, breathe deeply, and reconnect. We look forward to welcoming you back to our Coimbatore studio soon.`;
}

function extractGeminiText(data: unknown): {
  text: string;
  finishReason: string;
} {
  if (!data || typeof data !== "object") {
    return { text: "", finishReason: "UNKNOWN" };
  }

  const response = data as GeminiResponse;
  const candidate = response.candidates?.[0];

  const text = (candidate?.content?.parts || [])
    .map((part) => part.text || "")
    .join("")
    .trim();

  return {
    text,
    finishReason: candidate?.finishReason || "UNKNOWN",
  };
}

// Gemini generation with one retry for temporary failures.
async function generateGeminiDraft(
  prompt: string,
  apiKey: string
): Promise<string> {
  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`Gemini generation attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 512,
              thinkingConfig: {
                thinkingLevel: "MINIMAL",
              },
            },
          }),
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        }
      );

      if (!response.ok) {
        const details = await response.text();

        console.error("Gemini API error:", {
          status: response.status,
          attempt,
          details: details.slice(0, 500),
        });

        const temporaryFailure = [429, 500, 502, 503, 504].includes(
          response.status
        );

        if (temporaryFailure && attempt < GEMINI_MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }

        return "";
      }

      const data: unknown = await response.json();
      const result = extractGeminiText(data);

      console.log("Gemini response details:", {
        textLength: result.text.length,
        finishReason: result.finishReason,
        attempt,
      });

      if (
        result.text.length >= 40 &&
        result.finishReason === "STOP"
      ) {
        return result.text;
      }

      console.error("Gemini returned an empty or incomplete response.");

      if (attempt < GEMINI_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }

      return "";
    } catch (error) {
      console.error("Gemini generation attempt failed:", {
        attempt,
        error:
          error instanceof Error ? error.message : "Unknown error",
      });

      if (attempt < GEMINI_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        continue;
      }

      return "";
    }
  }

  return "";
}

// GET: Find active members who have not attended for the selected number of days.
export async function GET(request: Request) {
  try {
    const access = await verifyStaffAccess();

    if (!access.authorized) {
      return access.response;
    }

    const url = new URL(request.url);
    const rawDays = url.searchParams.get("daysInactive");
    const daysInactive = rawDays === null ? 7 : Number(rawDays);

    if (
      !Number.isInteger(daysInactive) ||
      daysInactive < 1 ||
      daysInactive > 3650
    ) {
      return NextResponse.json(
        { error: "Enter an inactivity period between 1 and 3650 days." },
        { status: 400 }
      );
    }

    const { data: members, error: membersError } = await access.supabase
      .from("profiles")
      .select("id, full_name, membership_plan")
      .eq("membership_status", "active")
      .order("full_name");

    if (membersError) {
      console.error("Failed to load active members:", membersError.message);

      return NextResponse.json(
        { error: "Could not load active members." },
        { status: 500 }
      );
    }

    const validMembers = (members || []).filter(
      (member) =>
        typeof member.membership_plan === "string" &&
        VALID_PLANS.includes(member.membership_plan)
    );

    const latestAttendance = new Map<string, string>();
    const memberIds = validMembers.map((member) => member.id);

    for (let start = 0; start < memberIds.length; start += 500) {
      const memberBatch = memberIds.slice(start, start + 500);
      let offset = 0;

      while (true) {
        const { data: logs, error: logsError } = await access.supabase
          .from("attendance_logs")
          .select("member_id, scanned_at")
          .in("member_id", memberBatch)
          .eq("status", "granted")
          .order("scanned_at", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (logsError) {
          console.error("Attendance lookup failed:", logsError.message);

          return NextResponse.json(
            { error: "Could not check member attendance." },
            { status: 500 }
          );
        }

        for (const log of logs || []) {
          if (
            typeof log.member_id === "string" &&
            typeof log.scanned_at === "string" &&
            !latestAttendance.has(log.member_id)
          ) {
            latestAttendance.set(log.member_id, log.scanned_at);
          }
        }

        if (!logs || logs.length < PAGE_SIZE) break;

        offset += PAGE_SIZE;
      }
    }

    const cutoff = Date.now() - daysInactive * 24 * 60 * 60 * 1000;

    const inactiveMembers = [];
    const neverAttendedMembers = [];

    for (const member of validMembers) {
      const lastAttendanceAt = latestAttendance.get(member.id) || null;

      const details = {
        id: member.id,
        full_name: member.full_name || "Member",
        membership_plan: member.membership_plan,
        lastAttendanceAt,
        daysInactive: getDaysInactive(lastAttendanceAt),
        neverAttended: lastAttendanceAt === null,
      };

      if (lastAttendanceAt === null) {
        neverAttendedMembers.push(details);
      } else if (new Date(lastAttendanceAt).getTime() <= cutoff) {
        inactiveMembers.push(details);
      }
    }

    return NextResponse.json({
      success: true,
      daysChecked: daysInactive,
      inactiveMembers,
      neverAttendedMembers,
      totalInactive: inactiveMembers.length,
      totalNeverAttended: neverAttendedMembers.length,
    });
  } catch (error) {
    console.error("Find inactive members API error:", error);

    return NextResponse.json(
      { error: "Failed to check member attendance." },
      { status: 500 }
    );
  }
}

// POST: Generate a re-engagement message for a selected active member.
export async function POST(request: Request) {
  try {
    const access = await verifyStaffAccess();

    if (!access.authorized) {
      return access.response;
    }

    const body: unknown = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const memberId =
      typeof input.memberId === "string" ? input.memberId.trim() : "";

    const daysInactive =
      input.daysInactive === undefined ? 7 : input.daysInactive;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        memberId
      ) ||
      typeof daysInactive !== "number" ||
      !Number.isInteger(daysInactive) ||
      daysInactive < 1 ||
      daysInactive > 3650
    ) {
      return NextResponse.json(
        { error: "Please select a valid member and inactivity period." },
        { status: 400 }
      );
    }

    const { data: member, error: memberError } = await access.supabase
      .from("profiles")
      .select("id, full_name, membership_plan")
      .eq("id", memberId)
      .eq("membership_status", "active")
      .maybeSingle();

    if (memberError || !member) {
      console.error("Member lookup failed:", memberError?.message);

      return NextResponse.json(
        { error: "Active member could not be found." },
        { status: 404 }
      );
    }

    const plan = member.membership_plan;

    if (typeof plan !== "string" || !VALID_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: "The member has an invalid membership plan." },
        { status: 400 }
      );
    }

    const { data: latestLog, error: attendanceError } = await access.supabase
      .from("attendance_logs")
      .select("scanned_at")
      .eq("member_id", memberId)
      .eq("status", "granted")
      .order("scanned_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attendanceError) {
      console.error("Member attendance lookup failed:", attendanceError.message);

      return NextResponse.json(
        { error: "Could not verify the member's attendance." },
        { status: 500 }
      );
    }

    const lastAttendanceAt = latestLog?.scanned_at || null;
    const actualDaysInactive = getDaysInactive(lastAttendanceAt);

    if (
      actualDaysInactive !== null &&
      actualDaysInactive < daysInactive
    ) {
      return NextResponse.json(
        {
          error:
            "This member has attended recently and is no longer in the selected inactivity group.",
        },
        { status: 409 }
      );
    }

    const safeName =
      (member.full_name || "Practitioner")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .trim() || "Practitioner";

    let generatedText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from server environment.");
    } else {
      const attendanceContext =
        actualDaysInactive === null
          ? "The member has never had a recorded granted attendance."
          : `The member's last granted attendance was ${actualDaysInactive} days ago.`;

      const prompt = `
You are a warm, supportive yoga teacher at Thendral Yoga Loft in Coimbatore, Tamil Nadu.

Write a complete personalised re-engagement message in exactly 2-3 natural sentences.

Keep it warm, mindful, encouraging and concise.
Do not sound sales-oriented or pushy.
Do not include a heading, subject line, quotation marks or explanation.
Write complete sentences and finish the message naturally.

Member name: ${JSON.stringify(safeName)}
Attendance information: ${attendanceContext}
Verified membership plan: ${plan}

If mentioning the membership, use the verified plan exactly.
If the member has never attended, warmly invite them to their first session.
Otherwise, emphasize breath, restoration and welcoming the member back to practice.
`;

      generatedText = await generateGeminiDraft(prompt, apiKey);
    }

    const draft =
      generatedText ||
      getCuratedFallbackDraft(safeName, actualDaysInactive, plan);

    return NextResponse.json({
      success: true,
      isAiGenerated: Boolean(generatedText),
      draft,
      recipient: safeName,
      membershipPlan: plan,
      lastAttendanceAt,
      daysInactive: actualDaysInactive,
      neverAttended: actualDaysInactive === null,
      studio: "Thendral Yoga Loft, Coimbatore",
    });
  } catch (error) {
    console.error("Draft re-engagement API error:", error);

    return NextResponse.json(
      { error: "Failed to generate draft message." },
      { status: 500 }
    );
  }
}
