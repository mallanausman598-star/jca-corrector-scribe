export type Question = {
  q: string;
  options: string[];
  answer: number; // index
  explain?: string;
};

export const GRAMMAR_BANK: Question[] = [
  { q: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1, explain: "Third person singular adds -s/-es." },
  { q: "I ___ pizza yesterday.", options: ["eat", "ate", "eaten", "eating"], answer: 1, explain: "Past simple of 'eat' is 'ate'." },
  { q: "They ___ playing football now.", options: ["is", "am", "are", "be"], answer: 2 },
  { q: "If it rains, we ___ stay home.", options: ["will", "would", "shall have", "are"], answer: 0, explain: "First conditional uses will." },
  { q: "He has ___ his homework.", options: ["finish", "finishing", "finished", "finishes"], answer: 2 },
  { q: "There ___ many books on the shelf.", options: ["is", "are", "was", "be"], answer: 1 },
  { q: "I have lived here ___ 2010.", options: ["for", "since", "from", "at"], answer: 1, explain: "'Since' is used for points in time." },
  { q: "She is ___ than her brother.", options: ["tall", "taller", "tallest", "more tall"], answer: 1 },
  { q: "This is the ___ movie I have ever seen.", options: ["good", "better", "best", "well"], answer: 2 },
  { q: "I ___ never been to Paris.", options: ["has", "have", "had", "having"], answer: 1 },
  { q: "Could you ___ me a favor?", options: ["do", "make", "have", "take"], answer: 0 },
  { q: "The cat is ___ the table.", options: ["in", "on", "at", "by"], answer: 1 },
  { q: "Neither John ___ Mary came.", options: ["or", "nor", "and", "but"], answer: 1 },
  { q: "He ___ TV when I called.", options: ["watches", "was watching", "watched", "is watching"], answer: 1, explain: "Past continuous for an action in progress." },
  { q: "I wish I ___ rich.", options: ["am", "was", "were", "be"], answer: 2, explain: "Subjunctive uses 'were'." },
  { q: "She doesn't like coffee, ___ she?", options: ["does", "doesn't", "is", "isn't"], answer: 0 },
  { q: "By next year, I ___ graduated.", options: ["will have", "will", "had", "have"], answer: 0 },
  { q: "The book ___ by millions.", options: ["read", "reads", "is read", "reading"], answer: 2, explain: "Passive voice." },
  { q: "Hardly ___ I sat down when the phone rang.", options: ["did", "had", "have", "was"], answer: 1 },
  { q: "It's high time we ___ home.", options: ["go", "went", "going", "have gone"], answer: 1 },
];

export const VOCAB_BANK: Question[] = [
  { q: "What is the synonym of 'happy'?", options: ["sad", "joyful", "angry", "tired"], answer: 1 },
  { q: "What is the antonym of 'brave'?", options: ["bold", "fearless", "cowardly", "strong"], answer: 2 },
  { q: "'Abundant' means:", options: ["scarce", "plentiful", "empty", "rare"], answer: 1 },
  { q: "'Diligent' means:", options: ["lazy", "hardworking", "quick", "rude"], answer: 1 },
  { q: "Synonym of 'begin':", options: ["end", "commence", "stop", "finish"], answer: 1 },
  { q: "Antonym of 'ancient':", options: ["old", "modern", "antique", "aged"], answer: 1 },
  { q: "'Eloquent' means:", options: ["silent", "well-spoken", "shy", "loud"], answer: 1 },
  { q: "'Generous' means:", options: ["selfish", "giving", "rich", "poor"], answer: 1 },
  { q: "Synonym of 'tiny':", options: ["huge", "small", "tall", "wide"], answer: 1 },
  { q: "Antonym of 'reveal':", options: ["show", "hide", "tell", "speak"], answer: 1 },
  { q: "'Frugal' means:", options: ["wasteful", "thrifty", "wealthy", "lazy"], answer: 1 },
  { q: "'Vivid' means:", options: ["dull", "bright and clear", "boring", "calm"], answer: 1 },
  { q: "Synonym of 'angry':", options: ["calm", "furious", "happy", "sleepy"], answer: 1 },
  { q: "Antonym of 'expand':", options: ["grow", "shrink", "stretch", "swell"], answer: 1 },
  { q: "'Meticulous' means:", options: ["careless", "very careful", "fast", "lazy"], answer: 1 },
  { q: "'Optimistic' means:", options: ["hopeful", "sad", "doubtful", "angry"], answer: 0 },
  { q: "Synonym of 'difficult':", options: ["easy", "hard", "simple", "light"], answer: 1 },
  { q: "Antonym of 'permit':", options: ["allow", "forbid", "let", "grant"], answer: 1 },
  { q: "'Candid' means:", options: ["secret", "honest", "shy", "rude"], answer: 1 },
  { q: "'Lethargic' means:", options: ["energetic", "sluggish", "quick", "happy"], answer: 1 },
];

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const a = [...arr];
  let rng = seed ?? Math.floor(Math.random() * 1e9);
  const rand = () => { rng = (rng * 1664525 + 1013904223) >>> 0; return rng / 0xffffffff; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickQuestions(category: "grammar" | "vocab" | "daily", count = 5, seed?: number): Question[] {
  if (category === "daily") {
    const mix = [...GRAMMAR_BANK, ...VOCAB_BANK];
    return shuffle(mix, seed).slice(0, count);
  }
  const bank = category === "grammar" ? GRAMMAR_BANK : VOCAB_BANK;
  return shuffle(bank, seed).slice(0, count);
}

export function dailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
