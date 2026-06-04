import { useState } from "react";
import { useStudent, levelFromXp, BADGES, todayKey } from "@/lib/student";
import { StudentOnboarding } from "./StudentOnboarding";
import { Quiz } from "./Quiz";
import { Leaderboard } from "./Leaderboard";
import { AnimatedCounter } from "./AnimatedCounter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Zap, Trophy, BookOpen, Brain, Calendar, LogOut, Lock, Check, Home, ArrowRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addDailyResult, getDailyHistory, getTodayResult } from "@/lib/daily-history";

type QuizCategory = "grammar" | "vocab" | "daily" | null;

export function StudentHub() {
  const { student, ready, create, reset, awardQuiz } = useStudent();
  const [activeQuiz, setActiveQuiz] = useState<QuizCategory>(null);

  if (!ready) return null;

  if (!student) {
    return <StudentOnboarding open onSubmit={(name) => { create(name); toast.success(`Welcome, ${name}! 🎉`); }} />;
  }

  const { level, intoLevel, neededForNext } = levelFromXp(student.xp);
  const today = todayKey();
  const dailyDone = student.lastDailyDate === today;
  const todayResult = getTodayResult(today);
  const accuracy = student.quizzesTaken > 0
    ? Math.round((student.correctAnswers / (student.quizzesTaken * 5)) * 100)
    : 0;

  function handleFinish(r: { correct: number; total: number; timeBonus: number }) {
    if (r.total === 0) { setActiveQuiz(null); return; }
    const cat = activeQuiz!;
    awardQuiz({ category: cat, correct: r.correct, total: r.total, timeBonus: r.timeBonus });
    const earned = r.correct * 10 + r.timeBonus;
    if (cat === "daily") {
      addDailyResult({ date: today, score: r.correct, total: r.total, xp: earned });
    }
    toast.success(`+${earned} XP earned!`, { description: `${r.correct}/${r.total} correct` });
  }

  function startQuiz(c: Exclude<QuizCategory, null>) {
    if (c === "daily" && dailyDone) {
      toast.error("You've already completed today's daily quiz. Come back tomorrow!");
      return;
    }
    setActiveQuiz(c);
  }

  return (
    <section className="container mx-auto max-w-5xl px-4 py-10">
      {/* Welcome banner */}
      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-primary/40 bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Student Hub</div>
            <h2 className="text-2xl font-black md:text-3xl">
              Salam, <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">{student.name}</span> 👋
            </h2>
            <p className="text-sm text-muted-foreground">Level up your English — one quiz at a time.</p>
          </div>
          <div className="flex items-center gap-2">
            {student.streak > 0 && (
              <Badge variant="outline" className="border-2 border-orange-500 text-orange-500">
                <Flame className="mr-1 h-3 w-3" /> {student.streak} day streak
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Sign out and reset progress?")) reset(); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-end justify-between">
            <div>
              <span className="text-3xl font-black text-primary"><AnimatedCounter value={student.xp} /></span>
              <span className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">XP</span>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Level <span className="text-base text-foreground">{level}</span>
            </div>
          </div>
          <Progress value={(intoLevel / neededForNext) * 100} className="h-2" />
          <div className="mt-1 text-right text-[11px] text-muted-foreground">
            {neededForNext - intoLevel} XP to Level {level + 1}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          <StatCell label="Quizzes" value={student.quizzesTaken} />
          <StatCell label="Correct" value={student.correctAnswers} />
          <StatCell label="Accuracy" value={accuracy} suffix="%" />
          <StatCell label="Streak" value={student.streak} suffix="🔥" />
        </div>
      </div>

      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quizzes" className="font-bold">Quizzes</TabsTrigger>
          <TabsTrigger value="badges" className="font-bold">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" className="font-bold">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="mt-5">
          {activeQuiz ? (
            <Quiz
              category={activeQuiz}
              onFinish={handleFinish}
              onBackToDashboard={() => setActiveQuiz(null)}
              onBackToQuizzes={() => setActiveQuiz(null)}
              onAttemptNext={() => setActiveQuiz(activeQuiz === "grammar" ? "vocab" : "grammar")}
            />
          ) : (
            <div className="space-y-5">
              {/* Daily-done banner with 4 nav options */}
              {dailyDone && todayResult && (
                <Card className="border-2 border-success/40 bg-gradient-to-br from-success/5 to-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-success">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-success">Daily Quiz Complete</div>
                      <h3 className="text-lg font-black">
                        Today's score: {todayResult.score}/{todayResult.total} · +{todayResult.xp} XP
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        You've used your one attempt for today. Try Grammar or Vocab quizzes for more XP — fresh daily quiz arrives tomorrow.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" size="sm" onClick={() => setActiveQuiz(null)} className="gap-1.5 font-bold">
                      <Home className="h-4 w-4" /> Dashboard
                    </Button>
                    <Button variant="outline" size="sm" disabled className="gap-1.5 font-bold">
                      <Calendar className="h-4 w-4" /> Daily (Locked)
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => startQuiz("grammar")} className="gap-1.5 font-bold">
                      <ArrowRight className="h-4 w-4" /> Grammar Quiz
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => startQuiz("vocab")} className="gap-1.5 font-bold">
                      <ArrowRight className="h-4 w-4" /> Vocab Quiz
                    </Button>
                  </div>
                </Card>
              )}

              {/* Score history sparkline */}
              <DailyHistoryStrip />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <QuizCard
                  title="Daily Challenge"
                  desc={dailyDone ? "Come back tomorrow!" : "10 fresh FSC-level English MCQs. AI-generated daily."}
                  icon={<Calendar className="h-6 w-6" />}
                  accent="bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  disabled={dailyDone}
                  onClick={() => startQuiz("daily")}
                />
                <QuizCard
                  title="Grammar Quiz"
                  desc="Test your grammar — 5 questions, 25s each."
                  icon={<BookOpen className="h-6 w-6" />}
                  onClick={() => startQuiz("grammar")}
                />
                <QuizCard
                  title="Vocabulary Quiz"
                  desc="Expand your word power — 5 questions."
                  icon={<Brain className="h-6 w-6" />}
                  onClick={() => startQuiz("vocab")}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="badges" className="mt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Object.entries(BADGES).map(([key, b]) => {
              const owned = student.badges.includes(key);
              return (
                <Card
                  key={key}
                  className={cn(
                    "flex flex-col items-center p-4 text-center transition-all",
                    owned ? "border-2 border-primary bg-primary/5" : "border-2 border-dashed border-border opacity-60",
                  )}
                >
                  <div className={cn("mb-2 text-4xl", !owned && "grayscale")}>{owned ? b.emoji : <Lock className="mx-auto h-7 w-7" />}</div>
                  <div className="text-sm font-black">{b.label}</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{b.desc}</div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-5">
          <Leaderboard currentName={student.name} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function DailyHistoryStrip() {
  const history = getDailyHistory().slice(0, 7).reverse();
  if (history.length === 0) return null;
  const max = Math.max(...history.map((h) => h.total), 10);
  return (
    <Card className="border-2 border-border p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Your Last {history.length} Daily Quizzes</div>
      </div>
      <div className="flex h-16 items-end gap-1.5">
        {history.map((h) => {
          const pct = (h.score / max) * 100;
          return (
            <div key={h.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-primary to-accent transition-all"
                style={{ height: `${Math.max(pct, 6)}%` }}
                title={`${h.date}: ${h.score}/${h.total}`}
              />
              <div className="text-[9px] font-bold text-muted-foreground">{h.score}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function StatCell({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl border-2 border-border bg-background/50 px-3 py-2 text-center">
      <div className="text-xl font-black tabular-nums">
        <AnimatedCounter value={value} />{suffix}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function QuizCard({
  title, desc, icon, onClick, disabled, accent,
}: { title: string; desc: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; accent?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex flex-col items-start gap-3 rounded-2xl border-2 border-border bg-card p-5 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-brand)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
      )}
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary", accent)}>
        {disabled ? <Trophy className="h-6 w-6" /> : icon}
      </div>
      <div>
        <div className="text-base font-black">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className="mt-auto flex items-center gap-1 text-xs font-bold text-primary">
        <Zap className="h-3 w-3" /> Earn up to 200 XP
      </div>
    </button>
  );
}
