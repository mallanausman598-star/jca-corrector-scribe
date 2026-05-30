import { useEffect, useState } from "react";
import { Crown, Sparkles, Trophy } from "lucide-react";
import { subscribeLeaderboard, type LeaderboardEntry } from "@/lib/student";

export function TopStudent() {
  const [leader, setLeader] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const unsub = subscribeLeaderboard((list) => setLeader(list[0] ?? null));
    return () => unsub();
  }, []);

  return (
    <section className="container mx-auto max-w-5xl px-4 pb-4 pt-2">
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-black via-zinc-900 to-black p-[2px] shadow-[0_20px_60px_-20px_oklch(0.85_0.18_92/0.55)]"
        style={{ animation: "leader-float 5s ease-in-out infinite" }}
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-60 blur-md"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.85 0.18 92), transparent 35%, oklch(0.85 0.18 92) 70%, transparent)",
            animation: "leader-spin 8s linear infinite",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-3 rounded-[14px] bg-zinc-950/90 px-4 py-4 backdrop-blur-xl sm:flex-row sm:gap-5 sm:px-6">
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-2 ring-primary sm:h-16 sm:w-16"
            style={{ boxShadow: "0 0 30px oklch(0.85 0.18 92 / 0.55)" }}
          >
            <Crown className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
            <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </span>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
              <Trophy className="h-3 w-3" /> Current Leader
            </div>
            {leader ? (
              <>
                <h3 className="mt-1 truncate text-2xl font-black text-white sm:text-3xl">
                  {leader.name}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Level {leader.level} • Top Student 🏆
                </p>
              </>
            ) : (
              <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                Be the first champion!
              </h3>
            )}
          </div>

          <div className="text-center sm:text-right">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Top XP
            </div>
            <div
              className="text-3xl font-black tabular-nums text-primary sm:text-4xl"
              style={{ textShadow: "0 0 24px oklch(0.85 0.18 92 / 0.6)" }}
            >
              {leader?.xp ?? 0}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
              Study hard — your name next?
            </div>
          </div>
        </div>

        <style>{`
          @keyframes leader-spin { to { transform: rotate(360deg); } }
          @keyframes leader-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
        `}</style>
      </div>
    </section>
  );
}
