
"use client";

import { useState } from "react";

type DraftResponse = {
    success?: boolean;
    isAiGenerated?: boolean;
    draft?: string;
    recipient?: string;
    error?: string;
};

export default function ReengagementClient() {
    const [memberName, setMemberName] = useState("");
    const [daysInactive, setDaysInactive] = useState("14");
    const [plan, setPlan] = useState("Basic");
    const [draft, setDraft] = useState("");
    const [isAiGenerated, setIsAiGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    async function generateDraft(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setLoading(true);
        setError("");
        setDraft("");
        setCopied(false);

        try {
            const response = await fetch("/api/ai/draft-reengagement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    memberName,
                    daysInactive: Number(daysInactive),
                    plan,
                }),
            });

            const data: DraftResponse = await response.json();

            if (!response.ok || !data.success || !data.draft) {
                throw new Error(data.error || "Could not generate the message.");
            }

            setDraft(data.draft);
            setIsAiGenerated(Boolean(data.isAiGenerated));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    async function copyDraft() {
        try {
            await navigator.clipboard.writeText(draft);
            setCopied(true);
        } catch {
            setError("Could not copy the message. Please copy it manually.");
        }
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                background: "#0c1310",
                color: "#f3ede4",
                padding: "40px 20px",
            }}
        >
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                <a
                    href="/staff"
                    style={{
                        color: "#7dd1a1",
                        textDecoration: "none",
                        fontSize: "14px",
                    }}
                >
                    ← Back to Staff Scanner
                </a>

                <header style={{ margin: "30px 0" }}>
                    <p
                        style={{
                            color: "#7dd1a1",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "2px",
                        }}
                    >
                        THENDRAL YOGA LOFT
                    </p>

                    <h1 style={{ fontSize: "30px", margin: "8px 0" }}>
                        AI Re-engagement Assistant
                    </h1>

                    <p style={{ color: "#9ba69e", lineHeight: 1.6 }}>
                        Create warm, personalised messages to welcome inactive members
                        back to their yoga practice.
                    </p>
                </header>

                <form
                    onSubmit={generateDraft}
                    style={{
                        background: "#111b15",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "16px",
                        padding: "24px",
                    }}
                >
                    <label style={{ display: "block", marginBottom: "8px" }}>
                        Member name
                    </label>

                    <input
                        value={memberName}
                        onChange={(event) => setMemberName(event.target.value)}
                        placeholder="Enter member name"
                        maxLength={80}
                        required
                        style={inputStyle}
                    />

                    <label style={{ display: "block", margin: "18px 0 8px" }}>
                        Days inactive
                    </label>

                    <input
                        type="number"
                        min="0"
                        max="3650"
                        value={daysInactive}
                        onChange={(event) => setDaysInactive(event.target.value)}
                        required
                        style={inputStyle}
                    />

                    <label style={{ display: "block", margin: "18px 0 8px" }}>
                        Membership plan
                    </label>

                    <select
                        value={plan}
                        onChange={(event) => setPlan(event.target.value)}
                        style={inputStyle}
                    >
                        <option value="Basic">Basic</option>
                        <option value="Premium">Premium</option>
                        <option value="Enterprise">Enterprise</option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: "24px",
                            padding: "14px",
                            border: "none",
                            borderRadius: "9px",
                            background: loading ? "#53665a" : "#3d7a5a",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "15px",
                            cursor: loading ? "wait" : "pointer",
                        }}
                    >
                        {loading ? "Generating message..." : "✨ Generate AI Message"}
                    </button>
                </form>

                {error && (
                    <p
                        role="alert"
                        style={{
                            marginTop: "18px",
                            padding: "14px",
                            borderRadius: "9px",
                            background: "rgba(248,113,113,0.1)",
                            color: "#fca5a5",
                        }}
                    >
                        {error}
                    </p>
                )}

                {draft && (
                    <section
                        style={{
                            marginTop: "24px",
                            padding: "24px",
                            borderRadius: "16px",
                            background: "#111b15",
                            border: "1px solid rgba(125,209,161,0.25)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: "19px" }}>
                                Generated Message
                            </h2>

                            <span style={{ color: "#7dd1a1", fontSize: "12px" }}>
                                {isAiGenerated ? "Gemini AI generated" : "Curated fallback"}
                            </span>
                        </div>

                        <p
                            style={{
                                color: "#e3e9e4",
                                lineHeight: 1.8,
                                whiteSpace: "pre-wrap",
                                marginTop: "18px",
                            }}
                        >
                            {draft}
                        </p>

                        <button
                            type="button"
                            onClick={copyDraft}
                            style={{
                                marginTop: "12px",
                                padding: "11px 18px",
                                borderRadius: "8px",
                                border: "1px solid #7dd1a1",
                                background: "transparent",
                                color: "#7dd1a1",
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            {copied ? "✓ Copied" : "Copy Message"}
                        </button>

                        <p
                            style={{
                                color: "#89968d",
                                fontSize: "12px",
                                lineHeight: 1.6,
                                marginTop: "16px",
                            }}
                        >
                            Review the message before sending it to the member. Sending
                            through WhatsApp or email is not automated.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "#0a110d",
    color: "#f3ede4",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
};
