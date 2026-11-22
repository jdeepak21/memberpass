"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type ScanLogItem = {
  id: string;
  memberId: string;
  memberName?: string;
  plan: string;
  status: string;
  message: string;
  timestamp: string;
  success: boolean;
};

type Props = {
  staffEmail: string;
  role: "staff" | "admin";
};

// Web Audio API tone generator for instant reception feedback
function playAudioFeedback(type: "granted" | "denied") {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "granted") {
      // Pleasant rising chime
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Low warning buzz
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio feedback is non-essential; fail silently if audio blocked by browser policy
  }
}

export default function StaffScannerClient({ staffEmail, role }: Props) {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastResult, setLastResult] = useState<ScanLogItem | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanLogItem[]>([]);

  // Manual input form state
  const [manualPayload, setManualPayload] = useState("");
  const [manualMemberId, setManualMemberId] = useState("");
  const [manualPlan, setManualPlan] = useState<"Basic" | "Premium" | "Enterprise">("Basic");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isVerifyingRef = useRef(false);

  // Send payload to staff verify API
  const handleVerifyPayload = useCallback(
    async (payload: { qrPayload?: string; memberId?: string; plan?: string }) => {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;
      setIsVerifying(true);

      try {
        const response = await fetch("/api/staff/verify-pass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        const logItem: ScanLogItem = {
          id: Math.random().toString(36).substring(2, 9),
          memberId: data.member_id || payload.memberId || "Unknown",
          memberName: data.member_name,
          plan: data.plan || payload.plan || "Unknown",
          status: data.status || (data.success ? "granted" : "error"),
          message: data.message || data.error || "Pass verification processed.",
          timestamp: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          success: Boolean(data.success),
        };

        setLastResult(logItem);
        setScanHistory((prev) => [logItem, ...prev.slice(0, 19)]);

        if (logItem.success) {
          playAudioFeedback("granted");
        } else {
          playAudioFeedback("denied");
        }
      } catch (err) {
        const failItem: ScanLogItem = {
          id: Math.random().toString(36).substring(2, 9),
          memberId: payload.memberId || "Unknown",
          plan: payload.plan || "Unknown",
          status: "network_error",
          message: err instanceof Error ? err.message : "Network error during scan.",
          timestamp: new Date().toLocaleTimeString("en-IN"),
          success: false,
        };
        setLastResult(failItem);
        playAudioFeedback("denied");
      } finally {
        setIsVerifying(false);
        // Debounce camera re-scans slightly
        setTimeout(() => {
          isVerifyingRef.current = false;
        }, 1500);
      }
    },
    []
  );

  // Manage camera lifecycle cleanly with async initialization
  useEffect(() => {
    let isCancelled = false;

    if (activeTab === "camera") {
      const initCamera = async () => {
        try {
          if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("staff-reader", {
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
              verbose: false,
            });
          }

          await scannerRef.current.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              handleVerifyPayload({ qrPayload: decodedText });
            },
            () => {}
          );

          if (!isCancelled) {
            setCameraActive(true);
            setCameraError(null);
          }
        } catch (err) {
          if (!isCancelled) {
            setCameraActive(false);
            setCameraError(
              err instanceof Error
                ? err.message
                : "Unable to access device camera. Please check camera permissions or use manual entry."
            );
          }
        }
      };

      initCamera();
    } else {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => {
            if (!isCancelled) setCameraActive(false);
          })
          .catch(() => {});
      }
    }

    return () => {
      isCancelled = true;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [activeTab, handleVerifyPayload]);

  const retryCamera = useCallback(() => {
    setCameraError(null);
    if (scannerRef.current) {
      scannerRef.current
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            handleVerifyPayload({ qrPayload: decodedText });
          },
          () => {}
        )
        .then(() => {
          setCameraActive(true);
        })
        .catch((err) => {
          setCameraActive(false);
          setCameraError(
            err instanceof Error ? err.message : "Unable to start camera."
          );
        });
    }
  }, [handleVerifyPayload]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualPayload.trim()) {
      handleVerifyPayload({ qrPayload: manualPayload.trim() });
    } else if (manualMemberId.trim()) {
      handleVerifyPayload({
        memberId: manualMemberId.trim(),
        plan: manualPlan,
      });
    }
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          flexWrap: "wrap",
          gap: "12px",
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
            THENDRAL YOGA LOFT • RECEPTION
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            Staff QR Membership Scanner
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: role === "admin" ? "rgba(223, 184, 119, 0.2)" : "rgba(125, 209, 161, 0.2)",
              border: role === "admin" ? "1px solid #dfb877" : "1px solid #7dd1a1",
              color: role === "admin" ? "#dfb877" : "#7dd1a1",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            {role.toUpperCase()}
          </span>

          <span style={{ fontSize: "13px", color: "#8a968e" }}>{staffEmail}</span>

          <Link
            href="/dashboard"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f3ede4",
              fontSize: "12px",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "camera" ? "#3d7a5a" : "transparent",
            color: activeTab === "camera" ? "#ffffff" : "#8a968e",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          📷 Camera Scanner
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "manual" ? "#3d7a5a" : "transparent",
            color: activeTab === "manual" ? "#ffffff" : "#8a968e",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ⌨️ Manual / Fast Entry
        </button>
      </div>

      {/* Scanner Section */}
      <div
        style={{
          background: "#111b15",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
        }}
      >
        {activeTab === "camera" ? (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
                fontSize: "12px",
              }}
            >
              <span style={{ color: "#8a968e" }}>Target: MemberPass QR</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: cameraActive ? "#4ade80" : "#fbbf24",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: cameraActive ? "#4ade80" : "#fbbf24",
                  }}
                />
                {cameraActive ? "Live Scanning" : "Camera Standby"}
              </span>
            </div>

            <div
              id="staff-reader"
              style={{
                width: "100%",
                maxWidth: "420px",
                margin: "0 auto",
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid rgba(125, 209, 161, 0.3)",
                background: "#080e0a",
                minHeight: "260px",
              }}
            />

            {cameraError && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #f87171",
                  color: "#fca5a5",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {cameraError}
                <div style={{ marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={retryCamera}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      background: "#3d7a5a",
                      color: "#fff",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Retry Camera
                  </button>
                </div>
              </div>
            )}

            <p
              style={{
                textAlign: "center",
                color: "#8a968e",
                fontSize: "13px",
                marginTop: "14px",
                marginBottom: 0,
              }}
            >
              Point camera at the customer&apos;s digital pass QR code.
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="qr-paste"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#b0baa2",
                  marginBottom: "6px",
                }}
              >
                Paste Full QR Payload String
              </label>
              <input
                id="qr-paste"
                type="text"
                placeholder="membrix:verify?uid=...&plan=Basic"
                value={manualPayload}
                onChange={(e) => setManualPayload(e.target.value)}
                style={inputStyle}
              />
              <span style={{ fontSize: "11px", color: "#6b7a70" }}>
                Use this if scanning with an external USB handheld barcode scanner.
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "16px 0",
                color: "#6b7a70",
                fontSize: "12px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
              <span style={{ padding: "0 10px" }}>OR ENTER DIRECT DETAILS</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255, 255, 255, 0.08)" }} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label
                  htmlFor="member-uuid"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#b0baa2",
                    marginBottom: "6px",
                  }}
                >
                  Member UUID
                </label>
                <input
                  id="member-uuid"
                  type="text"
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  value={manualMemberId}
                  onChange={(e) => setManualMemberId(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="member-plan"
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#b0baa2",
                    marginBottom: "6px",
                  }}
                >
                  Membership Plan
                </label>
                <select
                  id="member-plan"
                  value={manualPlan}
                  onChange={(e) =>
                    setManualPlan(e.target.value as "Basic" | "Premium" | "Enterprise")
                  }
                  style={{
                    ...inputStyle,
                    height: "44px",
                  }}
                >
                  <option value="Basic">Basic Plan</option>
                  <option value="Premium">Premium Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: "#3d7a5a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                cursor: isVerifying ? "wait" : "pointer",
              }}
            >
              {isVerifying ? "Verifying pass..." : "Verify Pass Now"}
            </button>
          </form>
        )}
      </div>

      {/* Live Result Feedback Card */}
      {lastResult && (
        <div
          role="status"
          style={{
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "24px",
            border: lastResult.success
              ? "2px solid #4ade80"
              : lastResult.status === "duplicate_scan"
              ? "2px solid #fbbf24"
              : "2px solid #f87171",
            background: lastResult.success
              ? "#132b1d"
              : lastResult.status === "duplicate_scan"
              ? "#2d2310"
              : "#331616",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1.2px",
                color: lastResult.success
                  ? "#4ade80"
                  : lastResult.status === "duplicate_scan"
                  ? "#fbbf24"
                  : "#f87171",
              }}
            >
              {lastResult.success
                ? "ENTRY GRANTED"
                : lastResult.status === "duplicate_scan"
                ? "DUPLICATE SCAN"
                : "ENTRY DENIED"}
            </span>

            <span style={{ fontSize: "12px", color: "#8a968e" }}>
              {lastResult.timestamp}
            </span>
          </div>

          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: "8px 0 4px",
              color: "#ffffff",
            }}
          >
            {lastResult.memberName || `Member ID #${lastResult.memberId.slice(-8).toUpperCase()}`}
          </h2>

          <p
            style={{
              margin: "0 0 12px",
              fontSize: "14px",
              color: lastResult.success
                ? "#bbf7d0"
                : lastResult.status === "duplicate_scan"
                ? "#fef08a"
                : "#fecaca",
            }}
          >
            {lastResult.message}
          </p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                background: "rgba(255, 255, 255, 0.1)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#f3ede4",
              }}
            >
              Plan: {lastResult.plan}
            </span>

            <span
              style={{
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#8a968e",
              }}
            >
              {lastResult.memberId}
            </span>
          </div>
        </div>
      )}

      {/* Session Audit History Log */}
      <div
        style={{
          background: "#0d1612",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "14px",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
            Recent Scans This Session ({scanHistory.length})
          </h2>

          {scanHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setScanHistory([])}
              style={{
                background: "transparent",
                border: "none",
                color: "#8a968e",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Clear Log
            </button>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <p style={{ color: "#6b7a70", fontSize: "13px", margin: 0 }}>
            No scans recorded yet. Present a member pass to begin reception verification.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {scanHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "#111b15",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  fontSize: "13px",
                }}
              >
                <div>
                  <strong style={{ color: "#f3ede4" }}>
                    {item.memberName || `#${item.memberId.slice(-8).toUpperCase()}`}
                  </strong>
                  <span style={{ color: "#6b7a70", marginLeft: "8px" }}>
                    ({item.plan})
                  </span>
                  <div style={{ fontSize: "12px", color: "#8a968e", marginTop: "2px" }}>
                    {item.message}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: item.success
                        ? "rgba(74, 222, 128, 0.15)"
                        : item.status === "duplicate_scan"
                        ? "rgba(251, 191, 36, 0.15)"
                        : "rgba(248, 113, 113, 0.15)",
                      color: item.success
                        ? "#4ade80"
                        : item.status === "duplicate_scan"
                        ? "#fbbf24"
                        : "#f87171",
                    }}
                  >
                    {item.status.toUpperCase()}
                  </span>
                  <div style={{ fontSize: "11px", color: "#6b7a70", marginTop: "4px" }}>
                    {item.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  background: "#080e0a",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  color: "#f3ede4",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

