
"use client";

import { useState } from "react";

type Member = {
    id: string;
    full_name: string;
    membership_plan: string;
    lastAttendanceAt: string | null;
    daysInactive: number | null;
    neverAttended: boolean;
};

type MembersResponse = {
    success?: boolean;
    daysChecked?: number;
    inactiveMembers?: Member[];
    neverAttendedMembers?: Member[];
    totalInactive?: number;
    totalNeverAttended?: number;
    error?: string;
};

type DraftResponse = {
    success?: boolean;
    isAiGenerated?: boolean;
    draft?: string;
    recipient?: string;
    error?: string;
};

export default function ReengagementClient() {
    const [daysInactive, setDaysInactive] = useState("7");
    const [inactiveMembers, setInactiveMembers] = useState<Member[]>([]);
    const [neverAttendedMembers, setNeverAttendedMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const [draft, setDraft] = useState("");
    const [isAiGenerated, setIsAiGenerated] = useState(false);

    const [searching, setSearching] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    async function findInactiveMembers(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const days = Number(daysInactive);

        if (!Number.isInteger(days) || days < 1 || days > 3650) {
            setError("Enter a whole number between 1 and 3650 days.");
            return;
        }

        setSearching(true);
        setError("");
        setDraft("");
        setSelectedMember(null);
        setCopied(false);
        setHasSearched(false);

        try {
            const response = await fetch(
                `/api/ai/draft-reengagement?daysInactive=${encodeURIComponent(String(days))}`,
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            const data: MembersResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Could not find inactive members.");
            }

            setInactiveMembers(data.inactiveMembers || []);
            setNeverAttendedMembers(data.neverAttendedMembers || []);
            setHasSearched(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setSearching(false);
        }
    }

    function chooseMember(member: Member) {
        setSelectedMember(member);
        setDraft("");
        setError("");
        setCopied(false);
    }

    async function generateDraft() {
        if (!selectedMember) {
            setError("Please select a member first.");
            return;
        }

        setGenerating(true);
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
                    memberId: selectedMember.id,
                    daysInactive: Number(daysInactive),
                }),
            });

            const data: DraftResponse = await response.json();

            if (!response.ok || !data.success || !data.draft) {
                throw new Error(
                    data.error || "Could not generate the message."
                );
            }

            setDraft(data.draft);
            setIsAiGenerated(Boolean(data.isAiGenerated));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not generate the message. Please try again."
            );
        } finally {
            setGenerating(false);
        }
    }

    async function copyDraft() {
        try {
            await navigator.clipboard.writeText(draft);
            setCopied(true);
            setError("");
        } catch {
            setError("Could not copy the message. Please copy it manually.");
        }
    }

    function formatAttendanceDate(value: string | null) {
        if (!value) return "No attendance record";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    function memberCard(member: Member, isNeverAttended = false) {
        const isSelected = selectedMember?.id === member.id;

        return (
            <button
                key={member.id}
                type="button"
                onClick={() => chooseMember(member)}
                style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "17px",
                    marginTop: "10px",
                    borderRadius: "12px",
                    border: isSelected
                        ? "1px solid #7dd1a1"
                        : "1px solid rgba(255,255,255,0.1)",
                    background: isSelected ? "rgba(61,122,90,0.2)" : "#0c1510",
                    color: "#f3ede4",
                    cursor: "pointer",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                    }}
                >
                    <strong>{member.full_name}</strong>
                    <span style={{ color: "#7dd1a1", fontSize: "13px" }}>
                        {member.membership_plan}
                    </span>
                </div>

                <p
                    style={{
                        color: "#9ba69e",
                        fontSize: "13px",
                        margin: "9px 0 0",
                    }}
                >
                    Last attendance:{" "}
                    {isNeverAttended
                        ? "Never attended"
                        : formatAttendanceDate(member.lastAttendanceAt)}
                </p>

                {!isNeverAttended && member.daysInactive !== null && (
                    <p
                        style={{
                            color: "#e4c58a",
                            fontSize: "13px",
                            margin: "6px 0 0",
                        }}
                    >
                        Inactive for {member.daysInactive} days
                    </p>
                )}

                {isSelected && (
                    <p
                        style={{
                            color: "#7dd1a1",
                            fontSize: "12px",
                            margin: "10px 0 0",
                            fontWeight: 700,
                        }}
                    >
                        ✓ Selected
                    </p>
                )}
            </button>
        );
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
                        Find active members who have not attended recently
                        and create warm, personalised messages to welcome
                        them back to their yoga practice.
                    </p>
                </header>

                <form
                    onSubmit={findInactiveMembers}
                    style={{
                        background: "#111b15",
                        border: "1px solid rgba(255,255,255,0.09)",
                        borderRadius: "16px",
                        padding: "24px",
                    }}
                >
                    <label
                        htmlFor="daysInactive"
                        style={{ display: "block", marginBottom: "8px" }}
                    >
                        Find members inactive for at least how many days?
                    </label>

                    <input
                        id="daysInactive"
                        type="number"
                        min="1"
                        max="3650"
                        step="1"
                        value={daysInactive}
                        onChange={(event) => setDaysInactive(event.target.value)}
                        required
                        style={inputStyle}
                    />

                    <p
                        style={{
                            color: "#89968d",
                            fontSize: "12px",
                            lineHeight: 1.6,
                            marginTop: "8px",
                        }}
                    >
                        Example: Enter 7 to find active members whose last
                        granted attendance was at least 7 days ago.
                    </p>

                    <button
                        type="submit"
                        disabled={searching}
                        style={{
                            width: "100%",
                            marginTop: "20px",
                            padding: "14px",
                            border: "none",
                            borderRadius: "9px",
                            background: searching ? "#53665a" : "#3d7a5a",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "15px",
                            cursor: searching ? "wait" : "pointer",
                        }}
                    >
                        {searching ? "Finding members..." : "Find Inactive Members"}
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
                            lineHeight: 1.6,
                        }}
                    >
                        {error}
                    </p>
                )}

                {hasSearched && (
                    <section style={{ marginTop: "28px" }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                                gap: "12px",
                            }}
                        >
                            <div style={summaryCardStyle}>
                                <strong style={summaryNumberStyle}>
                                    {inactiveMembers.length}
                                </strong>
                                <span style={summaryLabelStyle}>
                                    Inactive members
                                </span>
                            </div>

                            <div style={summaryCardStyle}>
                                <strong style={summaryNumberStyle}>
                                    {neverAttendedMembers.length}
                                </strong>
                                <span style={summaryLabelStyle}>
                                    Never attended
                                </span>
                            </div>
                        </div>

                        <h2 style={{ fontSize: "19px", margin: "28px 0 8px" }}>
                            Inactive Members
                        </h2>

                        <p style={helperTextStyle}>
                            These active members have not attended for at least{" "}
                            {daysInactive} days.
                        </p>

                        {inactiveMembers.length === 0 ? (
                            <p style={emptyStyle}>
                                No inactive members found for this period.
                            </p>
                        ) : (
                            inactiveMembers.map((member) => memberCard(member))
                        )}

                        <h2 style={{ fontSize: "19px", margin: "28px 0 8px" }}>
                            Never Attended
                        </h2>

                        <p style={helperTextStyle}>
                            These active members have no granted attendance
                            records.
                        </p>

                        {neverAttendedMembers.length === 0 ? (
                            <p style={emptyStyle}>
                                No never-attended members found.
                            </p>
                        ) : (
                            neverAttendedMembers.map((member) =>
                                memberCard(member, true)
                            )
                        )}
                    </section>
                )}

                {selectedMember && (
                    <section
                        style={{
                            marginTop: "24px",
                            padding: "24px",
                            borderRadius: "16px",
                            background: "#111b15",
                            border: "1px solid rgba(125,209,161,0.25)",
                        }}
                    >
                        <h2 style={{ margin: "0 0 14px", fontSize: "19px" }}>
                            Selected Member
                        </h2>

                        <p style={{ margin: "7px 0" }}>
                            <strong>Name:</strong> {selectedMember.full_name}
                        </p>

                        <p style={{ margin: "7px 0" }}>
                            <strong>Plan:</strong>{" "}
                            <span style={{ color: "#7dd1a1" }}>
                                {selectedMember.membership_plan}
                            </span>
                        </p>

                        <p style={{ margin: "7px 0", color: "#9ba69e" }}>
                            <strong>Last attendance:</strong>{" "}
                            {selectedMember.neverAttended
                                ? "Never attended"
                                : formatAttendanceDate(selectedMember.lastAttendanceAt)}
                        </p>

                        <button
                            type="button"
                            onClick={generateDraft}
                            disabled={generating}
                            style={{
                                width: "100%",
                                marginTop: "20px",
                                padding: "14px",
                                border: "none",
                                borderRadius: "9px",
                                background: generating ? "#53665a" : "#3d7a5a",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "15px",
                                cursor: generating ? "wait" : "pointer",
                            }}
                        >
                            {generating
                                ? "Generating message..."
                                : "✨ Generate AI Message"}
                        </button>
                    </section>
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
                                {isAiGenerated
                                    ? "Gemini AI generated"
                                    : "Curated fallback"}
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
                            Review the message before sending it. WhatsApp
                            and email delivery are not automated; copy the
                            message and send it manually.
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

const summaryCardStyle: React.CSSProperties = {
    background: "#111b15",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
};

const summaryNumberStyle: React.CSSProperties = {
    color: "#7dd1a1",
    fontSize: "27px",
};

const summaryLabelStyle: React.CSSProperties = {
    color: "#9ba69e",
    fontSize: "13px",
};

const helperTextStyle: React.CSSProperties = {
    color: "#89968d",
    fontSize: "13px",
    lineHeight: 1.6,
    marginTop: "0",
};

const emptyStyle: React.CSSProperties = {
    color: "#9ba69e",
    background: "#111b15",
    borderRadius: "10px",
    padding: "16px",
    fontSize: "14px",
};
