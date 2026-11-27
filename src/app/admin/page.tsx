
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function AdminDashboardContent() {
    await connection();

    const supabase = await createClient();

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    const { data: roleRecord } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

    const role = roleRecord?.role;

    if (role !== "admin") {
        if (role === "staff") redirect("/staff");
        redirect("/dashboard");
    }

    async function handleLogout() {
        "use server";

        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/login");
    }

    const cardStyle = {
        background: "#ffffff",
        border: "1px solid #dceee2",
        borderRadius: "14px",
        padding: "22px",
        textDecoration: "none",
        color: "#174b31",
        display: "block",
    } as const;

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "32px 20px",
                background: "#f1f8f3",
                color: "#174b31",
            }}
        >
            <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
                <header
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "16px",
                        marginBottom: "32px",
                        padding: "22px",
                        background: "#176b3a",
                        color: "#ffffff",
                        borderRadius: "16px",
                    }}
                >
                    <div>
                        <p style={{ margin: "0 0 6px", fontSize: "12px", letterSpacing: "1.5px" }}>
                            THENDRAL YOGA LOFT
                        </p>
                        <h1 style={{ margin: 0, fontSize: "28px" }}>
                            Admin Dashboard
                        </h1>
                        <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.9 }}>
                            Welcome, {user.user_metadata?.full_name || "Admin"}
                        </p>
                    </div>

                    <span
                        style={{
                            padding: "8px 14px",
                            borderRadius: "20px",
                            background: "#ffffff",
                            color: "#176b3a",
                            fontWeight: 700,
                            fontSize: "12px",
                        }}
                    >
                        ADMIN ACCESS
                    </span>
                </header>

                <section style={{ marginBottom: "28px" }}>
                    <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>
                        Studio Management
                    </h2>
                    <p style={{ color: "#64806e", fontSize: "14px", marginTop: 0 }}>
                        Manage your studio tools and monitor member activities.
                    </p>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "16px",
                            marginTop: "20px",
                        }}
                    >
                        <Link href="/staff" style={cardStyle}>
                            <div style={{ fontSize: "28px" }}>📷</div>
                            <h3>QR Attendance Scanner</h3>
                            <p style={{ color: "#64806e", fontSize: "14px" }}>
                                Verify member passes and access the staff scanner.
                            </p>
                            <strong style={{ color: "#16834a" }}>Open Scanner →</strong>
                        </Link>

                        <Link href="/staff/re-engagement" style={cardStyle}>
                            <div style={{ fontSize: "28px" }}>✨</div>
                            <h3>AI Re-engagement</h3>
                            <p style={{ color: "#64806e", fontSize: "14px" }}>
                                Prepare personalised messages for inactive members.
                            </p>
                            <strong style={{ color: "#16834a" }}>Open Assistant →</strong>
                        </Link>

                        <Link href="/dashboard" style={cardStyle}>
                            <div style={{ fontSize: "28px" }}>👤</div>
                            <h3>Member Dashboard</h3>
                            <p style={{ color: "#64806e", fontSize: "14px" }}>
                                View the member-facing dashboard.
                            </p>
                            <strong style={{ color: "#16834a" }}>View Dashboard →</strong>
                        </Link>
                    </div>
                </section>

                <section
                    style={{
                        background: "#e3f3e8",
                        border: "1px solid #c9e6d2",
                        borderRadius: "14px",
                        padding: "22px",
                        marginBottom: "24px",
                    }}
                >
                    <h2 style={{ margin: "0 0 8px", fontSize: "18px" }}>
                        Admin Account
                    </h2>
                    <p style={{ margin: "0 0 6px", fontSize: "14px" }}>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p style={{ margin: 0, fontSize: "14px" }}>
                        <strong>Role:</strong> ADMIN
                    </p>
                </section>

                <form action={handleLogout}>
                    <button
                        type="submit"
                        style={{
                            padding: "11px 22px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#176b3a",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Log Out
                    </button>
                </form>
            </div>
        </main>
    );
}

export default function AdminPage() {
    return (
        <Suspense
            fallback={
                <main
                    style={{
                        minHeight: "100vh",
                        display: "grid",
                        placeItems: "center",
                        background: "#f1f8f3",
                        color: "#176b3a",
                    }}
                >
                    Loading Admin Dashboard...
                </main>
            }
        >
            <AdminDashboardContent />
        </Suspense>
    );
}
