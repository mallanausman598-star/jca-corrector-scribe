import { useEffect, useMemo, useState } from "react";
import logo from "@/assets/jca-logo.jpg";

export function LoadingScreen() {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1600);
    const t2 = setTimeout(() => setPhase("done"), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 6,
      })),
    [],
  );

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      style={{
        animation:
          phase === "out"
            ? "jca-fade-out 0.5s ease-in forwards"
            : "jca-fade-in 0.5s ease-out forwards",
      }}
      aria-hidden
    >
      {/* radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.85 0.18 92 / 0.18), transparent 60%)",
        }}
      />

      {/* grid lines */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.18 92) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.18 92) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: "oklch(0.85 0.18 92)",
            boxShadow: "0 0 8px oklch(0.85 0.18 92), 0 0 16px oklch(0.85 0.18 92 / 0.6)",
            animation: `jca-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          className="mb-6 h-16 w-16 overflow-hidden rounded-2xl ring-2"
          style={{
            boxShadow:
              "0 0 24px oklch(0.85 0.18 92 / 0.7), 0 0 60px oklch(0.85 0.18 92 / 0.35)",
            animation: "jca-pulse 2s ease-in-out infinite",
          }}
        >
          <img src={logo} alt="" className="h-full w-full object-cover" />
        </div>

        <h1
          className="text-4xl font-black tracking-tight text-white md:text-6xl"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            textShadow:
              "0 0 12px oklch(0.85 0.18 92 / 0.9), 0 0 32px oklch(0.85 0.18 92 / 0.6), 0 0 60px oklch(0.85 0.18 92 / 0.4)",
            animation: "jca-glow 2.2s ease-in-out infinite",
          }}
        >
          JCA <span style={{ color: "oklch(0.85 0.18 92)" }}>English</span>
        </h1>

        <p
          className="mt-3 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 md:text-sm"
          style={{ animation: "jca-fade-up 0.9s ease-out 0.2s both" }}
        >
          by <span style={{ color: "oklch(0.85 0.18 92)" }}>Osman</span>
        </p>

        {/* loader bar */}
        <div className="mt-8 h-[3px] w-44 overflow-hidden rounded-full bg-white/10 md:w-60">
          <div
            className="h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.85 0.18 92), transparent)",
              animation: "jca-bar 1.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes jca-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes jca-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes jca-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes jca-glow {
          0%, 100% { text-shadow: 0 0 10px oklch(0.85 0.18 92 / 0.7), 0 0 28px oklch(0.85 0.18 92 / 0.5); }
          50% { text-shadow: 0 0 18px oklch(0.85 0.18 92 / 1), 0 0 48px oklch(0.85 0.18 92 / 0.8), 0 0 80px oklch(0.85 0.18 92 / 0.5); }
        }
        @keyframes jca-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes jca-float {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(10px, -20px); opacity: 0.9; }
        }
        @keyframes jca-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
