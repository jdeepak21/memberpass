import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Safety net: ensure the profile row exists after email confirmation.
      // The database trigger is the primary mechanism; this covers any gap
      // (e.g. trigger not yet set up, or trigger ran before metadata was set).
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const admin = createAdminClient();
          const plan = user.user_metadata?.membership_plan ?? "Basic";
          await admin.from("profiles").upsert(
            {
              id: user.id,
              full_name: user.user_metadata?.full_name ?? null,
              requested_plan: plan,
              membership_plan: plan,  // NOT NULL column; RPC updates this after payment
              membership_status: "pending",
            },
            { onConflict: "id", ignoreDuplicates: true }
          );
        }
      } catch (profileError) {
        // Non-fatal: log but do not block the redirect.
        console.error("Auth callback profile upsert error:", profileError);
      }

      return NextResponse.redirect(new URL("/dashboard", origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin));
}