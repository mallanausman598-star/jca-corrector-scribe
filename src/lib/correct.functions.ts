import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().trim().min(1, "Text required").max(2000, "Text too long"),
});

export type CorrectionResult = {
  corrected: string;
  original: string;
  hasErrors: boolean;
  spellingErrors: { word: string; suggestion: string }[];
  improvements: string[];
  parts_of_speech: { word: string; pos: string }[];
  tense: string;
  structure: string;
  better_versions: string[];
  urdu_explanation: string;
};

export const correctSentence = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CorrectionResult> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const tool = {
      type: "function",
      function: {
        name: "analyze_sentence",
        description: "Correct and analyze an English sentence for an ESL student.",
        parameters: {
          type: "object",
          properties: {
            corrected: { type: "string", description: "The grammatically perfect version of the sentence" },
            hasErrors: { type: "boolean" },
            spellingErrors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  suggestion: { type: "string" },
                },
                required: ["word", "suggestion"],
                additionalProperties: false,
              },
            },
            improvements: {
              type: "array",
              description: "Bullet-point list of what was changed and why",
              items: { type: "string" },
            },
            parts_of_speech: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  word: { type: "string" },
                  pos: {
                    type: "string",
                    enum: ["noun", "pronoun", "verb", "adjective", "adverb", "preposition", "conjunction", "interjection", "determiner", "auxiliary"],
                  },
                },
                required: ["word", "pos"],
                additionalProperties: false,
              },
            },
            tense: { type: "string", description: "e.g. Present Simple, Past Perfect Continuous" },
            structure: { type: "string", description: "Subject + Verb + Object breakdown, 1-2 sentences" },
            better_versions: {
              type: "array",
              description: "2-3 more natural / advanced ways to express the same idea",
              items: { type: "string" },
            },
            urdu_explanation: {
              type: "string",
              description: "Short Urdu explanation (in Urdu script) of what the corrected sentence means and the main correction made",
            },
          },
          required: [
            "corrected", "hasErrors", "spellingErrors", "improvements",
            "parts_of_speech", "tense", "structure", "better_versions", "urdu_explanation",
          ],
          additionalProperties: false,
        },
      },
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert English teacher at Junaid Coaching Academy helping Urdu-speaking students. Always correct grammar, spelling, punctuation, and word choice. Provide thorough but student-friendly analysis. Urdu explanation MUST be in Urdu script (نستعلیق).",
          },
          { role: "user", content: `Analyze this sentence:\n\n"${data.text}"` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "analyze_sentence" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Too many requests. Please slow down.");
      if (response.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI service error");
    }

    const json = await response.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) throw new Error("No analysis returned");

    const parsed = JSON.parse(call.function.arguments);
    return { ...parsed, original: data.text };
  });
