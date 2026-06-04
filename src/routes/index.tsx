import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Corrector } from "@/components/Corrector";
import { LoadingScreen } from "@/components/LoadingScreen";
import { DeveloperCredit } from "@/components/DeveloperCredit";
import { StudentHub } from "@/components/StudentHub";
import { TopStudent } from "@/components/TopStudent";
import { WelcomeGuide } from "@/components/WelcomeGuide";
import { AdminUnlock } from "@/components/AdminUnlock";
import { Trophy } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { initAnalyticsIfSupported } from "@/lib/firebase";
import logo from "@/assets/jca-logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Junaid Coaching Academy – AI English Sentence Corrector" },
      { name: "description", content: "Free AI English sentence corrector with grammar, tense, parts of speech analysis and Urdu explanations. Built for JCA students by Osman." },
      { property: "og:title", content: "Junaid Coaching Academy – AI English Sentence Corrector" },
      { property: "og:description", content: "Correct any English sentence with AI: grammar, tense, parts of speech, spelling, and Urdu explanations." },
    ],
  }),
  component: Home,
});

function Home() {
  useEffect(() => { initAnalyticsIfSupported(); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoadingScreen />
      <WelcomeGuide />
      <Toaster richColors position="top-center" />


      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-xl ring-2 ring-primary">
              <img src={logo} alt="Junaid Coaching Academy logo" className="h-full w-full object-cover" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight md:text-base">Junaid Coaching Academy</div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">AI English Corrector</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <AdminUnlock />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero — modern AI startup vibe */}
      <section className="relative overflow-hidden">
        {/* animated gradient backdrop */}
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div
          className="absolute inset-0 -z-10 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.85 0.18 92) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 92) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(closest-side, oklch(0.85 0.18 92 / 0.35), transparent)",
            animation: "hero-orb 9s ease-in-out infinite",
          }}
        />

        <div className="container mx-auto max-w-5xl px-4 pb-12 pt-16 text-center md:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur"
               style={{ boxShadow: "0 0 24px oklch(0.85 0.18 92 / 0.2)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Built for JCA students by Osman
          </div>

          <h1 className="text-4xl font-black leading-[0.95] tracking-tighter md:text-6xl lg:text-7xl">
            Speak & write English
            <span
              className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 100%", animation: "hero-shine 6s linear infinite" }}
            >
              with confidence.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Instant sentence correction, parts of speech, tense detection, spelling fixes and{" "}
            <strong className="text-foreground">Urdu explanations</strong> — by Junaid Coaching Academy.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Grammar fix", "Tense", "Parts of speech", "Spelling", "Urdu meaning", "Voice input"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_8px_24px_-8px_oklch(0.85_0.18_92/0.5)]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Current Leader */}
      <TopStudent />

      {/* Main tabs */}
      <div className="container mx-auto max-w-5xl px-4">
        <div
          className="rounded-3xl border border-border/60 bg-card/60 p-3 backdrop-blur-xl md:p-5"
          style={{ boxShadow: "0 20px 60px -30px oklch(0.85 0.18 92 / 0.35)" }}
        >
          <Tabs defaultValue="corrector" className="w-full">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="corrector" className="font-bold">✍️ Corrector</TabsTrigger>
              <TabsTrigger value="student" className="gap-1.5 font-bold">
                <Trophy className="h-4 w-4" /> Check My Rank
              </TabsTrigger>
            </TabsList>
            <TabsContent value="corrector"><Corrector /></TabsContent>
            <TabsContent value="student"><StudentHub /></TabsContent>
          </Tabs>
        </div>
      </div>


      {/* Footer */}
      <footer className="relative mt-16 border-t border-border/50 bg-background">
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.85 0.18 92 / 0.6), oklch(0.85 0.18 92 / 0.3), oklch(0.85 0.18 92 / 0.6), transparent)",
          }}
        />

        <div className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:gap-0">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 overflow-hidden rounded-xl ring-2 ring-primary/30"
                style={{ boxShadow: "0 0 16px oklch(0.85 0.18 92 / 0.2)" }}
              >
                <img src={logo} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-tight">Junaid Coaching Academy</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Our aim is to mould the society
                </div>
              </div>
            </div>

            <p className="text-xs font-medium text-muted-foreground/70">
              © {new Date().getFullYear()} Junaid Coaching Academy. All rights reserved.
            </p>
          </div>

          <div className="my-8 h-px w-full rounded-full bg-border/40" />

          <DeveloperCredit />

        </div>
      </footer>

      <style>{`
        @keyframes hero-shine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        @keyframes hero-orb {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.9; }
          50% { transform: translate(-50%, 10px) scale(1.06); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
