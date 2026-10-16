# AI Tasks

Follow-up to `TASKS.md`. **Goal:** make the AI something judges can *see*. Right now every Gemini call is a single JSON request: no tools, no grounding, no streaming, and no live or natural voice.

**Demo story:** a scam call comes in → Auntie cuts in → the user tries to pay anyway → the agent checks, shows each step, and blocks the transfer → the trusted contact gets the alert.

**Conventions:** same as `TASKS.md`. AI code lives in `src/server/<feature>`, calls `generate()` from `src/lib/ai/gemini.ts`, and uses a JSON schema with zod validation. On failure it returns `ApiError` 502. Model IDs come from `src/lib/env.server.ts`.

---

## Phase 1: Quick wins (day 1, morning)

### [ ] Auntie's real voice
- **Why:** the cheapest way to make the app feel alive. `speak()` uses the browser's voice and ignores the language setting.
- **Do:**
  - [ ] Add `POST /api/speak`: text plus language goes to Gemini TTS, and the route returns audio. Give it an auntie persona in the style prompt.
  - [ ] Have `speak()` in `src/utils/speech.ts` play that audio, and fall back to the browser voice if the request fails.
  - [ ] Pass the user's language (English, Sinhala or Tamil) from settings.
  - [ ] Read verdicts aloud on the Warn and Blocked screens, not only in Ask and Home.

### [ ] Demo-day hardening
- **Why:** a live demo that hits Gemini rate limits, or a judge who opens a fake page, costs points.
- **Do:**
  - [ ] Add a per-user rate limit on the AI routes (AUDIT F2).
  - [ ] Fix the open redirect after login in `src/services/auth.service.ts:85` (AUDIT F1).
  - [ ] Pick one mascot name, Bao or Kumari, and use it everywhere.
  - [ ] Rewrite `README.md`: the pitch, screenshots, how the AI works, and how to run it.

---

## Phase 2: Agentic transfer check (day 1)

### [ ] Tool-calling quick check
- **Why:** this turns "AI says 72" into an agent that investigates and shows its work, which is the strongest fraud story.
- **Do:**
  - [ ] Move `src/server/check/quick-check.ts` to Gemini function calling. Tools:
    - [ ] `payee_history`: past transfers to this payee, when it was added, and the total sent.
    - [ ] `cross_user_reports`: whether the same account number has been reported or flagged for other users (a mule signal).
    - [ ] `inspect_link`: if the reference or a pasted message has a URL, read it with URL Context.
    - [ ] `search_scam_pattern`: Google Search grounding on the scam script, with sources returned.
  - [ ] Store the tool trace on the transfer, as `steps[]` with tool, input, finding and points.
  - [ ] Show the trace live in `RiskBreakdown` ("🔍 checked payee… 🌐 searched…") with source links.
  - [ ] Keep the existing 0–54 model cap and score bands so the rule score still means the same thing.

---

## Phase 3: Auntie on the line (day 2)

### [ ] Live call listener
- **Why:** the moment judges will remember. Winning anti-scam projects interrupt the scam while it happens.
- **Do:**
  - [ ] Add `/guard`, a "Put the call on speaker" screen that streams the mic to the Gemini Live API.
  - [ ] Have the server mint a short-lived token, so the API key never reaches the browser.
  - [ ] Give the session a `flag_scam({type, confidence, quote})` tool. When it fires, Auntie interrupts out loud.
  - [ ] When scam confidence is high, turn on Money Lock automatically and alert the trusted contact.
  - [ ] Show a live transcript with the suspicious phrases highlighted.
  - [ ] Add a recorded scam-call clip to `/demo` so the demo doesn't depend on a real call.

---

## Phase 4: Second tier (if time allows)

### [ ] Link check in Scan
- [ ] Use URL Context and Search grounding to detect lookalike bank or brand domains, and show the sources it used.

### [ ] "I got scammed" recovery agent
- [ ] One tap builds a timeline from the transfer and drafts the bank dispute and the police report.
- [ ] List who to call first. Verify the Sri Lankan bank and police hotlines before adding them.

### [ ] Analyst copilot
- [ ] On `/analyst`, flag likely mule accounts (the same payee account across users) and group similar cases.
- [ ] Draft a suspicious-activity report for each case.

### [ ] Ask that takes action
- [ ] Use function calling for: lock an amount, set the savings goal, add a payee, start a transfer check.
- [ ] Stream the replies.

### [ ] Scam-baiter mode
- [ ] Auntie drafts replies to the scammer that waste their time and draw out the mule account number, which then goes into a report.

---

## Phase 5: Credibility

### [ ] Real eval page
- [ ] Run the scanner over about 30 labelled messages (scam and legitimate, Sri Lankan context).
- [ ] Show the real detection rate and false-positive rate on `/eval` in place of the made-up numbers.

### [ ] Trusted-contact alert actually sends
- [ ] Send a WhatsApp or SMS alert with approve and block links. Right now it is only recorded.

### [ ] Claim auto-filled from a receipt photo
- [ ] Unfinished item from Phase 3 of `TASKS.md`.
