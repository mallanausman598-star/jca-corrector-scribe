import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Check, X, Timer, Trophy, Zap, RotateCcw, Home, Calendar, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AnimatedCounter } from "./AnimatedCounter";
import { pickQuestions, type Question } from "@/lib/quiz-bank";
import { getDailyQuiz } from "@/lib/daily-quiz.functions";
import { cn } from "@/lib/utils";

type Category = "grammar" | "vocab" | "daily";
const PER_QUESTION_SECONDS = 25;

export function Quiz({
  category,
  onFinish,
  onBackToDashboard,
  onBackToQuizzes,
  onAttemptNext,
}: {
  category: Category;
  onFinish: (r: { correct: number; total: number; timeBonus: number }) => void;
  onBackToDashboard?: () => void;
  onBackToQuizzes?: () => void;
  onAttemptNext?: () => void;
}) {
  const fetchDaily = useServerFn(getDailyQuiz);
  const dailyQuery = useQuery({
    queryKey: ["daily-quiz", new Date().toISOString().slice(0, 10)],
    queryFn: () => fetchDaily(),
    enabled: category === "daily",
    staleTime: 1000 * 60 * 60, // 1h
    retry: 1,
  });

  const questions = useMemo<Question[]>(() => {
    if (category === "daily") {
      if (!dailyQuery.data?.questions) return [];
      return dailyQuery.data.questions.map((q) => ({
        q: q.q, options: q.options, answer: q.answer, explain: q.explain,
      }));
    }
    return pickQuestions(category, 5);
  }, [category, dailyQuery.data]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [time, setTime] = useState(PER_QUESTION_SECONDS);
  const [timeBonus, setTimeBonus] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showReview, setShowReview] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    if (done || picked !== null || !q) return;
    if (time <= 0) { handlePick(-1); return; }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, picked, done, q]);

  useEffect(() => { setTime(PER_QUESTION_SECONDS); setPicked(null); }, [idx]);

  function handlePick(i: number) {
    if (picked !== null) return;
    setPicked(i);
    setAnswers((a) => [...a, i]);
    if (i === q.answer) {
      setCorrect((c) => c + 1);
      setTimeBonus((b) => b + Math.max(0, time));
    }
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setDone(true);
      onFinish({ correct, total: questions.length, timeBonus });
    } else {
      setIdx((i) => i + 1);
    }
  }

  // Loading / error for daily
  if (category === "daily" && dailyQuery.isLoading) {
    return (
      <Card className="border-2 border-primary/30 p-10 text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
        <div className="font-bold">Generating today's fresh FSC English quiz…</div>
        <div className="mt-1 text-xs text-muted-foreground">Powered by AI · 10 conceptual questions</div>
      </Card>
    );
  }
  if (category === "daily" && (dailyQuery.isError || questions.length === 0)) {
    return (
      <Card className="border-2 border-destructive/40 p-6 text-center">
        <div className="font-bold text-destructive">Couldn't load today's quiz.</div>
        <Button onClick={() => dailyQuery.refetch()} className="mt-3">Retry</Button>
      </Card>
    );
  }

  // Results screen
  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    const earnedXp = correct * 10 + timeBonus;

    if (showReview) {
      return (
        <Card className="border-2 border-primary/40 p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black">📚 Review & Explanations</h3>
            <Button size="sm" variant="outline" onClick={() => setShowReview(false)}>← Back to score</Button>
          </div>
          <div className="space-y-4">
            {questions.map((qq, i) => {
              const picked = answers[i];
              const isRight = picked === qq.answer;
              return (
                <div key={i} className={cn(
                  "rounded-xl border-2 p-4",
                  isRight ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5",
                )}>
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-0.5 text-xs font-black text-muted-foreground">Q{i + 1}.</span>
                    <span className="font-bold">{qq.q}</span>
                  </div>
                  <div className="ml-6 grid gap-1 text-sm">
                    {qq.options.map((opt, j) => (
                      <div key={j} className={cn(
                        "rounded-md px-2 py-1",
                        j === qq.answer && "bg-success/15 font-bold text-success",
                        j === picked && j !== qq.answer && "bg-destructive/15 font-bold text-destructive line-through",
                      )}>
                        {String.fromCharCode(65 + j)}. {opt}
                        {j === qq.answer && " ✓"}
                      </div>
                    ))}
                  </div>
                  {qq.explain && (
                    <div className="ml-6 mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs">
                      <span className="font-bold">💡 Explanation: </span>{qq.explain}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      );
    }

    return (
      <Card className="border-2 border-primary/40 p-6 text-center">
        <Trophy className="mx-auto mb-3 h-12 w-12 text-primary" />
        <h3 className="text-2xl font-black">Quiz Complete!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {pct >= 80 ? "Outstanding work! 🌟" : pct >= 50 ? "Good effort — keep practising!" : "Don't worry — review and try other quizzes."}
        </p>
        <div className="my-6 flex items-center justify-center gap-8">
          <div>
            <div className="text-4xl font-black text-primary"><AnimatedCounter value={correct} />/{questions.length}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Correct</div>
          </div>
          <div>
            <div className="text-4xl font-black text-success"><AnimatedCounter value={earnedXp} /></div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">XP Earned</div>
          </div>
          <div>
            <div className="text-4xl font-black"><AnimatedCounter value={pct} />%</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Score</div>
          </div>
        </div>

        {category === "daily" && (
          <p className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-bold text-primary">
            ✨ One attempt per day — come back tomorrow for a fresh AI-generated set.
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={() => setShowReview(true)} className="gap-2 font-bold">
            <Sparkles className="h-4 w-4" /> View Results & Explanations
          </Button>
          {category === "daily" && onAttemptNext ? (
            <Button onClick={onAttemptNext} variant="secondary" className="gap-2 font-bold">
              <ArrowRight className="h-4 w-4" /> Attempt Next Quiz
            </Button>
          ) : (
            <Button onClick={() => onFinish({ correct: -1, total: 0, timeBonus: 0 })} variant="secondary" className="gap-2 font-bold">
              <RotateCcw className="h-4 w-4" /> Try Another Quiz
            </Button>
          )}
          {onBackToQuizzes && (
            <Button onClick={onBackToQuizzes} variant="outline" className="gap-2 font-bold">
              <Calendar className="h-4 w-4" /> Back to Quizzes
            </Button>
          )}
          {onBackToDashboard && (
            <Button onClick={onBackToDashboard} variant="outline" className="gap-2 font-bold">
              <Home className="h-4 w-4" /> Back to Dashboard
            </Button>
          )}
        </div>
      </Card>
    );
  }

  if (!q) return null;

  return (
    <Card className="border-2 border-primary/30 p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Question {idx + 1} / {questions.length}
          {category === "daily" && <span className="ml-2 text-primary">· FSC English</span>}
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
