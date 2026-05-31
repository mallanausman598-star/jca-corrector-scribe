import { useEffect, useState } from "react";

export function DeveloperCredit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`flex flex-col items-center gap-4 transition-all duration-1000 ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {/* Glowing badge */}
      <div className="group relative">
        <div
          className="relative flex items-center gap-2.5 rounded-full border border-primary/20 bg-background px-5 py-2.5 shadow-lg backdrop-blur-sm"
          style={{
            boxShadow:
              "0 0 20px oklch(0.85 0.18 92 / 0.15), 0 0 40px oklch(0.85 0.18 92 / 0.08), inset 0 1px 0 oklch(0.85 0.18 92 / 0.1)",
          }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ background: "oklch(0.85 0.18 92)" }}
            />
            <span
              className="relative inline-flex h-2.5 w-2.5 rounded-full"
              style={{ background: "oklch(0.85 0.18 92)" }}
            />
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          >
            Developer Credit
          </span>
        </div>
      </div>

      {/* Main credit text */}
      <p
        className="text-center text-sm font-medium leading-relaxed tracking-wide text-muted-foreground md:text-base"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        Built with{" "}
        <span className="inline-block animate-pulse text-lg" aria-label="love">
          ❤️
        </span>{" "}
        by{" "}
        <span
          className="relative inline-block font-bold text-foreground"
          style={{
            textShadow: "0 0 12px oklch(0.85 0.18 92 / 0.5)",
          }}
        >
          Osman
        </span>{" "}
        for{" "}
        <span className="font-semibold text-foreground">
          Junaid Coaching Academy
        </span>
      </p>

      {/* Subtle tagline */}
      <p
        className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/60"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        Our aim is to mould the society
      </p>

      {/* Decorative line */}
      <div className="flex items-center gap-3 pt-2">
        <div
          className="h-px w-12 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.85 0.18 92 / 0.4))",
          }}
        />
        <div
          className="h-1.5 w-1.5 rotate-45 rounded-sm"
          style={{
            background: "oklch(0.85 0.18 92 / 0.6)",
            boxShadow: "0 0 8px oklch(0.85 0.18 92 / 0.5)",
          }}
        />
        <div
          className="h-px w-12 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.85 0.18 92 / 0.4), transparent)",
          }}
        />
      </div>
    </div>
  );
}
