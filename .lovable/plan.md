## Goal
Add admin/student privacy on the leaderboard, fix daily-quiz navigation, prevent same-day re-attempts, generate fresh FSC-level English MCQs daily via Lovable AI, and add streak/history analytics — without breaking the existing name-based Firebase flow.

## 1. Admin vs Student (passcode-based)
- Add `src/lib/auth.ts` — small role helper:
  - `getRole()` returns `"admin" | "student"` from `localStorage.jca:role`.
  - `unlockAdmin(passcode)` — compares against hardcoded `JCA-ADMIN-2026` (constant in file; user can change later). On match, sets role to admin.
  - `logoutAdmin()` clears the role.
- Add a small "Admin" button (key icon) in the header that opens a dialog with a passcode input.
- Pass `role` into `<Leaderboard />`.

## 2. Leaderboard privacy
Update `src/components/Leaderboard.tsx`:
- Admin view: unchanged — full list, all names/XP/levels.
- Student view: 
  - Top 3 podium (names visible — this is the public Topper section).
  - A "Your Rank" card showing only the current student's name, rank, XP, level.
  - "You're ranked #X of N students" line.
  - No other students' names/scores shown.
- `TopStudent` / `WeeklyWinner` stay public (toppers visible to everyone, per spec).

## 3. Daily quiz: one attempt per day + navigation
- In `src/lib/student.ts`, track `lastDailyDate` (already exists) and add `lastDailyScore`, `lastDailyTotal`.
- In `DailyChallenge.tsx`: if `lastDailyDate === todayKey()`, show a "Already completed today" screen with the score and a countdown to tomorrow, plus buttons: **Back to Dashboard**, **View Results**, **Try Grammar Quiz**, **Try Vocab Quiz** (since the daily one is locked, "Attempt Next Quiz" routes to a different category).
- After submitting Daily quiz: show a results screen with explanations + the same 4 navigation buttons (Back to Dashboard, Back to Daily Quiz dashboard, View Results [already shown], Attempt Next Quiz).
- Grammar/Vocab quizzes remain repeatable.

## 4. AI-generated daily MCQs
- New server function `src/lib/daily-quiz.functions.ts`:
  - `getDailyQuiz()` — checks Supabase `daily_quizzes` table for today's row (key = `YYYY-MM-DD`). If present, return it. Else call Lovable AI (`google/gemini-3-flash-preview`) with a prompt to generate 10 FSC-level English MCQs (grammar, vocab, comprehension mix) as structured JSON with `q`, `options[4]`, `answer` index, `explain`. Cache by inserting into the table, then return.
- New migration: create `public.daily_quizzes` table (`date_key text primary key`, `questions jsonb`, `created_at`). Public read (no auth in this app), service_role write. Server fn uses `supabaseAdmin`.
- `DailyChallenge.tsx` calls the server fn via `useServerFn` + react-query; shows loading state, falls back to local bank on error.
- Show full explanations after submission.

## 5. Stats / history / streak
- Streak already tracked in `awardQuiz`. Surface it in `StudentHub` (already shows badges; add a "🔥 N-day streak" line + "Quizzes taken: X", "Accuracy: Y%").
- Add a tiny score history (last 5 daily scores) in localStorage: `jca:dailyHistory` = `[{date, score, total}]`. Render mini sparkline-ish list in the daily results screen.

## 6. Runtime error
The SSR "Failed to fetch dynamically imported module" is a transient HMR artifact from the previous turn's edits; resolves on next clean build after these changes.

## Technical notes
- Files added: `src/lib/auth.ts`, `src/components/AdminUnlock.tsx`, `src/lib/daily-quiz.functions.ts`, `src/lib/daily-history.ts`, migration for `daily_quizzes`.
- Files edited: `Leaderboard.tsx`, `DailyChallenge.tsx`, `StudentHub.tsx`, `routes/index.tsx` (admin button + pass role to Leaderboard).
- No schema change to existing Firebase students collection; admin role lives in localStorage only (matches "simple passcode" choice).
- All changes preserve existing name-based onboarding and Firebase leaderboard.

## Out of scope (per your answers)
- Real email/password auth.
- Server-side admin role enforcement (passcode is client-side by design — explicit tradeoff).

Approve to build.