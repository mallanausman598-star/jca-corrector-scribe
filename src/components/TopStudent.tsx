import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { subscribeLeaderboard, type LeaderboardEntry } from "@/lib/student";

export function TopStudent() {
  const [leader, setLeader] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const unsub = subscribeLeaderboard((list) => setLeader(list[0] ?? null));
    return () => unsub();
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-4 pb-3 pt-1">
      <div
        className="group mx-auto inline-flex w-full max-w-md items-center gap-2.5 rounded-full border border-primary/50 bg-zinc-950/80 py-1.5 pl-1.5 pr-3 backdrop-blur-xl transition-all hover:border-primary"
        style={{ boxShadow: "0 6px 24px -10px oklch(0.85 0.18 92 / 0.5)" }}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          style={{ boxShadow: "0 0 14px oklch(0.85 0.18 92 / 0.7)" }}
        >
          <Crown className="h-4 w-4" />
        </span>

        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
          #1
        </span>

        {leader ? (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">
              {leader.name}
            </span>
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black tabular-nums text-primary">
              {leader.xp} XP
            </span>
          </>
        ) : (
          <span className="flex-1 truncate text-xs font-bold text-zinc-300">
            Be the first champion →
          </span>
        )}

        <span
          className="hidden text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:inline"
          aria-hidden
        >
          you next?
        </span>
      </div>
    </div>
  );
}
