import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  fullName: z.string().min(1),
  targetRole: z.string().min(1),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  links: z.string().optional().default(""),
  yearsExperience: z.string().optional().default(""),
  skills: z.string().optional().default(""),
  experience: z.string().optional().default(""),
  education: z.string().optional().default(""),
  projects: z.string().optional().default(""),
  achievements: z.string().optional().default(""),
  tone: z.enum(["professional", "concise", "impactful", "creative"]).default("impactful"),
});

const ExperienceItem = z.object({
  role: z.string(),
  company: z.string(),
  location: z.string().optional().default(""),
  period: z.string().optional().default(""),
  bullets: z.array(z.string()),
});

const EducationItem = z.object({
  degree: z.string(),
  school: z.string(),
  period: z.string().optional().default(""),
  details: z.string().optional().default(""),
});

const ProjectItem = z.object({
  name: z.string(),
  description: z.string(),
  tech: z.array(z.string()).optional().default([]),
});

const ResumeSchema = z.object({
  fullName: z.string(),
  targetRole: z.string(),
  contact: z.object({
    email: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    location: z.string().optional().default(""),
    links: z.array(z.string()).optional().default([]),
  }),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(ExperienceItem),
  projects: z.array(ProjectItem).optional().default([]),
  education: z.array(EducationItem),
  achievements: z.array(z.string()).optional().default([]),
  atsTips: z.array(z.string()),
});

export type BuiltResume = z.infer<typeof ResumeSchema>;

const SYSTEM_PROMPT = `You are a world-class resume writer and ATS optimization expert.
Given raw candidate info, produce a polished, ATS-friendly resume as strict JSON matching this schema:
{
  "fullName": string,
  "targetRole": string,
  "contact": { "email": string, "phone": string, "location": string, "links": string[] },
  "summary": string (3-4 punchy sentences, tailored to targetRole, keyword-rich),
  "skills": string[] (12-20 relevant hard & soft skills, industry-standard terms),
  "experience": [ { "role", "company", "location", "period", "bullets": string[] (3-5 achievement-driven bullets using strong verbs and quantified impact where possible) } ],
  "projects": [ { "name", "description", "tech": string[] } ],
  "education": [ { "degree", "school", "period", "details" } ],
  "achievements": string[],
  "atsTips": string[] (4-6 tips specific to this resume)
}
Rules:
- Rewrite user's raw notes into strong, professional language. Never invent employers, dates, or credentials that were not provided.
- Use action verbs (Led, Built, Shipped, Optimized, Reduced, Increased) and quantify results when the user gave numbers.
- Keep bullets concise (max ~25 words).
- Return ONLY valid JSON. No markdown, no commentary.`;

export const buildResume = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<BuiltResume> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const userContent = `Candidate info:
Full name: ${data.fullName}
Target role: ${data.targetRole}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
Links (comma-separated): ${data.links}
Years of experience: ${data.yearsExperience}
Skills (raw): ${data.skills}
Experience (raw notes, one job per block):
${data.experience}

Projects (raw): ${data.projects}
Education (raw): ${data.education}
Achievements (raw): ${data.achievements}
Preferred tone: ${data.tone}

Generate the resume JSON now.`;

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

    return ResumeSchema.parse(parsed);
  });
