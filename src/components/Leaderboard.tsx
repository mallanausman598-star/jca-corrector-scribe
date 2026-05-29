import { useEffect, useState } from "react";
import { subscribeLeaderboard, type LeaderboardEntry } from "@/lib/student";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Leaderboard({ currentName }: { currentName?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    const unsub = subscribeLeaderboard(
      (list) => { setEntries(list); setStatus("ready"); },
      (err) => { setStatus("error"); setErrMsg(err?.message ?? "Failed to load leaderboard"); },
    );
    return () => unsub();
  }, []);

  if (status === "loading") {
    return (
      <Card className="border-2 border-dashed border-border p-8 text-center text-muted-foreground">
        <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin opacity-70" />
        Loading global leaderboard…
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 h-7 w-7 text-destructive" />
        <div className="font-black text-destructive">Leaderboard unavailable</div>
        <div className="mt-1 text-xs text-muted-foreground">
          The global database rejected the request. Open Firebase Console → Firestore → Rules and publish:
        </div>
        <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-background p-3 text-left text-[11px] leading-snug">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /students/{id} {
      allow read, write: if true;
    }
  }
}`}
        </pre>
        <div className="mt-2 text-[10px] text-muted-foreground">{errMsg}</div>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border p-8 text-center text-muted-foreground">
        <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
        No members yet. Enter your name to join the leaderboard!
      </Card>
    );
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-primary" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-black">#{rank}</span>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          All Members (Global)
        </div>
        <div className="text-[11px] font-bold text-muted-foreground">{entries.length} total</div>
      </div>
      <div className="space-y-2">
        {entries.map((e, i) => {
          const rank = i + 1;
          const mine = currentName && e.name.toLowerCase() === currentName.toLowerCase();
          return (
            <div
              key={e.name + rank}
              className={cn(
                "flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-colors",
                mine ? "border-primary bg-primary/10" : "border-border bg-card",
                rank === 1 && !mine && "border-primary/50",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {rankIcon(rank)}
                </div>
                <div>
                  <div className="font-bold">
                    {e.name}
                    {mine && <span className="ml-1 text-xs font-bold text-primary">YOU</span>}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Level {e.level}
                  </div>
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
    </div>
  );
}
