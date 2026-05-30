import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Sparkles, Trophy, Check } from "lucide-react";
import { useStudent, todayKey } from "@/lib/student";
import { toast } from "sonner";

const DAILY_BANK: { wrong: string; right: string; hint: string }[] = [
  { wrong: "He don't likes mangoes.", right: "He doesn't like mangoes.", hint: "Third person singular uses 'doesn't' + base verb." },
  { wrong: "I am living here since 2015.", right: "I have been living here since 2015.", hint: "Use present perfect continuous with 'since'." },
  { wrong: "She is more taller than me.", right: "She is taller than me.", hint: "Avoid double comparatives." },
  { wrong: "Where you are going?", right: "Where are you going?", hint: "Auxiliary 'are' comes before subject in questions." },
  { wrong: "He suggested me to go.", right: "He suggested that I go.", hint: "'Suggest' isn't followed by an object + infinitive." },
  { wrong: "I am agree with you.", right: "I agree with you.", hint: "'Agree' is a verb, not an adjective." },
  { wrong: "Yesterday I have seen him.", right: "Yesterday I saw him.", hint: "Use past simple with a finished time." },
];

const CLAIM_KEY = "jca:daily-claim";
const BONUS_XP = 25;

export function DailyChallenge() {
  const { student, update } = useStudent();
  const [claimedToday, setClaimedToday] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const today = todayKey();
  const dayIdx = Math.abs(hash(today)) % DAILY_BANK.length;
  const challenge = DAILY_BANK[dayIdx];

  useEffect(() => {
    if (typeof window === "undefined") return;
    setClaimedToday(localStorage.getItem(CLAIM_KEY) === today);
  }, [today]);

  const tryIt = () => {
    window.dispatchEvent(new CustomEvent("jca:load-sentence", { detail: challenge.wrong }));
  };

  const claim = () => {
    if (claimedToday) return;
    if (!student) {
      toast.error("Enter your name in Check My Rank first to earn XP!");
      return;
    }
    update((s) => ({ ...s, xp: s.xp + BONUS_XP }));
    localStorage.setItem(CLAIM_KEY, today);
    setClaimedToday(true);
    toast.success(`+${BONUS_XP} XP bonus claimed! 🎉`);
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-[var(--shadow-card)] md:p-6">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.85 0.18 92), transparent)" }}
      />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge className="gap-1 bg-primary text-primary-foreground">
            <Flame className="h-3 w-3" /> Daily Challenge
          </Badge>
          <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
            <Trophy className="h-3 w-3" /> +{BONUS_XP} XP bonus
          </Badge>
          {claimedToday && (
            <Badge variant="outline" className="gap-1 border-success/40 text-success">
              <Check className="h-3 w-3" /> Claimed today
            </Badge>
          )}
        </div>

        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Tricky sentence of the day
        </div>
        <p className="mt-1 text-xl font-black leading-snug text-destructive md:text-2xl">
          “{challenge.wrong}”
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{challenge.hint}</p>

        {revealed && (
          <p className="mt-3 rounded-xl border-2 border-success/30 bg-success/10 px-3 py-2 text-base font-bold text-foreground">
            ✅ {challenge.right}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={tryIt} className="gap-2 font-bold">
            <Sparkles className="h-4 w-4" /> Try fixing it
          </Button>
          <Button onClick={() => setRevealed((v) => !v)} variant="outline" className="font-bold">
            {revealed ? "Hide answer" : "Reveal answer"}
          </Button>
          <Button
            onClick={claim}
            disabled={claimedToday}
            variant="secondary"
            className="ml-auto gap-2 font-bold"
          >
            <Trophy className="h-4 w-4" />
            {claimedToday ? "Claimed" : `Claim +${BONUS_XP} XP`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
