import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  resumeText: z.string().min(50, "Resume text is too short"),
});

const AnalysisSchema = z.object({
  atsScore: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    keywords: z.number().min(0).max(100),
    formatting: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    skills: z.number().min(0).max(100),
  }),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  detectedSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()).default([]),
  improvements: z.array(z.string()),
  actionPoints: z.array(z.string()).default([]),
  summary: z.string(),
});

export type ResumeAnalysis = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `You are an elite ATS (Applicant Tracking System) analyzer and senior career coach.
Analyze the resume and return a strict JSON object matching this schema:
{
  "atsScore": number 0-100 (overall ATS compatibility & general job-market fit),
  "scoreBreakdown": { "keywords": 0-100, "formatting": 0-100, "experience": 0-100, "skills": 0-100 },
  "matchedKeywords": string[] (strong industry/role keywords present in the resume),
  "missingKeywords": string[] (commonly expected industry keywords the resume lacks),
  "detectedSkills": string[] (skills detected in the resume),
  "strengths": string[] (4-6 concise, specific strengths — reference actual resume content),
  "weaknesses": string[] (4-6 concrete weaknesses or red flags an ATS/recruiter would flag),
  "improvements": string[] (5-8 concrete rewrite/structure suggestions with the WHY),
  "actionPoints": string[] (5-7 prioritized next actions the candidate should take THIS WEEK — start each with a strong verb like "Add", "Quantify", "Rewrite", "Remove", "Reorder"),
  "summary": string (2-3 sentence overall assessment)
}
Be honest, specific, and actionable. Reference real content from the resume when possible.
Return ONLY valid JSON. No markdown, no commentary.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ResumeAnalysis> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");
    const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

    const userContent = `RESUME:\n"""\n${data.resumeText}\n"""\n\nAnalyze this resume for general ATS compatibility and job-market fit.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://doc-to-job-score.onrender.com",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Resume ATS Analyzer",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      if (response.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      if (response.status === 402) throw new Error("OpenRouter credits exhausted. Add credits at openrouter.ai/credits.");
      throw new Error(`OpenRouter error (${response.status}): ${text.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";

    const parsed = extractJson(content);
    return AnalysisSchema.parse(parsed);
  });

function extractJson(raw: string): unknown {
  const cleaned = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    if (start === -1) throw new Error("AI returned malformed response");
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1));
      }
    }
    throw new Error("AI returned malformed response");
  }
}

