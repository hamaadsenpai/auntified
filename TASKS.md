# Tasks

Hackathon theme: **BFSI: Intelligent Risk, Fraud & Financial Experiences** (fraud and risk, automating processes, customer experience, personalised finance).

**How the app is put together:** `page.tsx` files are thin wrappers around `src/features/*`. Data flows like this:

service (`src/services`) → store (`src/store`, loaded by `data-hooks.ts`) → component

Gemini calls go through `src/lib/ai/gemini.ts`. Transfer scoring lives in `scoreRules` (`server/check/transfer.ts`).

---

## Phase 1: Fraud depth (do first)

### [x] Scam message scanner
- **Why:** a fast fraud demo that reuses the verdict screens we already have.
- **Do:**
  - [x] Add a page where the user pastes an SMS or WhatsApp message, or uploads a screenshot.
  - [x] Have Gemini (multimodal) flag phishing, impersonation, fake links and urgency tactics.
  - [x] Show the result with the existing pass, warn or block verdict UI (`src/features/verdicts`).
  - [x] Add it to the nav and the `/demo` Fire controls.

### [x] Explainable risk score
- **Why:** judges reward a score you can explain.
- **Do:**
  - [x] Return reason codes and weights from `scoreRules`, e.g. new payee, 3× usual amount, late night, urgency words.
  - [x] Show the breakdown on the Score, Warn and Blocked screens.
  - [x] Have Gemini sum up the reasons in one plain sentence, in the user's tone.

### [x] Money Lock and trusted contact
- **Why:** protects elderly users and scam victims, which scores well on social impact.
- **Do:**
  - [x] Let the user lock part of a balance so it can't be sent out digitally.
  - [x] Let the user add a trusted contact in Settings.
  - [x] On a high-risk transfer, alert the trusted contact and hold the payment for a cooling-off period.

---

## Phase 2: Bank side and automation

### [x] Bank analyst dashboard
- **Why:** covers the financial-institution side, which the app doesn't have yet.
- **Do:**
  - [x] Add a queue of flagged transfers across users, with risk score and reasons.
  - [x] Add approve, hold and report actions.
  - [x] Restrict it to admin or demo accounts.

### [x] Statement upload and auto-categorisation
- **Why:** covers "automating complex processes".
- **Do:**
  - [x] Accept a PDF or CSV bank statement.
  - [x] Parse it with Gemini into ledger entries with categories.
  - [x] Detect recurring bills and subscriptions, and feed them into Roast leaks and Patterns.

---

## Phase 3: Insurance

### [x] Insurance lite
- **Why:** the only part of the theme the app doesn't touch.
- **Do (pick one):**
  - [x] A coverage-gap check: "you're under-covered for X", based on spending patterns.
  - [ ] A claim auto-filled from a receipt photo.
