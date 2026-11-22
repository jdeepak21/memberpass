# MemberPass — Thendral Yoga Loft

A digital membership management platform for **Thendral Yoga Loft, Coimbatore**.

Members can register, choose a membership plan, pay online, access their digital QR pass, pause/resume their membership, and track monthly class usage. Studio reception staff scan and verify passes at studio entry using a dedicated scanner portal.

Built with **Next.js 16**, **TypeScript**, **Supabase**, and **Razorpay**.

---

## 60-Second Project Demo

[Watch MemberPass M2 Demo](https://drive.google.com/file/d/1_NyMCD04JBw4WbODeGtM583yu43bIiu7/view?usp=sharing)

---

## Test Login Credentials

Use these credentials to explore the member app without signing up:

| Field | Value |
|---|---|
| Email | `test@memberpass.dev` |
| Password | `test1234` |

> The test account has an **active Basic membership** so you can see the digital QR pass immediately after logging in.

---

## Features

### Member Portal (`/dashboard`)
- User registration and email confirmation
- Membership plan selection (Basic / Premium / Enterprise)
- Razorpay Test Mode payment integration
- Server-side payment verification (HMAC-SHA256 signature check)
- Digital QR membership pass displayed upon active status
- **8-Class Monthly Usage Tracker**: Visual class progress bar for Basic plan members
- **Membership Pause & Resume**: Members can pause their practice; the pass updates instantly to "PAUSED"
- Razorpay webhook for asynchronous payment status updates

### Staff & Reception Tools (`/staff`)
- **Staff QR Scanner Portal**: Dedicated mobile-responsive camera scanner powered by `html5-qrcode`
- **Manual / Barcode Scanner Mode**: Fallback input for USB barcode guns or manual member ID lookups
- **Instant Audio-Visual Feedback**: Ascending chime on entry granted; warning buzz on denied/mismatch
- **Debounce Window**: 15-minute duplicate-scan protection prevents double-tapping
- **Session Audit Log**: Real-time log of recent scans with timestamps and result badges

### Automation & AI Services
- **Daily Cron Job** (`/api/cron/daily-check`): Scheduled check identifying practitioners inactive for >14 days and membership health metrics
- **AI-Assisted Re-Engagement Drafts** (`/api/ai/draft-reengagement`): Warm, mindful messages tailored for yoga students with a resilient, non-blocking template fallback

---

## Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/jdeepak21/memberpass.git
cd memberpass
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
CRON_SECRET=your_optional_cron_secret
GEMINI_API_KEY=your_optional_gemini_api_key
```

### 4. Run tests

```bash
npm test
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Razorpay Test Mode

Payments use Razorpay Test Mode. Use these test card details:

| Field | Value |
|---|---|
| Card number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase (PostgreSQL with RLS & RBAC) |
| Payments | Razorpay SDK (Test Mode) |
| QR Generation | `qrcode.react` |
| QR Scanning | `html5-qrcode` |
| Audio Feedback | Web Audio API |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── login/page.tsx                # Member login
│   ├── signup/page.tsx               # Member registration & plan selection
│   ├── dashboard/
│   │   ├── page.tsx                  # Protected member dashboard & 8-class tracker
│   │   ├── MembershipPassCard.tsx    # Digital QR pass card (Active/Paused)
│   │   └── PayNowButton.tsx          # Razorpay checkout trigger
│   ├── staff/
│   │   ├── page.tsx                  # Role-gated reception portal
│   │   └── StaffScannerClient.tsx    # Camera & manual QR scanner interface
│   ├── auth/route.ts                 # Email confirmation callback
│   └── api/
│       ├── payment/
│       │   ├── create/route.ts       # Create Razorpay order
│       │   ├── verify/route.ts       # Verify payment signature & activate
│       │   └── webhook/route.ts      # Razorpay webhook handler
│       ├── staff/
│       │   └── verify-pass/route.ts  # Staff pass verification & 8-class check
│       ├── cron/
│       │   └── daily-check/route.ts  # Daily background health check
│       └── ai/
│           └── draft-reengagement/route.ts # AI re-engagement message draft
└── lib/
    ├── qr/
    │   ├── parsePass.ts              # QR payload validator & parser
    │   └── parsePass.test.mjs        # Automated test suite (15 test cases)
    └── supabase/
        ├── client.ts                 # Browser client
        ├── server.ts                 # Server-side client
        └── admin.ts                  # Service-role administrative client
```

---

## Internship Project

**Client:** Thendral Yoga Loft, Coimbatore  
**Developer:** Deepak J  
**Program:** Internship Project — 2026
