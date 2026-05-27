import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Check, X, Timer, Trophy, Zap, RotateCcw } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { pickQuestions, dailySeed, type Question } from "@/lib/quiz-bank";
import { cn } from "@/lib/utils";

type Category = "grammar" | "vocab" | "daily";
const PER_QUESTION_SECONDS = 20;

export function Quiz({
  category,
  onFinish,
}: {
  category: Category;
  onFinish: (r: { correct: number; total: number; timeBonus: number }) => void;
}) {
  const questions = useMemo<Question[]>(
    () => pickQuestions(category, category === "daily" ? 5 : 5, category === "daily" ? dailySeed() : undefined),
    [category],
  );
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [time, setTime] = useState(PER_QUESTION_SECONDS);
  const [timeBonus, setTimeBonus] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    if (done || picked !== null) return;
    if (time <= 0) { handlePick(-1); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, picked, done]);

  useEffect(() => { setTime(PER_QUESTION_SECONDS); setPicked(null); }, [idx]);

  function handlePick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) {
      setCorrect((c) => c + 1);
      setTimeBonus((b) => b + Math.max(0, time));
    }
  }

  function next() {
    const finalCorrect = correct; // already updated by handlePick before next is shown
    if (idx + 1 >= questions.length) {
      setDone(true);
      onFinish({ correct: finalCorrect, total: questions.length, timeBonus });
    } else {
      setIdx((i) => i + 1);
    }
  }

  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <Card className="border-2 border-primary/40 p-6 text-center">
        <Trophy className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h3 className="text-2xl font-black">Quiz Complete!</h3>
        <div className="my-6 flex items-center justify-center gap-8">
          <div>
            <div className="text-4xl font-black text-primary"><AnimatedCounter value={correct} />/{questions.length}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="text-4xl font-black text-success"><AnimatedCounter value={correct * 10 + timeBonus} /></div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">XP Earned</div>
          </div>
          <div>
            <div className="text-4xl font-black"><AnimatedCounter value={pct} />%</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Score</div>
          </div>
        </div>
        <Button onClick={() => onFinish({ correct: -1, total: 0, timeBonus: 0 })} variant="outline" className="font-bold">
          <RotateCcw className="mr-2 h-4 w-4" /> Back
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30 p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Question {idx + 1} / {questions.length}
        </div>
        <div className={cn("flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-sm font-bold tabular-nums",
          time <= 5 ? "border-destructive text-destructive animate-pulse" : "border-primary text-primary")}>
          <Timer className="h-3.5 w-3.5" /> {time}s
        </div>
      </div>
      <Progress value={((idx + (picked !== null ? 1 : 0)) / questions.length) * 100} className="mb-5 h-1.5" />

      <h3 className="mb-5 text-lg font-bold leading-snug md:text-xl">{q.q}</h3>

      <div className="grid gap-2">
        {q.options.map((opt, i) => {
          const isAns = i === q.answer;
          const isPicked = i === picked;
          const reveal = picked !== null;
          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={reveal}
              className={cn(
                "group flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all",
                "hover:border-primary hover:bg-primary/5",
                !reveal && "border-border bg-card",
                reveal && isAns && "border-success bg-success/10 text-success",
                reveal && isPicked && !isAns && "border-destructive bg-destructive/10 text-destructive",
                reveal && !isAns && !isPicked && "opacity-50",
              )}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-black">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </span>
              {reveal && isAns && <Check className="h-5 w-5" />}
              {reveal && isPicked && !isAns && <X className="h-5 w-5" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {picked === q.answer ? (
              <span className="font-bold text-success flex items-center gap-1.5"><Zap className="h-4 w-4" /> +{10 + time} XP</span>
            ) : (
              <span className="font-bold text-destructive">Correct answer: {q.options[q.answer]}</span>
            )}
            {q.explain && <p className="mt-1 text-muted-foreground">{q.explain}</p>}
          </div>
          <Button onClick={next} className="font-bold">
            {idx + 1 >= questions.length ? "Finish" : "Next"} →
          </Button>
        </div>
      )}
    </Card>
  );
}
