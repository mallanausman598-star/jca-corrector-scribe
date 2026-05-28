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
  // upsert leaderboard
  try {
    const lb: LeaderboardEntry[] = JSON.parse(localStorage.getItem(LB_KEY) ?? "[]");
    const idx = lb.findIndex((e) => e.name.toLowerCase() === s.name.toLowerCase());
    const entry = { name: s.name, xp: s.xp, level: levelFromXp(s.xp).level };
    if (idx >= 0) lb[idx] = entry; else lb.push(entry);
    lb.sort((a, b) => b.xp - a.xp);
    localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0, 50)));
  } catch {}
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LB_KEY) ?? "[]"); } catch { return []; }
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
