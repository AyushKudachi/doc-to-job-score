import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  resumeText: z.string().min(50, "Resume text is too short"),
  jobDescription: z.string().optional().default(""),
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
  improvements: z.array(z.string()),
  summary: z.string(),
});

export type ResumeAnalysis = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.
Analyze the resume and return a strict JSON object matching this schema:
{
  "atsScore": number 0-100 (overall ATS compatibility & job fit),
  "scoreBreakdown": { "keywords": 0-100, "formatting": 0-100, "experience": 0-100, "skills": 0-100 },
  "matchedKeywords": string[] (keywords from the job description present in the resume; empty array if no JD),
  "missingKeywords": string[] (important keywords from the job description missing from the resume; if no JD, list commonly expected industry keywords the resume lacks),
  "detectedSkills": string[] (skills detected in the resume),
  "strengths": string[] (3-6 concise strengths),
  "improvements": string[] (5-8 concrete, actionable rewrite/structure suggestions),
  "summary": string (2-3 sentence overall assessment)
}
Return ONLY valid JSON. No markdown, no commentary.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ResumeAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const userContent = `RESUME:\n"""\n${data.resumeText}\n"""\n\nJOB DESCRIPTION:\n"""\n${data.jobDescription || "(none provided — evaluate as a general resume)"}\n"""`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
      if (response.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
      throw new Error(`AI gateway error (${response.status}): ${text.slice(0, 200)}`);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned malformed response");
      parsed = JSON.parse(match[0]);
    }

    return AnalysisSchema.parse(parsed);
  });
