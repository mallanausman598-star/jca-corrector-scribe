import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles, Mic, MicOff, Copy, Share2, Trash2, Loader2,
  CheckCircle2, AlertTriangle, BookOpen, Languages, Wand2,
} from "lucide-react";
import { correctSentence, type CorrectionResult } from "@/lib/correct.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const POS_COLORS: Record<string, string> = {
  noun: "bg-primary/20 text-foreground border-primary/40",
  verb: "bg-secondary text-secondary-foreground border-secondary",
  adjective: "bg-accent text-accent-foreground border-accent",
  adverb: "bg-success/20 text-foreground border-success/40",
  pronoun: "bg-muted text-foreground border-border",
  preposition: "bg-muted text-foreground border-border",
  conjunction: "bg-muted text-foreground border-border",
  determiner: "bg-muted text-foreground border-border",
  auxiliary: "bg-muted text-foreground border-border",
  interjection: "bg-destructive/20 text-foreground border-destructive/40",
};

const QUICK_SAMPLES = [
  "He go to school everyday.",
  "I am student.",
];



export function Corrector() {
  const [text, setText] = useState("");
  const [showUrdu, setShowUrdu] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const correctFn = useServerFn(correctSentence);
  const mutation = useMutation({
    mutationFn: (input: string) => correctFn({ data: { text: input } }),
    onError: (err: Error) => toast.error(err.message ?? "Something went wrong"),
  });

  const result: CorrectionResult | undefined = mutation.data;

  const submit = () => {
    if (!text.trim()) {
      toast.error("Please type a sentence first");
      return;
    }
    mutation.mutate(text.trim());
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input is not supported in this browser");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setText((p) => (p ? p + " " : "") + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      setListening(false);
      toast.error("Voice input failed");
    };
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

  // Listen for "load this sentence" events (Daily Challenge, etc.)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.trim()) {
        setText(detail);
        document.getElementById("corrector")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("jca:load-sentence", handler as EventListener);
    return () => window.removeEventListener("jca:load-sentence", handler as EventListener);
  }, []);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.corrected);
    toast.success("Corrected sentence copied!");
  };

  const shareResult = async () => {
    if (!result) return;
    const payload = `Junaid Coaching Academy English Corrector\n\nOriginal: ${result.original}\nCorrected: ${result.corrected}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Junaid Coaching Academy Correction", text: payload }); } catch {}

    } else {
      await navigator.clipboard.writeText(payload);
      toast.success("Copied — ready to share");
    }
  };

  const reset = () => { setText(""); mutation.reset(); };

  return (
    <section id="corrector" className="container mx-auto max-w-5xl px-4 pb-24">
      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your sentence
          </label>
          <span className="text-xs tabular-nums text-muted-foreground">{text.length}/2000</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 2000))}
          placeholder="Type or speak an English sentence… e.g. 'He go to school everyday.'"
          rows={4}
          className="w-full resize-none rounded-2xl border-2 border-input bg-background p-4 text-lg font-medium leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
        />

        {/* Quick test templates */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Try a sample:
          </span>
          {QUICK_SAMPLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setText(s)}
              className="rounded-full border-2 border-border bg-background px-3 py-1 text-xs font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            onClick={submit}
            disabled={mutation.isPending}
            size="lg"
            className="h-12 gap-2 rounded-xl bg-secondary px-6 font-bold text-secondary-foreground shadow-[var(--shadow-brand)] transition hover:scale-[1.02] hover:bg-secondary/90"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {mutation.isPending ? "Analyzing…" : "Correct Sentence"}
          </Button>

          <Button
            onClick={listening ? stopVoice : startVoice}
            variant="outline"
            size="lg"
            className={`h-12 gap-2 rounded-xl border-2 ${listening ? "border-destructive bg-destructive/10 text-destructive" : "border-border"}`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "Stop" : "Voice"}
          </Button>

          <Button
            onClick={reset}
            variant="ghost"
            size="lg"
            className="h-12 gap-2 rounded-xl text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowUrdu((v) => !v)}
              className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${
                showUrdu ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Languages className="h-4 w-4" />
              اردو
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          {/* Corrected card */}
          <div className="rounded-3xl border-2 border-primary bg-gradient-to-br from-primary/10 to-accent/10 p-6 shadow-[var(--shadow-brand)] md:p-8">
            <div className="mb-3 flex items-center gap-2">
              {result.hasErrors ? (
                <Badge className="gap-1 bg-secondary text-secondary-foreground"><AlertTriangle className="h-3 w-3" /> Corrections made</Badge>
              ) : (
                <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3" /> Looks great!</Badge>
              )}
            </div>
            <p className="text-2xl font-bold leading-snug text-foreground md:text-3xl">
              {result.corrected}
            </p>
            {result.hasErrors && (
              <p className="mt-2 text-sm text-muted-foreground line-through">{result.original}</p>
            )}
            <div className="mt-4 flex gap-2">
              <Button onClick={copyResult} variant="outline" className="gap-2 rounded-xl border-2"><Copy className="h-4 w-4" /> Copy</Button>
              <Button onClick={shareResult} variant="outline" className="gap-2 rounded-xl border-2"><Share2 className="h-4 w-4" /> Share</Button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Tense" icon={<BookOpen className="h-4 w-4" />}>
              <p className="text-lg font-semibold text-foreground">{result.tense}</p>
            </Card>

            <Card title="Sentence Structure" icon={<Wand2 className="h-4 w-4" />}>
              <p className="text-foreground">{result.structure}</p>
            </Card>

            <Card title="Parts of Speech" icon={<Sparkles className="h-4 w-4" />} className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                {result.parts_of_speech.map((p, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-medium ${POS_COLORS[p.pos] ?? "bg-muted text-foreground border-border"}`}
                  >
                    <strong>{p.word}</strong>
                    <span className="text-xs uppercase opacity-70">{p.pos}</span>
                  </span>
                ))}
              </div>
            </Card>

            {result.spellingErrors.length > 0 && (
              <Card title="Spelling" icon={<AlertTriangle className="h-4 w-4" />} className="md:col-span-2">
                <ul className="space-y-2">
                  {result.spellingErrors.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-foreground">
                      <span className="rounded bg-destructive/15 px-2 py-0.5 font-mono text-destructive line-through">{s.word}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="rounded bg-success/15 px-2 py-0.5 font-mono text-foreground">{s.suggestion}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {result.improvements.length > 0 && (
              <Card title="What changed & why" icon={<CheckCircle2 className="h-4 w-4" />} className="md:col-span-2">
                <ul className="space-y-2">
                  {result.improvements.map((s, i) => (
                    <li key={i} className="flex gap-2 text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card title="Better ways to say it" icon={<Wand2 className="h-4 w-4" />} className="md:col-span-2">
              <ul className="space-y-3">
                {result.better_versions.map((s, i) => (
                  <li key={i} className="rounded-xl border-2 border-border bg-background p-3 font-medium text-foreground">
                    {s}
                  </li>
                ))}
              </ul>
            </Card>

            {showUrdu && (
              <Card title="اردو وضاحت" icon={<Languages className="h-4 w-4" />} className="md:col-span-2">
                <p className="font-urdu text-2xl leading-loose text-foreground">{result.urdu_explanation}</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Card({ title, icon, children, className = "" }: { title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border-2 border-border bg-card p-5 shadow-[var(--shadow-card)] ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      {children}
    </div>
  );
}
