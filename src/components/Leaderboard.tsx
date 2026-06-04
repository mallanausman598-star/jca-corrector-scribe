import { useEffect, useState } from "react";
import { subscribeLeaderboard, type LeaderboardEntry } from "@/lib/student";
import { Card } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, AlertTriangle, Loader2, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRole, type Role } from "@/lib/auth";

export function Leaderboard({ currentName }: { currentName?: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string>("");
  const [role, setRole] = useState<Role>("student");

  useEffect(() => {
    setRole(getRole());
    // Refresh role on storage change (e.g. admin unlocked in another tab).
    const onStorage = () => setRole(getRole());
    window.addEventListener("storage", onStorage);
    // Poll once after a tick so AdminUnlock changes in same tab are reflected.
    const t = setInterval(() => setRole(getRole()), 1500);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(t); };
  }, []);

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
        Loading leaderboard…
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 h-7 w-7 text-destructive" />
        <div className="font-black text-destructive">Leaderboard unavailable</div>
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

  // ADMIN view — full visibility.
  if (role === "admin") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-primary">
            <ShieldCheck className="h-4 w-4" /> Admin View — All Members
          </div>
          <div className="text-[11px] font-bold text-muted-foreground">{entries.length} total</div>
        </div>
        <div className="space-y-2">
          {entries.map((e, i) => {
            const rank = i + 1;
            const mine = currentName && e.name.toLowerCase() === currentName.toLowerCase();
            return (
              <RankRow key={e.name + rank} entry={e} rank={rank} mine={!!mine} rankIcon={rankIcon} />
            );
          })}
        </div>
      </div>
    );
  }

  // STUDENT view — Top 3 podium + your own rank + total count only.
  const myIndex = currentName
    ? entries.findIndex((e) => e.name.toLowerCase() === currentName.toLowerCase())
    : -1;
  const mine = myIndex >= 0 ? entries[myIndex] : undefined;
  const myRank = myIndex >= 0 ? myIndex + 1 : null;
  const top3 = entries.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Privacy notice */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        For privacy, only the top 3 and your own rank are shown. Admin sees the full list.
      </div>

      {/* Top 3 Podium */}
      <div>
        <div className="mb-2 px-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          🏆 Top 3 Toppers
        </div>
        <div className="space-y-2">
          {top3.map((e, i) => {
            const rank = i + 1;
            const isMe = currentName && e.name.toLowerCase() === currentName.toLowerCase();
            return <RankRow key={e.name + rank} entry={e} rank={rank} mine={!!isMe} rankIcon={rankIcon} />;
          })}
        </div>
      </div>

      {/* Your rank */}
      <div>
        <div className="mb-2 px-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Your Position
        </div>
        {mine && myRank ? (
          <>
            {myRank > 3 && (
              <RankRow entry={mine} rank={myRank} mine rankIcon={rankIcon} />
            )}
            {myRank <= 3 && (
              <div className="rounded-xl border-2 border-primary bg-primary/10 px-4 py-3 text-center text-sm font-bold text-primary">
                🎉 You're in the Top 3! See above.
              </div>
            )}
            <div className="mt-2 text-center text-xs font-bold text-muted-foreground">
              You're ranked <span className="text-foreground">#{myRank}</span> of {entries.length} students
            </div>
          </>
        ) : (
          <Card className="border-2 border-dashed border-border p-5 text-center text-sm text-muted-foreground">
            Enter your name and take a quiz to appear on the leaderboard.
          </Card>
        )}
      </div>
    </div>
  );
}

function RankRow({
  entry, rank, mine, rankIcon,
}: { entry: LeaderboardEntry; rank: number; mine: boolean; rankIcon: (r: number) => React.ReactNode }) {
  return (
    <div
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
            {entry.name}
            {mine && <span className="ml-1 text-xs font-bold text-primary">YOU</span>}
          </div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Level {entry.level}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-black text-primary tabular-nums">{entry.xp}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</div>
      </div>
    </div>
  );
}
