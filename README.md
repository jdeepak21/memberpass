# Membrix — Thendral Yoga Loft

A digital membership management platform for **Thendral Yoga Loft, Coimbatore**.

Membrix helps yoga studios manage memberships, online payments, digital QR passes, attendance verification, and member engagement through a role-based dashboard.

Members can register, select a membership plan, make payments, access their digital QR membership pass, pause or resume their membership, and track class usage. Staff can verify passes using a QR scanner, while administrators can access management tools and AI-assisted member re-engagement.

**Live Website:** https://membrix-4a16mrpbd-deepakj21.vercel.app/  
**GitHub Repository:** https://github.com/jdeepak21/memberpass

--## Project Demo Video

**Membrix – Final M4 Project Demonstration**

[▶ Watch the Membrix Final Demo Video](https://drive.google.com/file/d/1R5ZEFVDxVHqxWCl8IBpA3OgRjZwiQEol/view?usp=drivesdk)

The video demonstrates the Membrix membership process, payment flow, QR-based attendance verification, and an explanation of the AI re-engagement API code.

## Features

### 1. Member Portal (`/dashboard`)

- Member registration and login.
- Membership plan selection: Basic, Premium, and Enterprise.
- Razorpay payment integration.
- Server-side payment verification using HMAC-SHA256.
- Digital QR membership pass.
- Basic membership monthly class usage tracking.
- Membership pause and resume functionality.
- Membership status display.

### 2. Staff Portal (`/staff`)

- Dedicated staff scanner portal.
- Camera-based QR scanning using `html5-qrcode`.
- Manual or barcode scanner input.
- Server-side membership pass verification.
- Audio and visual scan feedback.
- Duplicate-scan protection.
- Attendance audit logs.

### 3. Admin Dashboard (`/admin`)

- Role-based login redirection.
- Separate access for administrators, staff, and members.
- Quick navigation to the staff scanner, AI re-engagement assistant, and member dashboard.

### 4. AI Re-engagement Assistant (`/staff/re-engagement`)

- Finds active members who have not attended for a specified number of days.
- Uses granted attendance records to identify inactivity.
- Separately identifies active members who have never attended.
- Displays member name, membership plan, last attendance, and inactive duration.
- Uses Google Gemini AI to generate personalised messages.
- Includes fallback messages when AI generation is unavailable.
- Supports manual review and copying of messages.
- Does not automatically send WhatsApp or email messages.

Only active memberships are included in the attendance-based re-engagement lists.

### 5. Automation and Background Services

- Daily cron endpoint: `/api/cron/daily-check`.
- AI re-engagement API: `/api/ai/draft-reengagement`.
- Razorpay payment creation, verification, and webhook endpoints.
- Attendance verification API: `/api/staff/verify-pass`.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Language | TypeScript 5 |
| UI Styling | Tailwind CSS v4 |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Access Control | Role-based access control |
| Payments | Razorpay |
| QR Generation | qrcode.react |
| QR Scanning | html5-qrcode |
| AI Integration | Google Gemini API |
| Deployment | Vercel |
| Version Control | Git and GitHub |
| CI/CD | GitHub Actions |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jdeepak21/memberpass.git
cd memberpass
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

Add the following variable names with your own credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

CRON_SECRET=your_cron_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** Never upload `.env.local` or expose service-role keys, payment secrets, webhook secrets, or AI API keys in GitHub.

### 4. Run automated tests

```bash
npm test
```

The QR parser automated test suite contains 15 test cases.

### 5. Run lint checks

```bash
npm run lint
```

### 6. Create a production build

```bash
npm run build
```

### 7. Start the development server

```bash
npm run dev
```

Open:

http://localhost:3000

---

## Razorpay Test Mode

The application supports Razorpay Test Mode for payment testing.

Example test card details:

| Field | Value |
|---|---|
| Card number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

Use the appropriate Razorpay test environment when testing payments. Do not use real payment credentials in public documentation.

---

## Testing and Quality Checks

The following checks have been completed for the current M4 version:

| Check | Result |
|---|---|
| QR parser unit tests | 15 tests passed |
| ESLint | Passed |
| TypeScript production build | Passed |
| GitHub Actions CI | Passed |
| Vercel deployment | Ready |
| Attendance-based inactive-member detection | Tested |
| Never-attended member detection | Tested |
| Gemini personalised message generation | Tested |

The QR parser tests are unit tests; they do not represent full end-to-end testing of every application feature.

---

## Lighthouse Performance Results

Latest recorded Lighthouse scores for the live website:

| Category | Score |
|---|---:|
| Performance | 91 |
| Accessibility | 95 |
| Best Practices | 100 |
| SEO | 60 |

The mobile Performance score achieved the project's target of 85 or above.

See `docs/SPEED.png` for the Lighthouse evidence.

---

## Project Structure

```text
src/
└── app/
    ├── page.tsx
    ├── login/
    ├── signup/
    ├── admin/
    ├── dashboard/
    ├── staff/
    │   └── re-engagement/
    ├── auth/
    └── api/
        ├── ai/
        │   └── draft-reengagement/
        ├── cron/
        │   └── daily-check/
        ├── payment/
        │   ├── create/
        │   ├── verify/
        │   └── webhook/
        └── staff/
            └── verify-pass/

docs/
├── PLAN.pdf
└── SPEED.png
```

---

## Deployment

Membrix is deployed using Vercel.

**Live Application:**  
https://membrix-chi.vercel.app/

**Source Code:**  
https://github.com/jdeepak21/memberpass

The GitHub Actions workflow runs quality checks, including secret scanning, dependency installation, linting, and production build verification.


## Project Links

- **Live Website:** https://membrix-chi.vercel.app/
- **GitHub Repository:** https://github.com/jdeepak21/memberpass
- **Final Demo Video:** https://drive.google.com/file/d/1R5ZEFVDxVHqxWCl8IBpA3OgRjZwiQEol/view?usp=drivesdk

---

## Internship Project

**Project:** Membrix (originally MemberPass)  
**Client:** Thendral Yoga Loft, Coimbatore  
**Developer:** Deepak J  
**Program:** Vizdale Full-Stack Developer Internship  
**Year:** 2026

