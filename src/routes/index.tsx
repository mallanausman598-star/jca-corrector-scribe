import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Corrector } from "@/components/Corrector";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DeveloperCredit } from "@/components/DeveloperCredit";
import { StudentHub } from "@/components/StudentHub";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import logo from "@/assets/jca-logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JCA – AI English Sentence Corrector | Junaid Coaching Academy" },
      { name: "description", content: "Free AI English sentence corrector with grammar, tense, parts of speech analysis and Urdu explanations. Built for students by Junaid Coaching Academy." },
      { property: "og:title", content: "JCA – AI English Sentence Corrector" },
      { property: "og:description", content: "Correct any English sentence with AI: grammar, tense, parts of speech, spelling, and Urdu explanations." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoadingScreen />
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-primary">
              <img src={logo} alt="JCA logo" className="h-full w-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight">JCA</div>
              <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">English Corrector</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="container mx-auto max-w-5xl px-4 pb-12 pt-16 text-center md:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border-2 border-secondary bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-success" />
            Built for Students
          </div>
          <h1 className="text-4xl font-black leading-[0.95] tracking-tighter md:text-6xl lg:text-7xl">
            Speak & write English
            <span className="block bg-gradient-to-br from-secondary to-secondary/70 bg-clip-text text-transparent dark:from-primary dark:to-accent">
              with confidence.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Instant sentence correction, parts of speech, tense detection, spelling fixes and{" "}
            <strong className="text-foreground">Urdu explanations</strong> — built by Junaid Coaching Academy.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Grammar fix", "Tense", "Parts of speech", "Spelling", "Urdu meaning", "Voice input"].map((f) => (
              <span key={f} className="rounded-full border-2 border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-5xl px-4">
        <Tabs defaultValue="corrector" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="corrector" className="font-bold">✍️ Corrector</TabsTrigger>
            <TabsTrigger value="student" className="font-bold">🎮 Student Hub</TabsTrigger>
          </TabsList>
          <TabsContent value="corrector"><Corrector /></TabsContent>
          <TabsContent value="student"><StudentHub /></TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background">
        {/* Top glow accent */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.85 0.18 92 / 0.6), oklch(0.85 0.18 92 / 0.3), oklch(0.85 0.18 92 / 0.6), transparent)",
          }}
        />

        <div className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
          {/* Brand row */}
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-0">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-primary/30"
                style={{
                  boxShadow: "0 0 16px oklch(0.85 0.18 92 / 0.2)",
                }}
              >
                <img src={logo} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-tight">
                  Junaid Coaching Academy
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Empowering students since day one
                </div>
              </div>
            </div>

            <p className="text-xs font-medium text-muted-foreground/70">
              © {new Date().getFullYear()} JCA. All rights reserved.
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 h-px w-full rounded-full bg-border/40" />

          {/* Developer credit */}
          <DeveloperCredit />
        </div>
      </footer>
    </div>
  );
}
