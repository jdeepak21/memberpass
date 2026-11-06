type IconName =
  | "wallet"
  | "qr"
  | "shield"
  | "star"
  | "sync"
  | "sliders"
  | "arrow"
  | "check"
  | "spark"
  | "concierge";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 9h18m-5 5h.01" />
      </>
    ),
    qr: (
      <>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zm4 0h2v6h-2zm-4 4h2v2h-2z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    sync: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" />
      </>
    ),
    sliders: (
      <>
        <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4" />
      </>
    ),
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    spark: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
        <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
      </>
    ),
    concierge: (
      <>
        <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
        <path d="M4 14h3v6H6a2 2 0 0 1-2-2v-4Zm16 0h-3v6h1a2 2 0 0 0 2-2v-4Zm-8 7h2" />
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

const benefits: {
  icon: IconName;
  title: string;
  description: string;
  detail: string;
}[] = [
  {
    icon: "wallet",
    title: "Digital Membership Pass",
    description:
      "Dynamic holographic passes saved directly into your mobile wallet, with secure access even when offline.",
    detail: "Apple & Google Wallet ready",
  },
  {
    icon: "qr",
    title: "Instant QR Verification",
    description:
      "Rotating tokens help prevent screenshot fraud and make check-in quick at participating venues.",
    detail: "Rotating anti-fraud token",
  },
  {
    icon: "shield",
    title: "Secure Authentication",
    description:
      "Device-bound credentials and encrypted verification keep your digital membership protected.",
    detail: "Device-level protection",
  },
  {
    icon: "star",
    title: "Exclusive Member Benefits",
    description:
      "Discover member-only experiences, priority reservations, and benefits offered by partner venues.",
    detail: "Member privileges",
  },
  {
    icon: "sync",
    title: "Real-Time Access Sync",
    description:
      "Keep your venue access, guest passes, and membership activity in sync wherever you travel.",
    detail: "Connected access",
  },
  {
    icon: "sliders",
    title: "Smart Permissions Dashboard",
    description:
      "Review your access, manage guest permissions, and keep track of your membership in one place.",
    detail: "Your access, in control",
  },
];

const steps: { number: string; tag: string; title: string; description: string }[] = [
  {
    number: "01",
    tag: "IDENTITY CHECK",
    title: "Create your account",
    description: "Set up your profile and verify your identity to get started.",
  },
  {
    number: "02",
    tag: "TIER SELECTION",
    title: "Choose membership",
    description: "Pick the membership that fits your lifestyle and access needs.",
  },
  {
    number: "03",
    tag: "MOBILE PROVISION",
    title: "Get your digital pass",
    description: "Add your secure membership pass to your mobile wallet.",
  },
  {
    number: "04",
    tag: "INSTANT PRIVILEGES",
    title: "Unlock exclusive access",
    description: "Check in at participating venues and enjoy member benefits.",
  },
];

const plans = [
  {
    name: "Basic",
    description: "Essential digital access for local club exploration and city events.",
    price: "₹1,999",
    features: [
      "Access to 50+ local partner venues",
      "Instant QR dynamic verification",
      "Native mobile pass",
    ],
    unavailable: ["Apple / Google Wallet NFC tap", "Companion guest passes"],
    action: "Get started with Basic",
  },
  {
    name: "Premium",
    description: "Complete global passport for frequent travelers and lifestyle enthusiasts.",
    price: "₹5,999",
    features: [
      "500+ global partner clubs & lounges",
      "Apple & Google Wallet tap-and-go",
      "Priority gate entrance",
      "2 companion guest passes / month",
      "Dedicated concierge priority line",
    ],
    unavailable: [],
    action: "Join Premium",
    featured: true,
  },
  {
    name: "Enterprise",
    description: "Sovereign infrastructure for family offices, clubs, and executive teams.",
    price: "₹14,999",
    features: [
      "Multi-seat pass management",
      "Custom brand card styling",
      "REST API & hardware SDK",
      "Dedicated account support",
      "Custom access control sync",
    ],
    unavailable: [],
    action: "Contact enterprise",
  },
];

export default function Home() {
  return (
    <main>
      <div className="ambient ambient-top" aria-hidden="true" />
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <header className="site-header">
        <div className="nav-shell">
          <a className="brand" href="#home" aria-label="Membrix home">
            <span className="brand-mark">M</span>
            <span>
              Membrix
            </span>
          </a>

          <nav className="main-nav" aria-label="Main navigation">
            <a className="nav-active" href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#membership">Membership</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>

          <a className="button button-primary nav-cta" href="#pricing">
            Get started <Icon name="arrow" size={16} />
          </a>
        </div>
      </header>

      <div className="page-shell">
        <section className="hero section-anchor" id="home">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> THE FUTURE OF DIGITAL MEMBERSHIP</span>
            <h1>
              One Pass.
              <br />
              Unlimited
              <br />
              <span className="gradient-text">Possibilities.</span>
            </h1>
            <p className="hero-description">
              Experience a smarter way to access exclusive memberships,
              premium benefits, and unforgettable experiences across the
              world&apos;s most discerning spaces.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#pricing">
                Get your pass <Icon name="arrow" size={17} />
              </a>
              <a className="button button-glass" href="#features">
                <span className="button-icon"><Icon name="spark" size={16} /></span>
                Explore features
              </a>
            </div>
            <div className="social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>AC</span><span>JM</span><span>SK</span><span>+</span>
              </div>
              <div className="rating">
                <span className="stars" aria-label="5 out of 5 stars">★★★★★</span>
                <span>Trusted by 10,000+ discerning members worldwide</span>
              </div>
            </div>
          </div>

          <div className="pass-stage" aria-label="Digital Membrix preview">
            <div className="pass-glow" />
            <div className="verification-chip">
              <span className="live-dot" />
              <span><strong>Instant Verification</strong><small>Validated in 0.12s</small></span>
              <Icon name="shield" size={17} />
            </div>
            <article className="membership-pass">
              <div className="pass-sheen" />
              <div className="pass-header">
                <div className="pass-brand">
                  <span className="pass-symbol">M</span>
                  <span>Membrix<small>SOVEREIGN PROTOCOL</small></span>
                </div>
                <span className="pass-status"><span className="live-dot" /> PREMIUM</span>
              </div>
              <div className="pass-chip"><span /></div>
              <p className="pass-code">ENC-SHA256&nbsp; • &nbsp;#0042-ALPHA</p>
              <div className="pass-divider" />
              <div className="pass-holder">
                <div>
                  <span className="micro-label">CARDHOLDER</span>
                  <strong>Alexandra Chen</strong>
                  <small>FOUNDER&apos;S TIER&nbsp; • &nbsp;#0042</small>
                </div>
                <div className="qr-preview" aria-label="QR pass preview">
                  <Icon name="qr" size={35} />
                </div>
              </div>
              <div className="pass-footer">
                <span><Icon name="shield" size={14} /> HARDWARE ENCLAVE ACTIVE</span>
                <span>EXP 12/28</span>
              </div>
            </article>
            <div className="venue-toast">
              <span className="venue-icon"><Icon name="check" size={16} /></span>
              <span><strong>Aura Sky Club</strong><small>VIP Lounge Unlocked</small></span>
              <span className="toast-check"><Icon name="check" size={15} /></span>
            </div>
          </div>
        </section>

        <section className="trust-panel" aria-label="Membrix statistics">
          <div className="metric">
            <strong>10K<span>+</span></strong>
            <b>Active Privileged Members</b>
            <small>Across 42 international metropolises</small>
          </div>
          <div className="metric metric-gold">
            <strong>500<span>+</span></strong>
            <b>Exclusive Venues &amp; Partners</b>
            <small>Luxury hotels, private clubs &amp; VIP venues</small>
          </div>
          <div className="metric">
            <strong>99.9<span>%</span></strong>
            <b>Secure Gate Reliability</b>
            <small>Cryptographic verification at every entry</small>
          </div>
          <div className="alliance-row">
            <span>ACCREDITED ACROSS GLOBAL LUXURY ALLIANCES</span>
            <div>
              <b>AURA SKY CLUB</b><b>L&apos;OBSERVATOIRE</b><b>VELOX PRIVÉ</b>
              <b>NOVA EXPEDITION</b><b>THE FOUNDRY</b>
            </div>
          </div>
        </section>

        <section className="content-section section-anchor" id="features">
          <div className="section-heading">
            <span className="eyebrow">PLATFORM ARCHITECTURE</span>
            <h2>Everything You Need. <span>One Digital Pass.</span></h2>
            <p>
              Designed for frictionless entry and unparalleled privilege
              across private clubs, luxury venues, and digital enclaves.
            </p>
          </div>
          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <article className="benefit-card glass-card" key={benefit.title}>
                <div className="feature-icon"><Icon name={benefit.icon} size={19} /></div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
                <div className="card-link">
                  <span>{benefit.detail}</span><Icon name="arrow" size={16} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section steps-section section-anchor" id="how-it-works">
          <div className="section-heading">
            <span className="eyebrow">SIMPLE ONBOARDING</span>
            <h2>Your Membership, <span>Made Simple.</span></h2>
            <p>From invitation to your first venue entry in just a few steps.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article className="step-card glass-card" key={step.number}>
                <div className="step-top">
                  <span className={`step-number step-${index + 1}`}>{step.number}</span>
                  {index < steps.length - 1 && <span className="step-line" />}
                </div>
                <span className="micro-label">{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="reserve-banner section-anchor" id="membership">
          <div className="reserve-copy">
            <span className="tier-badge"><Icon name="star" size={13} /> SOVEREIGN PRIVILEGE TIER</span>
            <h2>The Black &amp; Gold<br />Reserve Pass</h2>
            <p>
              Engineered for members who expect exceptional access and
              thoughtful, personal service wherever life takes them.
            </p>
            <div className="reserve-perks">
              <span><Icon name="check" size={15} /> 24/7 dedicated concierge</span>
              <span><Icon name="check" size={15} /> Unlimited global lounges</span>
              <span><Icon name="check" size={15} /> Companion guest privileges</span>
              <span><Icon name="check" size={15} /> Priority dining reservations</span>
            </div>
            <div className="reserve-actions">
              <a className="button button-gold" href="#pricing">Explore premium <Icon name="arrow" size={16} /></a>
              <span><Icon name="shield" size={15} /> Subject to membership review</span>
            </div>
          </div>
          <div className="reserve-card-wrap">
            <article className="reserve-card">
              <div className="reserve-card-top">
                <span className="reserve-emblem"><Icon name="shield" size={23} /></span>
                <span>RESERVE BLACK<small>SOVEREIGN MEMBER</small></span>
              </div>
              <div className="reserve-medallion"><Icon name="star" size={30} /></div>
              <div className="reserve-card-bottom">
                <span>SV-9941<small>MEMBER ID</small></span>
                <span>MEMBRIX<small>LIFETIME ACCESS</small></span>
              </div>
            </article>
          </div>
        </section>

        <section className="content-section pricing-section section-anchor" id="pricing">
          <div className="section-heading">
            <span className="eyebrow">TRANSPARENT TIERS</span>
            <h2>Tailored to <span>Your Lifestyle</span></h2>
            <p>Flexible plans for individuals, frequent travelers, and private enterprises.</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <article className={`plan-card glass-card${plan.featured ? " plan-featured" : ""}`} key={plan.name}>
                {plan.featured && <span className="popular-badge">MOST POPULAR</span>}
                <div className="plan-head">
                  <div>
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </div>
                  {plan.featured && <Icon name="star" size={18} />}
                </div>
                <div className="plan-price">{plan.price}<span> / month</span></div>
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}><span className="check-icon"><Icon name="check" size={13} /></span>{feature}</li>
                  ))}
                  {plan.unavailable.map((feature) => (
                    <li className="feature-disabled" key={feature}><span className="minus-icon">−</span>{feature}</li>
                  ))}
                </ul>
                <a className={`button plan-button${plan.featured ? " button-primary" : " button-glass"}`} href="#contact">
                  {plan.action}<Icon name="arrow" size={15} />
                </a>
              </article>
            ))}
          </div>
          <p className="pricing-note">Membership benefits and availability may vary by participating venue.</p>
        </section>

        <section className="final-cta section-anchor" id="contact">
          <span className="eyebrow">GLOBAL ADMISSIONS OPEN</span>
          <h2>Ready to Experience<br />Membership Differently?</h2>
          <p>
            Step into a more connected world of privileged access, a secure
            digital identity, and experiences worth remembering.
          </p>
          <div className="cta-actions">
            <a className="button button-primary" href="#pricing">Get started today <Icon name="arrow" size={16} /></a>
            <a className="button button-glass" href="#pricing"><Icon name="concierge" size={16} /> Explore membership options</a>
          </div>
          <div className="cta-note"><Icon name="check" size={14} /> Explore membership options with no commitment</div>
        </section>

        <footer className="site-footer">
          <div className="footer-main">
            <div className="footer-about">
              <a className="brand" href="#home">
                <span className="brand-mark">M</span>
                <span>Membrix</span>
              </a>
              <p>
                A simpler way to manage digital membership, member benefits,
                and access to experiences around the world.
              </p>
              <span className="system-status"><span className="live-dot" /> SYSTEM OPERATIONAL</span>
            </div>
            <div className="footer-column">
              <h3>Platform</h3>
              <a href="#features">Digital passes</a>
              <a href="#features">Secure verification</a>
              <a href="#features">Member benefits</a>
              <a href="#features">Access management</a>
            </div>
            <div className="footer-column">
              <h3>Membership</h3>
              <a href="#pricing">Basic</a>
              <a href="#pricing">Premium</a>
              <a href="#pricing">Enterprise</a>
              <a href="#membership">Reserve pass</a>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <a href="#how-it-works">How it works</a>
              <a href="#contact">Contact</a>
              <a href="#contact">Member support</a>
              <a href="#contact">Privacy &amp; security</a>
            </div>
            <div className="footer-column footer-connect">
              <h3>Connect</h3>
              <a href="#pricing">Explore membership options <Icon name="arrow" size={14} /></a>
              <span>Global member network</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Membrix. All rights reserved.</span>
            <div><a href="#contact">Privacy</a><a href="#contact">Terms</a><a href="#contact">Accessibility</a></div>
            <span className="footer-edition">MEMBERSHIP, REIMAGINED</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
