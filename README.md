# Auntified

**Auntie Kumari reads your ledger and stops scams before they go.**

Auntified is a money app with a blunt, caring Sri Lankan auntie built in. Before a risky transfer leaves your account, Auntie Kumari holds it, asks you a few sharp questions and warns or blocks it. The rest of the time she roasts your spending, answers "can I afford this?" from your own data, and checks suspicious messages for scams. She speaks Sri Lankan English, English, Sinhala or Tamil, in a Roast or Gentle tone.

Built for the hackathon theme **BFSI: Intelligent Risk, Fraud & Financial Experiences**.

### Demo story

1. A scammer gets the user to add a new payee, "Elite Crypto Desk", and send a large first transfer marked "urgent".
2. The rule engine flags it straight away: payee added minutes ago, first transfer, many times the usual amount, pressure word in the reference.
3. Auntie holds the money and asks up to three questions. *"Who is this payee to you? He told you to pay today, noh?"*
4. The answers push the score over 70, so the transfer is **blocked**, with a plain-language explanation of every point.
5. The trusted contact gets an alert, and the case shows up in the bank analyst queue for approve, hold or report.

The `/demo` page sets this up in one click: **Seed** loads about 90 days of realistic history, and **Fire** holds the scam transfer through the real rules.

## Screenshots

<!-- Screenshots go in docs/screenshots/ (none are committed yet). Suggested: landing, /pay/check conversation, /pay/blocked, /scan, /roast, /analyst. -->

## Features

| Feature | Route | What it does |
| --- | --- | --- |
| Scam check before you pay | `/pay` → `/pay/check` | Auntie questions you about a held transfer, then passes, warns or blocks it |
| Warn or block | `/pay/warn`, `/pay/blocked` | Warned payments cool off for 12 hours before "pay anyway" works; blocks are final |
| Explainable risk score | `/pay/blocked/why` | Every rule flag and its points, the AI's share, and a one-sentence summary |
| Money Lock and trusted contact | `/settings` | Lock part of a balance; a trusted contact is alerted on a warn or block |
| Scam message scanner | `/scan` | Paste an SMS or WhatsApp message, or upload a screenshot |
| Weekly roast | `/roast` | A short verdict on your week, with subscription leaks and cuts to make |
| Ask Auntie | `/ask` | Chat about your money; she answers only from your own ledger |
| Statement import | `/roast` | Upload a PDF or CSV bank statement; it becomes categorised expenses |
| Patterns and coverage gaps | `/patterns` | This week against your usual, plus insurance gaps based on your spending |
| Decision log | `/ledger` | Every verdict and roast, filterable |
| Bank analyst queue | `/analyst` | Flagged transfers across users, riskiest first, with approve, hold and report |

## How the AI works

All AI runs on the server through Google Gemini (`@google/genai`). The API key never reaches the browser.

**One shared client** (`src/lib/ai/gemini.ts`). Every feature calls `generate()`, which tries `GEMINI_MODEL` first and falls back to `GEMINI_FALLBACK_MODEL` when Google returns 429 or a 5xx. Retries are short because the user is waiting on screen.

**Structured, validated output.** Each feature sends a system prompt that sets Auntie's persona, tone and language, plus a JSON schema (`responseJsonSchema`). The reply is then checked with **zod** before anything is used or saved. A failed call returns `502 AI_UNAVAILABLE`, and output that doesn't match the schema returns `502 AI_BAD_OUTPUT`; the screen offers "Try again". Every prompt treats user content as data, never as instructions, and says that an attempt to override the rules is itself a scam signal.

| Feature | Code | What Gemini does |
| --- | --- | --- |
| Transfer quick check | `src/server/check/quick-check.ts` | Asks one question per turn (up to 3), then returns `{reply, done, modelScore, reasons, summary}` |
| Scam scanner | `src/server/scan/scan.ts` | Multimodal (text or screenshot): `{score 0–100, tactics[], reasons, summary}`, with tactics from phishing, impersonation, fake_link and urgency |
| Weekly roast | `src/server/roast/roast.ts` | Gets the week's facts (totals, categories, usual week, leaks, goal) and returns `{badge, roast}` |
| Ask Auntie | `src/server/ask/ask.ts` | Gets a summary of your balances, expenses, transfers and payees, and replies in plain text under 80 words |
| Statement import | `src/server/statements/statement.ts` | Reads a PDF (or CSV text) into `{entries: [{date, name, amount, category, recurring}]}`; each line is validated and bad lines are dropped |

**The risk score is half rules, half AI.** `scoreRules()` in `src/server/check/transfer.ts` is deterministic and adds up to **46** points: a new payee, a first transfer, 3x the usual amount, scam reports, an odd hour in Sri Lanka time, urgency words, or more than the balance. Gemini adds up to **54** from your answers. The total maps to the bands pass (under 40), warn (40 to 69) and block (70 and up). The model can't push a payment past its question budget, and its score is clamped.

**Rate limit.** Every AI route shares a per-user limit of 60 calls an hour. Past it, the route returns `429 RATE_LIMITED`, so a busy demo can't burn through the Gemini quota.

## Tech stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents`, standalone output), **React 19.3**, **TypeScript**
- **Tailwind CSS 4**, Zustand, react-hot-toast
- **Google Gemini** via `@google/genai`, with **zod** validation
- **Firebase Auth** (email/password and Google) with httpOnly session cookies
- **Firestore** through `firebase-admin` only. `firestore.rules` denies all browser access.
- **Cloud Run** + Cloud Build + Secret Manager (region `asia-south1`)

## Run locally

Requirements: Node 22, a Firebase project with Auth (Email/Password and Google) and Firestore enabled, and a Gemini API key from Google AI Studio.

1. Create `.env.local` in the repo root:

   ```bash
   # Firebase Admin (Project settings → Service accounts → Generate new private key). Server-only.
   FIREBASE_PROJECT_ID=
   FIREBASE_CLIENT_EMAIL=
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Gemini (Google AI Studio → API keys). Server-only.
   GEMINI_API_KEY=
   GEMINI_MODEL=gemini-3.8-flash            # optional, this is the default
   GEMINI_FALLBACK_MODEL=gemini-3.6-flash   # optional, this is the default

   # Firebase web app config (Project settings → Your apps)
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_DEMO_MODE=      # "true" turns on /demo in production builds (always on in dev)
   ADMIN_EMAILS=               # comma-separated emails allowed into /analyst (any account in demo mode)
   ```

   The server fails at startup with `Missing env var …` if a required key is missing. Never commit service-account keys.

2. Install and start:

   ```bash
   npm install
   npm run dev
   ```

3. Open <http://localhost:3000>, sign up, then go to `/demo` and press **Seed** and **Fire** to walk through the scam story.

4. Apply `firestore.rules` to your project (paste it into the Firebase console). The app only reaches Firestore through the Admin SDK.

Other scripts: `npm run build && npm start` (production), `npm run lint`.

## Deploy

Production runs on **Cloud Run** (`asia-south1`), built from the multi-stage `Dockerfile` (Next.js standalone output, port 8080).

- `cloudbuild.yaml` builds the image, pushes it to Artifact Registry and updates the `auntified` Cloud Run service. A GitHub push trigger on `main` runs it.
- `scripts/deploy.sh` runs the same build from your working tree without pushing.
- Public config lives in the committed `.env.production`. `FIREBASE_PRIVATE_KEY` and `GEMINI_API_KEY` come from **Secret Manager**: at build time they are mounted as a BuildKit secret and never stored in an image layer, and at runtime they are set on the Cloud Run service.
