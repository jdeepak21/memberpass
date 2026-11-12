# MemberPass — Thendral Yoga Loft

A digital membership management platform for Thendral Yoga Loft, Coimbatore.

Members can register, choose a membership plan, pay online, and receive a
digital QR membership pass. Studio staff scan the QR pass at entry.

Built with **Next.js**, **Supabase**, and **Razorpay**.

---

## Live Demo

> 🎥 **Demo video:** _[Link will be added before M2 submission]_

---

## Test Login Credentials

Use these credentials to explore the app without signing up:

| Field | Value |
|-------|-------|
| Email | `test@memberpass.dev` |
| Password | `test1234` |

> The test account has an **active Basic membership** so you can see the digital QR pass immediately after logging in.

---

## Features

- User registration and email confirmation
- Membership plan selection (Basic / Premium / Enterprise)
- Razorpay Test Mode payment integration
- Server-side payment verification (HMAC signature + Razorpay API)
- Digital QR membership pass displayed after payment
- Razorpay webhook for payment status updates
- Protected member dashboard

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

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Razorpay Test Mode

Payments use Razorpay Test Mode. Use these test card details:

| Field | Value |
|-------|-------|
| Card number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase |
| Payments | Razorpay |
| QR Codes | qrcode.react |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login
│   ├── signup/page.tsx       # Signup + plan selection
│   ├── dashboard/
│   │   ├── page.tsx          # Member dashboard (protected)
│   │   ├── MembershipPassCard.tsx  # Digital QR pass card
│   │   └── PayNowButton.tsx  # Razorpay checkout button
│   ├── auth/route.ts         # Email confirmation callback
│   └── api/payment/
│       ├── create/route.ts   # Create Razorpay order
│       ├── verify/route.ts   # Verify payment signature
│       └── webhook/route.ts  # Razorpay webhook handler
└── lib/supabase/
    ├── client.ts             # Browser Supabase client
    ├── server.ts             # Server-side Supabase client
    └── admin.ts              # Service-role admin client
```

---

## Internship Project

**Client:** Thendral Yoga Loft, Coimbatore
**Developer:** Deepak J
**Program:** Internship Project — 2026
