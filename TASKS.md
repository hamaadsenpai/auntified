# Tasks

Backlog from a code audit (2026-10-14).

**Where things stand:** every API route under `src/app/api` is real. Data lives in Firestore and is reached only through the Firebase Admin SDK in `src/server/repositories`. Ask Auntie and the scam check call Gemini (`src/lib/ai/gemini.ts`). Every service in `src/services` has a UI caller, so there are no dead endpoints. The gaps below are UI features that aren't wired up, features the marketing page (`features/marketing/features.ts`) promises but the app doesn't have, and a handful of bugs.

**How the app is put together:** `page.tsx` files are thin wrappers around `src/features/*`. Data flows like this:

service (`src/services`) → store (`src/store`, loaded by `data-hooks.ts`) → component

Pages are protected by `src/proxy.ts` (it only checks that a session cookie exists) and `SessionGuard`, which verifies the session and redirects to onboarding.

---

## New features

### [x] Saved contacts, request money and split bills
- **Now:** payees can only be created inside the pay flow (`PayScreen.tsx`). They're reachable only through links (`/payees/[id]`), and there's no list page.
- **Do:**
  - [x] Add a `/payees` list page, linked from the nav.
  - [x] Let a payee be sent a money request.
  - [x] Add bill splitting (like Splitwise): who owes whom, and settling up.
- **Needs:** a new Firestore collection for requests or splits, plus API routes, a service and a store, following the existing `payees` pattern.

### [x] Demo bank top-up
- **Now:** `balanceSgd` is a number the user types in Settings. The only thing that changes it is a sent transfer, which takes money off (`transfers.repository.ts`).
- **Do:**
  - [x] Add a way to credit money: a one-off top-up, a simulated salary, or a recurring deposit
  - [x] Show credits in the Ledger
  - [x] Seed a starting balance or first salary — new users start at 0, so every transfer gets flagged "over balance"

---

## Wire what's fake

### [x] `/demo` controls
- **Now:** the stats are hard-coded (`DemoScreen.tsx:8-13`). The Seed, Fire, Jump clock and Reset buttons have no handlers (`:49, :56, :71, :79`). No API exists for any of them, and nothing links to the page.
- **Do:**
  - Seed: create sample payees, expenses and transfers.
  - Fire: run a scam-like transfer through the check.
  - Jump clock: shift the "now" that time-based rules and stats use.
  - Reset: wipe the user's data.
- Probably only for dev or demo accounts.

### [x] Voice (read aloud and answer by voice)
- **Now:**
  - The speaker buttons are disabled: `HomeAskForm.tsx:56-65` ("coming soon") and `AskMobile.tsx:31-39`.
  - The `voiceReplies` setting is saved but never read.
  - The "Answer by voice" mic has no handler (`CheckScreen.tsx:149-155`, `CheckDesktop.tsx:166-172`).
  - There's no text-to-speech anywhere.
- **Do:**
  - [x] Read replies aloud with text-to-speech (the browser's built-in `speechSynthesis` may be enough)
  - [x] Auto-play when `voiceReplies` is on
  - [x] Add speech-to-text for the mic in the scam check

### [x] "From" account select
- **Now:** one hard-coded option and no change handler (`FromAccountSelect.tsx:12-14`). The user has a single `accountName` and `balanceSgd`.
- **Do:**
  - [x] Support multiple accounts, each with its own balance
  - [x] Let the user pick which account pays (ties in with the demo bank top-up)

### Bank plug-in `/v1/preauth`
- **Now:** `/plugin` (`PluginBoard.tsx:6-37`) shows a made-up request and response for a pre-authorisation endpoint. The Features page links to it as a real feature (`features.ts:63-66`), but no route exists.
- **Do:** build the endpoint (a bank sends a pending payment and gets back pass, warn or block from the same scoring), or drop it from the marketing page.

### [x] Late-night rule
- **Now:** the Features page promises "warnings for odd timing, like paying after 10pm" (`features.ts:23`). `scoreRules` (`server/check/transfer.ts:58-84`) has no time rule. Patterns already works out the user's usual hours but doesn't feed them into scoring.
- **Do:** add a rule for paying outside usual hours or late at night, using the user's own pattern.

### Roast
- **Now:** it uses real expenses, but the "roast" sentence is a fixed template (`RoastMobile.tsx:26`, `RoastDesktop.tsx:47-52`). The "aiyoh..." badge is static. It ignores the Tone setting.
- **Do:**
  - Have Gemini write the roast, in the user's tone.
  - Add what `features.ts:29-30` promises: a monthly savings forecast, unused-subscription "leaks", and one-tap actions on suggested cuts. Today `NudgeCard` has no button.

### Forgot password
- **Now:** missing from `/login` and the auth service.
- **Do:** add a reset link using Firebase `sendPasswordResetEmail`.

### Terms
- **Now:** the signup "I agree to the terms" checkbox (`SignupScreen.tsx:34-37`) is only required in the browser. It's never stored, and there's no terms page or link.
- **Do:** add a terms page, link it from the checkbox, and save when the user agreed on their record.

---

## Bugs

### [x] Ask stops working after about 10 exchanges
- `HomeAskForm.tsx:29` (and the Ask page) send the whole conversation, but `api/ask/route.ts:11` accepts at most 20 turns. After that, every question fails with "Invalid question."
- The input also has no 500-character limit, while the API rejects anything longer.
- [x] **Fix:** send only the last 20 turns, and add `maxLength={500}` with a character counter.

### Balance can go below zero
- The debit at `transfers.repository.ts:76` has no lower limit, so a "pay anyway" or a passed transfer can push the balance negative.
- [x] **Fix:** block the transfer or warn hard on the server when the amount is more than the balance.

### "Pay anyway" doesn't refresh
- After Pay anyway (`WarnScreen.tsx:36-37`), the balance and payee data on screen are out of date. A passing check does refresh them (`QuickCheckProvider.tsx:69-73`).
- **Fix:** reload the settings and transfers stores the same way.

### Patterns and Home disagree on "normal"
- Patterns divides by 12 weeks (`PatternsScreen.tsx:80, :85`); Home divides by 4 (`home-data.ts:43`).
- Short histories also come out too low, because the divisor is fixed.
- **Fix:** share one helper, and divide by the number of weeks of data you actually have.

### Payee "Category" tile shows the note
- `PayeeScreen.tsx:88` shows `payee.note` under the "Category" label.
- **Fix:** rename the label, or add a real category field.

### Currency save fails silently
- If PATCH `/api/me/preferences` fails, `currency.store.ts:24-26` switches back to the old currency with no message.
- **Fix:** show an error.

### Scam check ignores Language and Tone
- `quick-check.ts:16` forces "plain friendly English". Ask Auntie already passes language and tone (`ask.ts:33-34`).
- **Fix:** pass the same settings into the check prompt.

### [x] Features page Try-it links are broken
- "Scam check" links to `/pay/check` and "Warn or block" to `/pay/blocked/why` (`features.ts:17, :24`), both with no `?id`. Both pages show "not found".
- **Fix:** link to `/pay` to start a real flow, or to a seeded demo transfer.

### [x] Public design boards
- `/eval`, `/kit`, `/mascot` and `/plugin` aren't in `proxy.ts` and have no guard, so anyone can open them.
- `/eval` and `/plugin` show made-up data (`EvalBoard.tsx:5-20`, `PluginBoard.tsx`).
- **Fix:** protect them, hide them in production, or delete them.

### [x] Signed-in users can still open `/login` and `/signup`
- Neither page redirects someone who's already logged in.
- **Fix:** if a valid session exists, send them to `/home`. Use the same check `OnboardingGate` uses.
