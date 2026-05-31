import { useEffect, useState } from "react";
import { Crown, Medal, Award } from "lucide-react";
import { subscribeLeaderboard, type LeaderboardEntry } from "@/lib/student";

const RANKS = [
  { icon: Crown, label: "#1", ring: "ring-primary", bg: "bg-primary", text: "text-primary-foreground", glow: "0 0 14px oklch(0.85 0.18 92 / 0.7)" },
  { icon: Medal, label: "#2", ring: "ring-zinc-300", bg: "bg-zinc-300", text: "text-zinc-900", glow: "0 0 12px oklch(0.85 0 0 / 0.45)" },
  { icon: Award, label: "#3", ring: "ring-amber-700", bg: "bg-amber-700", text: "text-white", glow: "0 0 12px oklch(0.55 0.12 50 / 0.55)" },
];

export function TopStudent() {
  const [top, setTop] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsub = subscribeLeaderboard((list) => setTop(list.slice(0, 3)));
    return () => unsub();
  }, []);

  return (
    <div className="container mx-auto max-w-5xl px-4 pb-3 pt-1">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="h-px w-8 bg-border" />
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
          Top 3 Champions
        </span>
        <span className="h-px w-8 bg-border" />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {RANKS.map((r, i) => {
          const entry = top[i];
          const Icon = r.icon;
          return (
            <div
              key={r.label}
              className={`group flex items-center gap-2.5 rounded-full border border-border/70 bg-zinc-950/80 py-1.5 pl-1.5 pr-3 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/70`}
              style={{ boxShadow: "0 6px 20px -12px oklch(0.85 0.18 92 / 0.4)" }}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ${r.ring} ${r.bg} ${r.text}`}
                style={{ boxShadow: r.glow }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {r.label}
              </span>
              {entry ? (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">
                    {entry.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black tabular-nums text-primary">
                    {entry.xp}
                  </span>
                </>
              ) : (
                <span className="flex-1 truncate text-xs font-bold text-zinc-500">
                  open spot →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
