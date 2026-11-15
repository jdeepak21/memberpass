type IconName =
  | "lotus"
  | "sun"
  | "feather"
  | "shield"
  | "calendar"
  | "spark"
  | "arrow"
  | "check"
  | "qr"
  | "mapPin";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    lotus: (
      <>
        <path d="M12 3c-1.5 3-3.5 6-3.5 9a3.5 3.5 0 0 0 7 0c0-3-2-6-3.5-9z" />
        <path d="M12 12c-2.5-1-6-1-8 2 0 3.5 3 6 8 8" />
        <path d="M12 12c2.5-1 6-1 8 2 0 3.5-3 6-8 8" />
        <path d="M8.5 21a10 10 0 0 1-5.5-3" />
        <path d="M15.5 21a10 10 0 0 0 5.5-3" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14-1.41 1.41" />
      </>
    ),
    feather: (
      <>
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <path d="M16 8 2 22" />
        <path d="M17.5 15H9" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    qr: (
      <>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zm4 0h2v6h-2zm-4 4h2v2h-2z" />
      </>
    ),
    mapPin: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const studioFeatures = [
  {
    icon: "lotus" as IconName,
    title: "Mindful Yoga Practice",
    description:
      "A serene and dedicated yoga studio space in Coimbatore for regular, guided practice.",
    detail: "Studio Practice",
  },
  {
    icon: "qr" as IconName,
    title: "Digital Membership Pass",
    description:
      "Quick and contactless entry verification via your personal member QR pass on any mobile device.",
    detail: "QR Check-in",
  },
  {
    icon: "sun" as IconName,
    title: "Structured Memberships",
    description:
      "Clear, transparent plans tailored for both introductory and committed yoga practitioners.",
    detail: "Monthly Tiers",
  },
  {
    icon: "feather" as IconName,
    title: "Calm & Supportive Environment",
    description:
      "A welcoming studio atmosphere designed to support your wellness and consistent routine.",
    detail: "Welcoming Community",
  },
  {
    icon: "shield" as IconName,
    title: "Secure Digital Records",
    description:
      "Reliable verification and profile management powered by secure, authenticated membership accounts.",
    detail: "Protected Access",
  },
  {
    icon: "calendar" as IconName,
    title: "Member Portal",
    description:
      "Manage your active membership, review your plan details, and view your pass anytime online.",
    detail: "Member Dashboard",
  },
];

const howItWorks = [
  {
    number: "01",
    tag: "ACCOUNT",
    title: "Create Your Account",
    description:
      "Register with your name and email to access Thendral Yoga Loft membership services.",
  },
  {
    number: "02",
    tag: "PLAN",
    title: "Select a Membership",
    description:
      "Choose from our Basic, Premium, or Enterprise membership plans.",
  },
  {
    number: "03",
    tag: "PAYMENT",
    title: "Complete Online Payment",
    description:
      "Activate your membership through our secure Razorpay payment gateway.",
  },
  {
    number: "04",
    tag: "STUDIO PASS",
    title: "Receive Your Digital Pass",
    description:
      "Access your QR pass directly on your member dashboard for easy studio check-in.",
  },
];

const plans = [
  {
    name: "Basic",
    description:
      "Essential studio membership plan designed for foundational yoga practice.",
    price: "₹1,999",
    features: [
      "Eight yoga classes included",
      "Digital QR membership pass",
      "Online member portal access",
      "Studio check-in verification",
    ],
    unavailable: [
      "Unlimited monthly sessions",
      "Priority workshop reservations",
    ],
    action: "Select Basic Plan",
  },
  {
    name: "Premium",
    description:
      "Comprehensive membership plan for dedicated and regular yoga practitioners.",
    price: "₹5,999",
    features: [
      "Full monthly studio membership",
      "Digital QR membership pass",
      "Online member portal access",
      "Studio check-in verification",
      "Priority member support",
    ],
    unavailable: [],
    action: "Select Premium Plan",
    featured: true,
  },
  {
    name: "Enterprise",
    description:
      "Custom membership plan for private groups, teams, or organizational wellness.",
    price: "₹14,999",
    features: [
      "Group membership coverage",
      "Digital QR pass verification",
      "Dedicated member portal support",
      "Custom scheduling coordination",
    ],
    unavailable: [],
    action: "Select Enterprise Plan",
  },
];

export default function Home() {
  return (
    <main
      style={{
        background: "#0c1310",
        color: "#f3ede4",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(12, 19, 16, 0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <a
            href="#home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#f3ede4",
              fontWeight: 700,
              fontSize: "18px",
              letterSpacing: "0.5px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: "#2a4a39",
                color: "#7dd1a1",
              }}
            >
              <Icon name="lotus" size={20} />
            </span>
            <span>Thendral Yoga Loft</span>
          </a>

          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              fontSize: "14px",
            }}
            className="hidden md:flex"
          >
            <a href="#about" style={{ color: "#a5b0a8" }}>
              About
            </a>
            <a href="#features" style={{ color: "#a5b0a8" }}>
              Features
            </a>
            <a href="#how-it-works" style={{ color: "#a5b0a8" }}>
              How It Works
            </a>
            <a href="#pricing" style={{ color: "#a5b0a8" }}>
              Memberships
            </a>
            <a href="#contact" style={{ color: "#a5b0a8" }}>
              Contact
            </a>
          </nav>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <a
              href="/login"
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f3ede4",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Login
            </a>
            <a
              href="/signup"
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                background: "#3d7a5a",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Get Started <Icon name="arrow" size={15} />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Welcome Section */}
      <section
        id="home"
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "70px 24px 60px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(61, 122, 90, 0.2)",
              border: "1px solid rgba(125, 209, 161, 0.3)",
              color: "#7dd1a1",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              marginBottom: "20px",
            }}
          >
            <Icon name="mapPin" size={14} /> COIMBATORE, TAMIL NADU
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.15,
              fontWeight: 700,
              marginBottom: "20px",
              color: "#f5f0ea",
            }}
          >
            Welcome to <br />
            <span style={{ color: "#7dd1a1" }}>Thendral Yoga Loft</span>
          </h1>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#b0baa2",
              marginBottom: "32px",
              maxWidth: "520px",
            }}
          >
            A calm and dedicated yoga studio in Coimbatore offering structured
            membership plans, mindful practice, and instant digital QR passes
            for effortless studio check-in.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a
              href="#pricing"
              style={{
                padding: "13px 26px",
                borderRadius: "9px",
                background: "#3d7a5a",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              View Membership Plans <Icon name="arrow" size={16} />
            </a>
            <a
              href="#about"
              style={{
                padding: "13px 22px",
                borderRadius: "9px",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                color: "#f3ede4",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              About the Studio
            </a>
          </div>
        </div>

        {/* Studio Pass Preview Graphic */}
        <div
          style={{
            padding: "30px",
            borderRadius: "20px",
            background:
              "linear-gradient(145deg, #13241b 0%, #0d1813 60%, #0a110d 100%)",
            border: "1px solid rgba(125, 209, 161, 0.25)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
                }}
              >
                STUDIO MEMBERSHIP PASS
              </p>
              <h2 style={{ fontSize: "20px", margin: "4px 0 0" }}>
                Thendral Yoga Loft
              </h2>
            </div>
            <span
              style={{
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(74, 222, 128, 0.15)",
                color: "#4ade80",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              ACTIVE MEMBER
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              padding: "18px",
              borderRadius: "12px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "90px",
                background: "#ffffff",
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                color: "#0a110d",
                flexShrink: 0,
              }}
            >
              <Icon name="qr" size={60} />
            </div>
            <div>
              <p style={{ color: "#8a968e", fontSize: "12px", margin: "0 0 4px" }}>
                Location: Coimbatore, Tamil Nadu
              </p>
              <p style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 6px" }}>
                Digital Studio Check-in
              </p>
              <span style={{ color: "#7dd1a1", fontSize: "12px" }}>
                Verified Member Access
              </span>
            </div>
          </div>

          <p style={{ color: "#8a968e", fontSize: "12px", margin: 0, lineHeight: 1.5 }}>
            Generated immediately upon online payment verification. Present this
            pass at the studio entry.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
          }}
        >
          <div style={{ maxWidth: "680px", marginBottom: "48px" }}>
            <span
              style={{
                color: "#7dd1a1",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.5px",
              }}
            >
              ABOUT THE STUDIO
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: 700,
                margin: "12px 0 16px",
              }}
            >
              A Dedicated Space for Mindful Practice in Coimbatore
            </h2>
            <p style={{ color: "#b0baa2", lineHeight: 1.7, fontSize: "15px" }}>
              Thendral Yoga Loft was created to bring structured, consistent yoga
              practice to members in Coimbatore. We combine a peaceful,
              supportive environment with a modern digital membership experience
              so you can focus entirely on your practice and wellbeing.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderRadius: "14px",
                background: "#111b15",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(61, 122, 90, 0.25)",
                  color: "#7dd1a1",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon name="lotus" size={20} />
              </div>
              <h3 style={{ fontSize: "18px", margin: "0 0 10px" }}>
                Dedicated Yoga Space
              </h3>
              <p style={{ color: "#8a968e", fontSize: "14px", lineHeight: 1.6 }}>
                A focused environment designed to help you stay present and
                build a consistent, healthy yoga habit.
              </p>
            </div>

            <div
              style={{
                padding: "24px",
                borderRadius: "14px",
                background: "#111b15",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(61, 122, 90, 0.25)",
                  color: "#7dd1a1",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon name="qr" size={20} />
              </div>
              <h3 style={{ fontSize: "18px", margin: "0 0 10px" }}>
                Contactless Digital Entry
              </h3>
              <p style={{ color: "#8a968e", fontSize: "14px", lineHeight: 1.6 }}>
                Every activated membership includes a personal QR pass that can
                be scanned at the studio without physical paperwork.
              </p>
            </div>

            <div
              style={{
                padding: "24px",
                borderRadius: "14px",
                background: "#111b15",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(61, 122, 90, 0.25)",
                  color: "#7dd1a1",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon name="shield" size={20} />
              </div>
              <h3 style={{ fontSize: "18px", margin: "0 0 10px" }}>
                Transparent Memberships
              </h3>
              <p style={{ color: "#8a968e", fontSize: "14px", lineHeight: 1.6 }}>
                Clear monthly plans with secure online payments and instant
                membership status verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              color: "#7dd1a1",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            STUDIO EXPERIENCE
          </span>
          <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "12px 0 0" }}>
            Designed for Your Yoga Routine
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {studioFeatures.map((feat) => (
            <div
              key={feat.title}
              style={{
                padding: "24px",
                borderRadius: "14px",
                background: "#101813",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "9px",
                  background: "rgba(61, 122, 90, 0.25)",
                  color: "#7dd1a1",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon name={feat.icon} size={19} />
              </div>
              <h3 style={{ fontSize: "17px", margin: "0 0 8px" }}>
                {feat.title}
              </h3>
              <p style={{ color: "#8a968e", fontSize: "14px", lineHeight: 1.6, margin: "0 0 16px" }}>
                {feat.description}
              </p>
              <span
                style={{
                  color: "#7dd1a1",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {feat.detail} →
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                color: "#7dd1a1",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.5px",
              }}
            >
              MEMBERSHIP STEPS
            </span>
            <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "12px 0 0" }}>
              How It Works
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {howItWorks.map((step) => (
              <div
                key={step.number}
                style={{
                  padding: "24px",
                  borderRadius: "14px",
                  background: "#111b15",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "20px",
                      color: "#7dd1a1",
                      fontWeight: 700,
                    }}
                  >
                    {step.number}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1px",
                      color: "#6b7a70",
                      fontWeight: 700,
                    }}
                  >
                    {step.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: "17px", margin: "0 0 8px" }}>
                  {step.title}
                </h3>
                <p style={{ color: "#8a968e", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Membership Plans */}
      <section
        id="pricing"
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "80px 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              color: "#7dd1a1",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            MEMBERSHIP PLANS
          </span>
          <h2 style={{ fontSize: "32px", fontWeight: 700, margin: "12px 0 10px" }}>
            Choose Your Studio Membership
          </h2>
          <p style={{ color: "#8a968e", fontSize: "15px" }}>
            Transparent monthly membership plans for Thendral Yoga Loft.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "28px",
            alignItems: "stretch",
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                padding: "32px",
                borderRadius: "16px",
                background: plan.featured ? "#13231a" : "#101813",
                border: plan.featured
                  ? "2px solid #3d7a5a"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {plan.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "24px",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    background: "#3d7a5a",
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  RECOMMENDED
                </span>
              )}

              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "22px", margin: "0 0 8px" }}>
                  {plan.name}
                </h3>
                <p style={{ color: "#8a968e", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#f3ede4" }}>
                  {plan.price}
                </span>
                <span style={{ color: "#8a968e", fontSize: "13px" }}> / month</span>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  flexGrow: 1,
                }}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#d8dfd9",
                    }}
                  >
                    <span style={{ color: "#4ade80" }}>
                      <Icon name="check" size={15} />
                    </span>
                    {feature}
                  </li>
                ))}
                {plan.unavailable.map((unav) => (
                  <li
                    key={unav}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "14px",
                      color: "#6b7a70",
                    }}
                  >
                    <span>−</span>
                    {unav}
                  </li>
                ))}
              </ul>

              <a
                href={`/signup?plan=${encodeURIComponent(plan.name)}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "13px",
                  borderRadius: "9px",
                  background: plan.featured ? "#3d7a5a" : "rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: plan.featured ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                {plan.action}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Studio Location Section */}
      <section
        id="contact"
        style={{
          background: "rgba(255, 255, 255, 0.02)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#7dd1a1",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            STUDIO LOCATION
          </span>
          <h2 style={{ fontSize: "30px", fontWeight: 700, margin: "12px 0 16px" }}>
            Thendral Yoga Loft
          </h2>
          <p style={{ color: "#b0baa2", fontSize: "16px", lineHeight: 1.6, marginBottom: "28px" }}>
            Coimbatore, Tamil Nadu
          </p>

          <div
            style={{
              padding: "24px",
              borderRadius: "14px",
              background: "#101813",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              textAlign: "left",
              marginBottom: "32px",
            }}
          >
            <h3 style={{ fontSize: "16px", margin: "0 0 8px" }}>
              Studio Visiting & Attendance Note
            </h3>
            <p style={{ color: "#8a968e", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              Full studio arrival guidance and class timings are provided upon
              membership confirmation. Show your active digital QR pass at the
              studio reception during entry.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <a
              href="/signup"
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "#3d7a5a",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Join the Studio
            </a>
            <a
              href="/login"
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f3ede4",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Member Login
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "36px 24px",
          background: "#080e0a",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            color: "#6b7a70",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#7dd1a1" }}>
              <Icon name="lotus" size={16} />
            </span>
            <span style={{ color: "#a5b0a8", fontWeight: 600 }}>
              Thendral Yoga Loft
            </span>
            <span>• Coimbatore, Tamil Nadu</span>
          </div>

          <div>© 2026 Thendral Yoga Loft. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
