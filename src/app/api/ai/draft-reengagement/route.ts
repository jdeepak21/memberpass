import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getCuratedFallbackDraft(name: string, days: number, plan: string): string {
  const cleanName = name || "Practitioner";
  const daysText = days > 0 ? `${days} days` : "a few weeks";

  return `Namaste ${cleanName}, we've missed your presence on the mat at Thendral Yoga Loft! It's been ${daysText} since your last studio session. Your ${plan} membership pass is ready whenever you feel called to return to your practice, breathe deeply, and reconnect. We look forward to welcoming you back to our Coimbatore studio soon.`;
}

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
        { error: "Authentication required to generate re-engagement drafts." },
        { status: 401 }
      );
    }

    // 2. Parse request
    const body = await request.json().catch(() => ({}));
    const memberName = typeof body.memberName === "string" ? body.memberName.trim() : "Practitioner";
    const daysInactive = typeof body.daysInactive === "number" ? body.daysInactive : 14;
    const plan = typeof body.plan === "string" ? body.plan.trim() : "Basic";

    const apiKey = process.env.GEMINI_API_KEY;

    // 3. If Gemini API key is configured, attempt AI generation
    if (apiKey) {
      try {
        const prompt = `You are a warm, supportive yoga teacher at Thendral Yoga Loft in Coimbatore, Tamil Nadu. Write a gentle, mindful 2-3 sentence re-engagement message to a student named ${memberName} who has not visited the studio in ${daysInactive} days. Their membership plan is ${plan}. Emphasize breath, restoration, and welcoming them back to practice. Do not sound sales-oriented or pushy.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
            }),
            signal: AbortSignal.timeout(5000), // 5s timeout
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (generatedText) {
            return NextResponse.json({
              success: true,
              isAiGenerated: true,
              draft: generatedText,
              studio: "Thendral Yoga Loft, Coimbatore",
              recipient: memberName,
            });
          }
        }
      } catch (aiErr) {
        // Log AI error and proceed to safe fallback gracefully
        console.warn("AI generation failed or timed out. Falling back to template:", aiErr);
      }
    }

    // 4. Safe Fallback (Guaranteed to always succeed even without API keys or internet)
    const fallbackDraft = getCuratedFallbackDraft(memberName, daysInactive, plan);

    return NextResponse.json({
      success: true,
      isAiGenerated: false,
      draft: fallbackDraft,
      studio: "Thendral Yoga Loft, Coimbatore",
      recipient: memberName,
    });
  } catch (error) {
    console.error("Draft re-engagement API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate draft message.",
      },
      { status: 500 }
    );
  }
}
