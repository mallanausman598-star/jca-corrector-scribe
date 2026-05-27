import { useEffect, useState } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/student";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
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

  const podiumIcons = [
    <Trophy key="1" className="h-5 w-5 text-yellow-500" />,
    <Medal key="2" className="h-5 w-5 text-slate-400" />,
    <Award key="3" className="h-5 w-5 text-amber-700" />,
  ];

  return (
    <div className="space-y-2">
      {entries.map((e, i) => {
        const mine = currentName && e.name.toLowerCase() === currentName.toLowerCase();
        return (
          <div
            key={e.name + i}
            className={cn(
              "flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors",
              mine ? "border-primary bg-primary/10" : "border-border bg-card",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-black">
                {i < 3 ? podiumIcons[i] : `#${i + 1}`}
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
    </div>
  );
}
