import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/student";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Leaderboard({ currentName }: { currentName?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { setEntries(getLeaderboard()); }, []);

  if (entries.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border p-8 text-center text-muted-foreground">
        <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No scores yet. Take a quiz to claim the top spot!
      </Card>
    );
  }

  const winner = entries[0];
  const rest = entries.slice(1);
  const podiumIcons = [
    <Medal key="2" className="h-5 w-5 text-slate-400" />,
    <Award key="3" className="h-5 w-5 text-amber-700" />,
  ];

  return (
    <div className="space-y-4">
      {/* Winner Spotlight */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-primary p-5 shadow-[var(--shadow-brand)]"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
          <Sparkles className="h-3 w-3" /> Winner
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary">
            <Crown className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Champion</div>
            <div className="truncate text-2xl font-black">
              {winner.name}
              {currentName && winner.name.toLowerCase() === currentName.toLowerCase() && (
                <span className="ml-2 text-xs font-bold text-primary">YOU</span>
              )}
            </div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Level {winner.level}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-primary tabular-nums">{winner.xp}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</div>
          </div>
        </div>
      </div>

      {/* All members */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">All Members</div>
          <div className="text-[11px] font-bold text-muted-foreground">{entries.length} total</div>
        </div>
        <div className="space-y-2">
          {rest.map((e, i) => {
            const rank = i + 2; // since winner is rank 1
            const mine = currentName && e.name.toLowerCase() === currentName.toLowerCase();
            return (
              <div
                key={e.name + rank}
                className={cn(
                  "flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors",
                  mine ? "border-primary bg-primary/10" : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-black">
                    {rank <= 3 ? podiumIcons[rank - 2] : `#${rank}`}
                  </div>
                  <div>
                    <div className="font-bold">{e.name} {mine && <span className="ml-1 text-xs font-bold text-primary">YOU</span>}</div>
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Level {e.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-primary tabular-nums">{e.xp}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</div>
                </div>
              </div>
            );
          })}
          {rest.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Be the next to challenge the champion!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
