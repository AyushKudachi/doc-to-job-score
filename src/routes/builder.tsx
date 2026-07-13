import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Download, Wand2, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { buildResume, type BuiltResume } from "@/lib/build-resume.functions";
import { downloadBuiltResume } from "@/lib/resume-pdf";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "AI Resume Builder — ResumeIQ" },
      {
        name: "description",
        content:
          "Build a polished, ATS-optimized resume in seconds. Enter your raw notes and let AI craft strong bullets, keywords, and structure.",
      },
      { property: "og:title", content: "AI Resume Builder — ResumeIQ" },
      {
        property: "og:description",
        content: "Turn rough notes into a recruiter-ready, ATS-friendly resume with AI.",
      },
    ],
  }),
  component: Builder,
});

type Form = {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  yearsExperience: string;
  skills: string;
  experience: string;
  education: string;
  projects: string;
  achievements: string;
  tone: "professional" | "concise" | "impactful" | "creative";
};

const EMPTY: Form = {
  fullName: "",
  targetRole: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  yearsExperience: "",
  skills: "",
  experience: "",
  education: "",
  projects: "",
  achievements: "",
  tone: "impactful",
};

const SAMPLE: Form = {
  fullName: "Alex Morgan",
  targetRole: "Senior Frontend Engineer",
  email: "alex@example.com",
  phone: "+1 555 010 2233",
  location: "Remote — US",
  links: "github.com/alexm, linkedin.com/in/alexm",
  yearsExperience: "6",
  skills: "React, TypeScript, Next.js, Node, GraphQL, Tailwind, Playwright, AWS, Figma",
  experience:
    "Frontend Lead @ Nimbus (2022-Present) — led 5 devs, migrated app to Next.js, cut TTI by 45%, shipped design system.\n\nSenior Engineer @ Bolt (2019-2022) — built checkout flow processing $20M/yr, mentored 3 juniors, drove a11y to WCAG AA.",
  education: "B.S. Computer Science, University of Texas, 2015-2019, GPA 3.8",
  projects:
    "OpenBench — open-source component perf benchmarking tool, 1.2k stars. React, Vitest.",
  achievements: "Speaker at ReactConf 2024. Winner, TechCrunch Hackathon 2021.",
  tone: "impactful",
};

function Builder() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<BuiltResume | null>(null);
  const [copied, setCopied] = useState(false);
  const build = useServerFn(buildResume);

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onGenerate = async () => {
    if (!form.fullName.trim() || !form.targetRole.trim()) {
      toast.error("Please add your name and target role");
      return;
    }
    setLoading(true);
    setResume(null);
    try {
      const result = await build({ data: form });
      setResume(result);
      toast.success("Resume generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!resume) return;
    const t = plainText(resume);
    await navigator.clipboard.writeText(t);
    setCopied(true);
    toast.success("Copied plain-text resume");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
              R
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Resume<span className="text-primary">IQ</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition">Analyzer</Link>
            <Link to="/builder" className="text-foreground">Builder</Link>
            <Link to="/how-it-works" className="hover:text-foreground transition">How it works</Link>
          </nav>
          <Link to="/">
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 grid-lines opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <Wand2 className="h-3.5 w-3.5" /> AI Resume Builder
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-6xl font-semibold tracking-tighter leading-[1]">
            <span className="text-foreground">Build a </span>
            <span className="text-gradient">recruiter-ready</span>
            <br />
            <span className="text-foreground">resume in seconds.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base md:text-lg text-muted-foreground">
            Drop in rough notes. AI rewrites them into strong, quantified bullets with the right
            keywords for your target role.
          </p>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          {/* FORM */}
          <Card className="elevated-card p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Your details</h2>
              <button
                type="button"
                onClick={() => setForm(SAMPLE)}
                className="text-xs text-primary hover:underline"
              >
                Fill sample
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full name *">
                  <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Jane Doe" />
                </Field>
                <Field label="Target role *">
                  <Input value={form.targetRole} onChange={(e) => update("targetRole", e.target.value)} placeholder="Product Designer" />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Email">
                  <Input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@mail.com" />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555..." />
                </Field>
                <Field label="Location">
                  <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, Country" />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Links (comma-separated)">
                  <Input value={form.links} onChange={(e) => update("links", e.target.value)} placeholder="github.com/you, linkedin.com/in/you" />
                </Field>
                <Field label="Years of experience">
                  <Input value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} placeholder="4" />
                </Field>
              </div>

              <Field label="Skills (comma-separated)">
                <Textarea rows={2} value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="React, TypeScript, Figma, User research..." />
              </Field>

              <Field label="Experience (raw notes — one job per block)">
                <Textarea rows={6} value={form.experience} onChange={(e) => update("experience", e.target.value)} placeholder="Role @ Company (2022-Present) — what you did, numbers, impact..." />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Education">
                  <Textarea rows={3} value={form.education} onChange={(e) => update("education", e.target.value)} placeholder="Degree, School, Year" />
                </Field>
                <Field label="Projects">
                  <Textarea rows={3} value={form.projects} onChange={(e) => update("projects", e.target.value)} placeholder="Project name — what it does, tech stack" />
                </Field>
              </div>

              <Field label="Achievements & awards">
                <Textarea rows={2} value={form.achievements} onChange={(e) => update("achievements", e.target.value)} placeholder="Speaker, awards, publications..." />
              </Field>

              <Field label="Tone">
                <div className="flex flex-wrap gap-2">
                  {(["impactful", "professional", "concise", "creative"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => update("tone", t)}
                      className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                        form.tone === t
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Field>

              <Button
                onClick={onGenerate}
                disabled={loading}
                size="lg"
                className="mt-2 rounded-full h-12 lime-glow text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Crafting your resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate resume
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* PREVIEW */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            {!resume && !loading && (
              <Card className="elevated-card p-10 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Wand2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">Your resume preview</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill in your details on the left and hit generate. AI will structure a clean,
                  ATS-friendly resume you can download as PDF.
                </p>
              </Card>
            )}

            {loading && (
              <Card className="elevated-card p-10 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Writing strong bullets, picking keywords, structuring sections...
                </p>
              </Card>
            )}

            {resume && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => downloadBuiltResume(resume)} className="rounded-full">
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                  <Button variant="secondary" onClick={copyText} className="rounded-full">
                    {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    Copy text
                  </Button>
                </div>

                <Card className="elevated-card p-8 bg-white text-neutral-900">
                  <ResumePreview resume={resume} />
                </Card>

                {resume.atsTips?.length > 0 && (
                  <Card className="elevated-card p-6">
                    <h4 className="font-display text-sm font-semibold text-primary uppercase tracking-wider">
                      ATS tips for your resume
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {resume.atsTips.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">✦</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function ResumePreview({ resume }: { resume: BuiltResume }) {
  const contact = [resume.contact.email, resume.contact.phone, resume.contact.location, ...(resume.contact.links || [])].filter(Boolean);
  return (
    <div className="space-y-5 font-[Inter]">
      <header className="border-b border-neutral-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{resume.fullName}</h1>
        <p className="mt-0.5 text-sm text-neutral-600">{resume.targetRole}</p>
        {contact.length > 0 && (
          <p className="mt-2 text-xs text-neutral-500">{contact.join("  •  ")}</p>
        )}
      </header>

      <Section title="Summary">
        <p className="text-sm leading-relaxed text-neutral-700">{resume.summary}</p>
      </Section>

      {resume.skills?.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((s) => (
              <Badge key={s} variant="secondary" className="bg-neutral-100 text-neutral-700 font-normal">
                {s}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {resume.experience?.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {resume.experience.map((j, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-neutral-900">
                    {j.role} <span className="font-normal text-neutral-500">— {j.company}</span>
                  </p>
                  <p className="text-xs text-neutral-500">{[j.location, j.period].filter(Boolean).join(" • ")}</p>
                </div>
                <ul className="mt-1.5 list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {j.bullets.map((b, k) => <li key={k}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.projects?.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {resume.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-neutral-900">{p.name}</p>
                <p className="text-sm text-neutral-700">{p.description}</p>
                {p.tech?.length > 0 && (
                  <p className="mt-0.5 text-xs text-neutral-500">Tech: {p.tech.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.education?.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {resume.education.map((e, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-neutral-800">
                  <span className="font-semibold">{e.degree}</span> — {e.school}
                </p>
                <p className="text-xs text-neutral-500">{e.period}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.achievements?.length > 0 && (
        <Section title="Achievements">
          <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
            {resume.achievements.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 mb-2">{title}</h2>
      {children}
    </section>
  );
}

function plainText(r: BuiltResume): string {
  const lines: string[] = [];
  lines.push(r.fullName.toUpperCase());
  lines.push(r.targetRole);
  const c = [r.contact.email, r.contact.phone, r.contact.location, ...(r.contact.links || [])].filter(Boolean);
  if (c.length) lines.push(c.join(" | "));
  lines.push("");
  lines.push("SUMMARY"); lines.push(r.summary); lines.push("");
  if (r.skills?.length) { lines.push("SKILLS"); lines.push(r.skills.join(", ")); lines.push(""); }
  if (r.experience?.length) {
    lines.push("EXPERIENCE");
    for (const j of r.experience) {
      lines.push(`${j.role} — ${j.company}  ${[j.location, j.period].filter(Boolean).join(" | ")}`);
      for (const b of j.bullets) lines.push(`  • ${b}`);
      lines.push("");
    }
  }
  if (r.projects?.length) {
    lines.push("PROJECTS");
    for (const p of r.projects) {
      lines.push(p.name);
      lines.push(`  ${p.description}`);
      if (p.tech?.length) lines.push(`  Tech: ${p.tech.join(", ")}`);
      lines.push("");
    }
  }
  if (r.education?.length) {
    lines.push("EDUCATION");
    for (const e of r.education) lines.push(`${e.degree} — ${e.school}  ${e.period}`);
    lines.push("");
  }
  if (r.achievements?.length) {
    lines.push("ACHIEVEMENTS");
    for (const a of r.achievements) lines.push(`  • ${a}`);
  }
  return lines.join("\n");
}
