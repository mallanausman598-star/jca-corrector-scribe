import { createServerFn } from "@tanstack/react-start";

export type DailyQuestion = {
  q: string;
  options: string[];
  answer: number; // 0-3
  explain: string;
};

function todayKey(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// FSC-level English fallback bank — used if AI gateway is unreachable.
const FALLBACK: DailyQuestion[] = [
  { q: "Choose the correct passive: 'They will complete the project tomorrow.'", options: ["The project will complete tomorrow.", "The project will be completed tomorrow.", "The project is completed tomorrow.", "The project would be completed tomorrow."], answer: 1, explain: "Future passive: will + be + past participle." },
  { q: "Identify the figure of speech: 'The wind whispered through the trees.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: 2, explain: "Giving human qualities (whispering) to a non-human thing is personification." },
  { q: "Synonym of 'ephemeral':", options: ["Eternal", "Short-lived", "Mysterious", "Powerful"], answer: 1, explain: "Ephemeral means lasting for a very short time." },
  { q: "Choose the correct sentence:", options: ["Neither of the boys have come.", "Neither of the boys has come.", "Neither of the boys are come.", "Neither of the boys were came."], answer: 1, explain: "'Neither' is singular, so it takes 'has'." },
  { q: "Antonym of 'benevolent':", options: ["Kind", "Generous", "Malevolent", "Tolerant"], answer: 2, explain: "Malevolent means having evil intentions — opposite of benevolent." },
  { q: "Correct the tense: 'By the time you arrive, I ___ dinner.'", options: ["will cook", "will have cooked", "have cooked", "had cooked"], answer: 1, explain: "Future perfect for an action finished before a future point." },
  { q: "Identify the part of speech of 'beautifully' in: 'She sings beautifully.'", options: ["Adjective", "Verb", "Noun", "Adverb"], answer: 3, explain: "It modifies the verb 'sings'." },
  { q: "Meaning of the idiom 'to bite the bullet':", options: ["To eat fast", "To face a difficult situation bravely", "To lie", "To remain silent"], answer: 1, explain: "It means to endure a painful or unpleasant situation that is unavoidable." },
  { q: "Choose the correct conditional: 'If I ___ rich, I would travel the world.'", options: ["am", "was", "were", "be"], answer: 2, explain: "Second conditional uses 'were' for all subjects (subjunctive)." },
  { q: "Which word is spelled correctly?", options: ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], answer: 2, explain: "Two c's and two m's: Accommodate." },
];

async function generateWithAI(): Promise<DailyQuestion[] | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    console.warn("[daily-quiz] LOVABLE_API_KEY not set, using fallback");
    return null;
  }

  const today = todayKey();
  const prompt = `Generate 10 challenging FSC-level (Pakistani 11th/12th grade) English MCQs for ${today}. Mix: grammar (tenses, voice, conditionals), vocabulary (synonyms/antonyms/idioms), and figures of speech. Each question must be conceptual and exam-worthy. Return ONLY a JSON array of 10 objects with this exact shape: {"q": "question text", "options": ["a","b","c","d"], "answer": <index 0-3>, "explain": "1-sentence explanation"}. No markdown, no commentary.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an FSC English exam writer. Output strictly valid JSON arrays only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn("[daily-quiz] AI gateway error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    // Try to extract JSON array from the response.
    const match = text.match(/\[[\s\S]*\]/);
    const jsonStr = match ? match[0] : text;
    const parsed = JSON.parse(jsonStr);
    const arr: unknown = Array.isArray(parsed) ? parsed : (parsed?.questions ?? parsed?.mcqs);
    if (!Array.isArray(arr)) return null;

    const cleaned: DailyQuestion[] = arr
      .filter((x: any) => x && typeof x.q === "string" && Array.isArray(x.options) && x.options.length === 4 && typeof x.answer === "number")
      .map((x: any) => ({
        q: String(x.q),
        options: x.options.map((o: any) => String(o)),
        answer: Math.max(0, Math.min(3, Number(x.answer))),
        explain: String(x.explain ?? ""),
      }));

    return cleaned.length >= 5 ? cleaned.slice(0, 10) : null;
  } catch (err) {
    console.warn("[daily-quiz] generation failed", err);
    return null;
  }
}

export const getDailyQuiz = createServerFn({ method: "GET" }).handler(async () => {
  const today = todayKey();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1. Check cache.
  const { data: cached } = await supabaseAdmin
    .from("daily_quizzes")
    .select("questions")
    .eq("date_key", today)
    .maybeSingle();

  if (cached?.questions) {
    return { date: today, questions: cached.questions as DailyQuestion[], source: "cache" as const };
  }

  // 2. Generate via AI.
  const ai = await generateWithAI();
  const questions = ai ?? FALLBACK;

  // 3. Cache (best-effort).
  try {
    await supabaseAdmin
      .from("daily_quizzes")
      .insert({ date_key: today, questions });
  } catch (err) {
    console.warn("[daily-quiz] cache insert failed", err);
  }

  return { date: today, questions, source: ai ? ("ai" as const) : ("fallback" as const) };
});
