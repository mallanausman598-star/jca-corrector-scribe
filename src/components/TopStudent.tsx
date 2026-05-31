import { useEffect, useState } from "react";
import { Crown, Medal, Award } from "lucide-react";
import { subscribeLeaderboard, type LeaderboardEntry } from "@/lib/student";

const RANKS = [
  { Icon: Crown, color: "text-primary", ring: "ring-primary/70", glow: "oklch(0.85 0.18 92 / 0.6)" },
  { Icon: Medal, color: "text-zinc-200", ring: "ring-zinc-400/60", glow: "oklch(0.85 0 0 / 0.35)" },
  { Icon: Award, color: "text-amber-500", ring: "ring-amber-600/60", glow: "oklch(0.55 0.12 50 / 0.45)" },
];

export function TopStudent() {
  const [top, setTop] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsub = subscribeLeaderboard((list) => setTop(list.slice(0, 3)));
    return () => unsub();
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-4 pb-3 pt-1">
      <div
        className="mx-auto flex w-full max-w-3xl items-center gap-2 overflow-x-auto rounded-full border border-primary/40 bg-zinc-950/85 py-1.5 pl-2 pr-2 backdrop-blur-xl"
        style={{ boxShadow: "0 8px 28px -12px oklch(0.85 0.18 92 / 0.55)" }}
      >
        <span className="shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
          🏆 Top 3
        </span>

        {RANKS.map((r, i) => {
          const entry = top[i];
          const { Icon } = r;
          return (
            <div key={i} className="flex shrink-0 items-center gap-1.5">
              {i > 0 && <span className="text-zinc-700">·</span>}
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ring-1 ${r.ring} ${r.color}`}
                style={{ boxShadow: `0 0 10px ${r.glow}` }}
              >
                <Icon className="h-3 w-3" />
              </span>
              <span className="max-w-[7rem] truncate text-xs font-extrabold text-white">
                {entry?.name ?? "—"}
              </span>
              {entry && (
                <span className="text-[10px] font-black tabular-nums text-primary">
                  {entry.xp}
                </span>
              )}
            </div>
          );
        })}

        <span className="ml-auto hidden shrink-0 text-[9px] font-bold uppercase tracking-widest text-zinc-500 sm:inline">
          you next?
        </span>
      </div>
    </div>
  );
}
