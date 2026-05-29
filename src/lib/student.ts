import { useEffect, useState, useCallback } from "react";
import { getDb } from "./firebase";
import {
  doc, setDoc, collection, getDocs, query, orderBy, limit, onSnapshot, serverTimestamp,
} from "firebase/firestore";



export type Student = {
  name: string;
  xp: number;
  quizzesTaken: number;
  correctAnswers: number;
  badges: string[];
  lastDailyDate?: string;
  streak: number;
  createdAt: number;
};

export type LeaderboardEntry = { name: string; xp: number; level: number };

const KEY = "jca:student";
const LB_KEY = "jca:leaderboard";

export const BADGES: Record<string, { label: string; emoji: string; desc: string }> = {
  first_step: { label: "First Step", emoji: "🌱", desc: "Completed your first quiz" },
  sharp_mind: { label: "Sharp Mind", emoji: "🧠", desc: "Scored 100% on a quiz" },
  word_wizard: { label: "Word Wizard", emoji: "📚", desc: "Took 5 vocabulary quizzes" },
  grammar_guru: { label: "Grammar Guru", emoji: "✍️", desc: "Took 5 grammar quizzes" },
  streak_3: { label: "On Fire", emoji: "🔥", desc: "3-day daily streak" },
  centurion: { label: "Centurion", emoji: "💯", desc: "Earned 100 XP" },
  scholar: { label: "Scholar", emoji: "🎓", desc: "Reached Level 5" },
  legend: { label: "Legend", emoji: "👑", desc: "Reached Level 10" },
};

export function levelFromXp(xp: number) {
  // 50 XP * level (triangular-ish)
  let level = 1, need = 50, total = 0;
  while (total + need <= xp) { total += need; level++; need = 50 + (level - 1) * 25; }
  return { level, intoLevel: xp - total, neededForNext: need };
}

export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function read(): Student | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function write(s: Student) {
  localStorage.setItem(KEY, JSON.stringify(s));
  // upsert leaderboard (local mirror)
  try {
    const lb: LeaderboardEntry[] = JSON.parse(localStorage.getItem(LB_KEY) ?? "[]");
    const idx = lb.findIndex((e) => e.name.toLowerCase() === s.name.toLowerCase());
    const entry = { name: s.name, xp: s.xp, level: levelFromXp(s.xp).level };
    if (idx >= 0) lb[idx] = entry; else lb.push(entry);
    lb.sort((a, b) => b.xp - a.xp);
    localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0, 50)));
  } catch {}
  // sync to Firestore (global leaderboard) — fire & forget
  syncToCloud(s).catch((err) => console.warn("[firebase] sync failed", err));
}

async function syncToCloud(s: Student) {
  if (typeof window === "undefined") return;
  const db = getDb();
  const id = s.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 64) || "anon";
  await setDoc(
    doc(db, "students", id),
    {
      name: s.name,
      xp: s.xp,
      level: levelFromXp(s.xp).level,
      quizzesTaken: s.quizzesTaken,
      correctAnswers: s.correctAnswers,
      badges: s.badges,
      streak: s.streak,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LB_KEY) ?? "[]"); } catch { return []; }
}

// Live subscription to the global leaderboard. Returns an unsubscribe fn.
export function subscribeLeaderboard(
  cb: (entries: LeaderboardEntry[]) => void,
  onError?: (err: Error) => void,
  max = 100,
): () => void {
  try {
    const db = getDb();
    const q = query(collection(db, "students"), orderBy("xp", "desc"), limit(max));
    return onSnapshot(
      q,
      (snap) => {
        const list: LeaderboardEntry[] = snap.docs.map((d) => {
          const data = d.data() as { name?: string; xp?: number; level?: number };
          return { name: data.name ?? "anon", xp: data.xp ?? 0, level: data.level ?? 1 };
        });
        cb(list);
      },
      (err) => {
        console.warn("[firebase] leaderboard error", err);
        onError?.(err);
      },
    );
  } catch (err) {
    console.warn("[firebase] subscribe failed", err);
    onError?.(err as Error);
    return () => {};
  }
}

// One-shot fetch of the top N — used by WeeklyWinner.
export async function fetchTopStudents(max = 5): Promise<LeaderboardEntry[]> {
  try {
    const db = getDb();
    const q = query(collection(db, "students"), orderBy("xp", "desc"), limit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as { name?: string; xp?: number; level?: number };
      return { name: data.name ?? "anon", xp: data.xp ?? 0, level: data.level ?? 1 };
    });
  } catch (err) {
    console.warn("[firebase] fetchTop failed", err);
    return [];
  }
}



export function useStudent() {
  const [student, setStudent] = useState<Student | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { setStudent(read()); setReady(true); }, []);

  const create = useCallback((name: string) => {
    const s: Student = {
      name: name.trim().slice(0, 24),
      xp: 0, quizzesTaken: 0, correctAnswers: 0,
      badges: [], streak: 0, createdAt: Date.now(),
    };
    write(s); setStudent(s); return s;
  }, []);

  const update = useCallback((patch: Partial<Student> | ((s: Student) => Student)) => {
    setStudent((prev) => {
      if (!prev) return prev;
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setStudent(null);
  }, []);

  const awardQuiz = useCallback((opts: {
    category: "grammar" | "vocab" | "daily";
    correct: number; total: number; timeBonus: number;
  }) => {
    setStudent((prev) => {
      if (!prev) return prev;
      const baseXp = opts.correct * 10 + opts.timeBonus;
      const newBadges = new Set(prev.badges);
      const next: Student = {
        ...prev,
        xp: prev.xp + baseXp,
        quizzesTaken: prev.quizzesTaken + 1,
        correctAnswers: prev.correctAnswers + opts.correct,
      };
      if (next.quizzesTaken >= 1) newBadges.add("first_step");
      if (opts.correct === opts.total && opts.total > 0) newBadges.add("sharp_mind");
      if (next.xp >= 100) newBadges.add("centurion");
      const lvl = levelFromXp(next.xp).level;
      if (lvl >= 5) newBadges.add("scholar");
      if (lvl >= 10) newBadges.add("legend");

      // category counters via badges crude
      if (opts.category === "daily") {
        const today = todayKey();
        if (prev.lastDailyDate !== today) {
          next.lastDailyDate = today;
          // streak: if yesterday matches
          const y = new Date(); y.setDate(y.getDate() - 1);
          const yKey = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
          next.streak = prev.lastDailyDate === yKey ? prev.streak + 1 : 1;
          if (next.streak >= 3) newBadges.add("streak_3");
        }
      }
      next.badges = Array.from(newBadges);
      write(next);
      return next;
    });
  }, []);

  return { student, ready, create, update, reset, awardQuiz };
}
