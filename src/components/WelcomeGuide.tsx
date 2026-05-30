import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, BookOpen, ArrowRight } from "lucide-react";

const KEY = "jca:welcome-seen";

export function WelcomeGuide() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) {
      // brief delay so the page paints first
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="border-2 border-primary/40 sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <Sparkles className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-2xl font-black">
            Welcome to JCA English! 👋
          </DialogTitle>
          <DialogDescription className="text-center">
            A quick 3-step tour to help you get started.
          </DialogDescription>
        </DialogHeader>

        <ol className="mt-2 space-y-3">
          <Step
            n={1}
            icon={<BookOpen className="h-4 w-4" />}
            title="Type a sentence"
            desc="Type or speak any English sentence in the box, or tap a sample."
          />
          <Step
            n={2}
            icon={<Sparkles className="h-4 w-4" />}
            title="See the AI explanation"
            desc="Get the correct version, grammar, tense, parts of speech & Urdu meaning."
          />
          <Step
            n={3}
            icon={<Trophy className="h-4 w-4" />}
            title="Check My Rank"
            desc="Take quizzes, earn XP, and climb the global leaderboard."
          />
        </ol>

        <Button onClick={close} className="mt-3 h-12 w-full gap-2 text-base font-bold">
          Let's go <ArrowRight className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Step({ n, icon, title, desc }: { n: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex gap-3 rounded-xl border-2 border-border bg-card/60 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">
        {n}
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-sm font-black">
          {icon} {title}
        </div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}
