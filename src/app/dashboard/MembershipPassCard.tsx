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
        padding: "26px",
        borderRadius: "18px",
        background:
          "linear-gradient(145deg, #13241b 0%, #0d1a13 60%, #09120e 100%)",
        border: "1px solid rgba(125, 209, 161, 0.3)",
        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.45)",
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
              color: "#7dd1a1",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              margin: "0 0 4px",
            }}
          >
            THENDRAL YOGA LOFT • DIGITAL PASS
          </p>
          <h2 style={{ fontSize: "22px", margin: 0, fontWeight: 700 }}>
            {fullName}
          </h2>
          <p style={{ color: "#8a968e", fontSize: "13px", marginTop: "4px" }}>
            {email}
          </p>
        </div>

        {/* Plan badge */}
        <span
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            background:
              plan === "Premium"
                ? "rgba(125, 209, 161, 0.25)"
                : plan === "Enterprise"
                ? "rgba(223, 184, 119, 0.2)"
                : "rgba(61, 122, 90, 0.3)",
            border:
              plan === "Premium"
                ? "1px solid #7dd1a1"
                : plan === "Enterprise"
                ? "1px solid #dfb877"
                : "1px solid rgba(125, 209, 161, 0.3)",
            color: plan === "Enterprise" ? "#dfb877" : "#7dd1a1",
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
            fgColor="#0a110d"
            level="M"
          />
        </div>

        {/* Member details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <p
              style={{
                color: "#6b7a70",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              MEMBER ID
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "18px",
                letterSpacing: "2px",
                color: "#f3ede4",
                margin: 0,
              }}
            >
              #{memberId}
            </p>
          </div>

          <div>
            <p
              style={{
                color: "#6b7a70",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              MEMBERSHIP PLAN
            </p>
            <p style={{ fontSize: "15px", color: "#f3ede4", margin: 0 }}>
              {plan} Plan
            </p>
          </div>

          <div>
            <p
              style={{
                color: "#6b7a70",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              ISSUED
            </p>
            <p style={{ fontSize: "15px", color: "#f3ede4", margin: 0 }}>
              {issuedDate}
            </p>
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
              ACTIVE PASS
            </span>
          </div>
        </div>
      </div>

      {/* Pass footer */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span style={{ color: "#8a968e", fontSize: "12px" }}>
          Scan at studio reception for entry verification
        </span>
        <span
          style={{
            color: "#7dd1a1",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          COIMBATORE, TAMIL NADU
        </span>
      </div>
    </div>
  );
}
