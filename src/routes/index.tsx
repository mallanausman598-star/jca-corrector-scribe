import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Corrector } from "@/components/Corrector";
import { LoadingScreen } from "@/components/LoadingScreen";
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

      <Corrector />

      {/* Footer */}
      <footer className="border-t-2 border-border bg-secondary text-secondary-foreground">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 overflow-hidden rounded-md">
              <img src={logo} alt="" className="h-full w-full object-cover" />
            </div>
            Junaid Coaching Academy
          </div>
          <p className="opacity-80">
            Built by <strong className="text-primary">Usman</strong> for Junaid Coaching Academy · © {new Date().getFullYear()} JCA
          </p>
        </div>
      </footer>
    </div>
  );
}
