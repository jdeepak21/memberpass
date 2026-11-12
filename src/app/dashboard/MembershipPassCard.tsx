"use client";

import { QRCodeSVG } from "qrcode.react";

type Props = {
  userId: string;
  fullName: string;
  plan: string;
  email: string;
};

export default function MembershipPassCard({
  userId,
  fullName,
  plan,
  email,
}: Props) {
  // QR code payload — scanned by staff to verify membership.
  // Format: membrix:verify?uid=<id>&plan=<plan>
  const qrValue = `membrix:verify?uid=${userId}&plan=${encodeURIComponent(plan)}`;

  // Short display ID (last 8 chars of the UUID)
  const memberId = userId.slice(-8).toUpperCase();

  // Current month/year for pass display
  const issuedDate = new Date().toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #1a1040 0%, #0f1a2e 60%, #0b101b 100%)",
        border: "1px solid #8b7cff55",
        boxShadow: "0 0 40px #8b7cff22",
        marginBottom: "24px",
      }}
    >
      {/* Pass header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <p
            style={{
              color: "#a99cff",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              marginBottom: "4px",
            }}
          >
            MEMBRIX DIGITAL PASS
          </p>
          <h2 style={{ fontSize: "22px", margin: 0 }}>{fullName}</h2>
          <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
            {email}
          </p>
        </div>

        {/* Plan badge */}
        <span
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            background: plan === "Premium" ? "#7c3aed" : plan === "Enterprise" ? "#b45309" : "#1e3a5f",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
            whiteSpace: "nowrap",
          }}
        >
          {plan.toUpperCase()}
        </span>
      </div>

      {/* QR code + member details row */}
      <div
        style={{
          display: "flex",
          gap: "28px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* QR Code */}
        <div
          style={{
            padding: "12px",
            background: "#ffffff",
            borderRadius: "12px",
            lineHeight: 0,
            flexShrink: 0,
          }}
        >
          <QRCodeSVG
            value={qrValue}
            size={130}
            bgColor="#ffffff"
            fgColor="#0a0a0a"
            level="M"
          />
        </div>

        {/* Member details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginBottom: "2px" }}>
              MEMBER ID
            </p>
            <p style={{ fontFamily: "monospace", fontSize: "18px", letterSpacing: "2px", color: "#e5e7eb" }}>
              #{memberId}
            </p>
          </div>

          <div>
            <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginBottom: "2px" }}>
              MEMBERSHIP
            </p>
            <p style={{ fontSize: "15px", color: "#e5e7eb" }}>{plan} Plan</p>
          </div>

          <div>
            <p style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", marginBottom: "2px" }}>
              ISSUED
            </p>
            <p style={{ fontSize: "15px", color: "#e5e7eb" }}>{issuedDate}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#4ade80", fontSize: "13px", fontWeight: 700 }}>
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Pass footer */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid #ffffff11",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#4b5563", fontSize: "11px" }}>
          Scan QR code at Thendral Yoga Loft to verify membership
        </span>
        <span style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace" }}>
          THENDRAL YOGA LOFT
        </span>
      </div>
    </div>
  );
}

