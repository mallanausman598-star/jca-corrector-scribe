import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Crown, Trophy, Sparkles } from "lucide-react";
import { fetchTopStudents, type LeaderboardEntry } from "@/lib/student";

// "Top Winner of the Week" — rotates every 3 days based on the highest XP.
// The 3-day cycle id is shared by all visitors so everyone sees the same champion.
function getCycleId() {
  const DAY = 24 * 60 * 60 * 1000;
  return Math.floor(Date.now() / (3 * DAY));
}

const CYCLE_KEY = "jca:winner-cycle";

export function WeeklyWinner() {
  const [winner, setWinner] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const cycle = getCycleId();
  const firedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchTopStudents(1).then((top) => {
      if (!alive) return;
      setWinner(top[0] ?? null);
      setLoading(false);

      // Celebrate once per 3-day cycle per device
      if (top[0] && !firedRef.current) {
        const last = typeof window !== "undefined" ? localStorage.getItem(CYCLE_KEY) : null;
        if (last !== String(cycle)) {
          firedRef.current = true;
          localStorage.setItem(CYCLE_KEY, String(cycle));
          setTimeout(() => burstConfetti(), 600);
        }
      }
    });
    return () => { alive = false; };
  }, [cycle]);

  // Cycle countdown
  const DAY = 24 * 60 * 60 * 1000;
  const cycleEndsAt = (cycle + 1) * 3 * DAY;
  const msLeft = cycleEndsAt - Date.now();
  const hoursLeft = Math.max(0, Math.floor(msLeft / (60 * 60 * 1000)));
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = hoursLeft % 24;

  return (
    <section className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">
            Hall of Fame
          </div>
          <h2 className="mt-1 text-2xl font-black md:text-3xl">
            Top Winner of the{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Week
            </span>
          </h2>
        </div>
        <div className="hidden text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:block">
          Next rotation in
          <div className="text-base font-black tabular-nums text-foreground">
            {daysLeft}d {remainingHours}h
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border-2 border-primary/60 bg-gradient-to-br from-black via-zinc-900 to-black p-1 shadow-[0_20px_80px_-20px_oklch(0.85_0.18_92/0.55)]"
        style={{
          animation: "winner-pulse 4s ease-in-out infinite",
        }}
      >
        {/* animated gradient border */}
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 blur-md"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.85 0.18 92), transparent 35%, oklch(0.85 0.18 92) 70%, transparent)",
            animation: "winner-spin 8s linear infinite",
          }}
          aria-hidden
        />
        <div className="relative rounded-[22px] bg-zinc-950/90 p-6 backdrop-blur-xl md:p-8">
          {/* sparkles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-primary"
                style={{
                  left: `${(i * 73) % 100}%`,
                  top: `${(i * 41) % 100}%`,
                  boxShadow: "0 0 8px oklch(0.85 0.18 92)",
                  animation: `winner-twinkle ${3 + (i % 5)}s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 ring-2 ring-primary md:h-24 md:w-24"
              style={{ boxShadow: "0 0 40px oklch(0.85 0.18 92 / 0.55)" }}
            >
              <Crown className="h-10 w-10 text-primary md:h-12 md:w-12" />
              <span className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                <Trophy className="h-3 w-3" /> Champion of the cycle
              </div>
              {loading ? (
                <div className="mt-3 h-10 w-48 animate-pulse rounded-md bg-zinc-800" />
              ) : winner ? (
                <>
                  <h3 className="mt-2 truncate text-3xl font-black text-white md:text-5xl">
                    {winner.name}
                  </h3>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Level {winner.level}
                  </p>
                </>
              ) : (
                <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">
                  Be the first champion!
                </h3>
              )}
            </div>

            <div className="text-center md:text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Top score
              </div>
              <div
                className="text-4xl font-black tabular-nums text-primary md:text-5xl"
                style={{ textShadow: "0 0 24px oklch(0.85 0.18 92 / 0.6)" }}
              >
                {winner?.xp ?? 0}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">XP</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-white/5 pt-4 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-500 md:justify-between">
            <span>Updated automatically every 3 days</span>
            <span className="sm:hidden">Next: {daysLeft}d {remainingHours}h</span>
          </div>
        </div>

        <style>{`
          @keyframes winner-spin { to { transform: rotate(360deg); } }
          @keyframes winner-pulse {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes winner-twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.6); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>
      </div>
    </section>
  );
}

function burstConfetti() {
  const yellow = ["#facc15", "#fde047", "#fbbf24", "#f59e0b", "#ffffff"];
  const fire = (ratio: number, opts: confetti.Options) =>
    confetti({
      particleCount: Math.floor(180 * ratio),
      spread: 70,
      origin: { y: 0.35 },
      colors: yellow,
      ...opts,
    });

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
