// Local-only score history for the Daily Quiz (last 30 entries).
const KEY = "jca:dailyHistory";

export type DailyResult = {
  date: string; // YYYY-MM-DD
  score: number;
  total: number;
  xp: number;
};

export function getDailyHistory(): DailyResult[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addDailyResult(r: DailyResult) {
  if (typeof window === "undefined") return;
  const list = getDailyHistory().filter((x) => x.date !== r.date);
  list.unshift(r);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
}

export function getTodayResult(today: string): DailyResult | undefined {
  return getDailyHistory().find((r) => r.date === today);
}
