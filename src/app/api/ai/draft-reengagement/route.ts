
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const VALID_PLANS = ["Basic", "Premium", "Enterprise"];
const GEMINI_MODEL = "gemini-3.5-flash";

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

function getCuratedFallbackDraft(
  name: string,
  days: number,
  plan: string
) {
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

// GET: Load active members
export async function GET() {
  try {
    const access = await verifyStaffAccess();

    if (!access.authorized) {
      return access.response;
    }

    const { data: members, error } = await access.supabase
      .from("profiles")
      .select("id, full_name, membership_plan")
      .eq("membership_status", "active")
      .order("full_name");

    if (error) {
      console.error("Failed to load active members:", error.message);

      return NextResponse.json(
        { error: "Could not load active members." },
        { status: 500 }
      );
    }

    const validMembers = (members || [])
      .filter(
        (member) =>
          typeof member.membership_plan === "string" &&
          VALID_PLANS.includes(member.membership_plan)
      )
      .map((member) => ({
        id: member.id,
        full_name: member.full_name || "Member",
        membership_plan: member.membership_plan,
      }));

    return NextResponse.json({
      success: true,
      members: validMembers,
    });
  } catch (error) {
    console.error("Load members API error:", error);

    return NextResponse.json(
      { error: "Failed to load members." },
      { status: 500 }
    );
  }
}

// POST: Generate a re-engagement message
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
      input.daysInactive === undefined ? 14 : input.daysInactive;

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        memberId
      ) ||
      !Number.isInteger(daysInactive) ||
      (daysInactive as number) < 0 ||
      (daysInactive as number) > 3650
    ) {
      return NextResponse.json(
        { error: "Please select a valid member and inactivity period." },
        { status: 400 }
      );
    }

    // Retrieve the selected member's actual active profile.
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

    const safeName =
      (member.full_name || "Practitioner")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .trim() || "Practitioner";

    const safeDays = daysInactive as number;

    let generatedText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from server environment.");
    } else {
      try {
        const prompt = `
You are a warm, supportive yoga teacher at Thendral Yoga Loft in Coimbatore, Tamil Nadu.

Write a complete personalised re-engagement message in exactly 2-3 natural sentences.

Keep it warm, mindful, encouraging and concise.
Do not sound sales-oriented or pushy.
Do not include a heading, subject line, quotation marks or explanation.
Write complete sentences and finish the message naturally.

Member name: ${JSON.stringify(safeName)}
Days inactive: ${safeDays}
Verified membership plan: ${plan}

If mentioning the membership, use the verified plan exactly.
Emphasize breath, restoration and welcoming the member back to practice.
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                maxOutputTokens: 512,
                thinkingConfig: {
                  thinkingLevel: "MINIMAL",
                },
              },
            }),
            signal: AbortSignal.timeout(30000),
          }
        );

        if (!response.ok) {
          const details = await response.text();

          console.error("Gemini API error:", {
            status: response.status,
            details: details.slice(0, 1000),
          });
        } else {
          const data: unknown = await response.json();
          const result = extractGeminiText(data);

          generatedText = result.text;

          console.log("Gemini response details:", {
            textLength: generatedText.length,
            finishReason: result.finishReason,
          });

          if (
            !generatedText ||
            result.finishReason !== "STOP" ||
            generatedText.length < 40
          ) {
            console.error(
              "Gemini response was empty or incomplete. Using fallback."
            );

            generatedText = "";
          }
        }
      } catch (error) {
        console.error("Gemini generation error:", error);
        generatedText = "";
      }
    }

    const draft =
      generatedText ||
      getCuratedFallbackDraft(safeName, safeDays, plan);

    return NextResponse.json({
      success: true,
      isAiGenerated: Boolean(generatedText),
      draft,
      recipient: safeName,
      membershipPlan: plan,
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
