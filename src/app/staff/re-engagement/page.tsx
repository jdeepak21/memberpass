
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ReengagementClient from "./ReengagementClient";

async function ReengagementPageContent() {
    await connection();

    const supabase = await createClient();

    // Verify logged-in user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // Verify Staff or Admin role
    const { data: roleRecord, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    if (
        roleError ||
        !roleRecord ||
        !["staff", "admin"].includes(roleRecord.role)
    ) {
        redirect("/dashboard");
    }

    // Display the AI Re-engagement interface
    return <ReengagementClient />;
}

export default function ReengagementPage() {
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
                        fontSize: "16px",
                    }}
                >
                    Loading AI Re-engagement Assistant...
                </main>
            }
        >
            <ReengagementPageContent />
        </Suspense>
    );
}
