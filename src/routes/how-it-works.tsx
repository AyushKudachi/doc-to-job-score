import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload, Brain, FileDown, ShieldCheck, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — ResumeIQ" },
      {
        name: "description",
        content:
          "Learn how ResumeIQ analyzes your resume for ATS compatibility, keyword matching, and improvement suggestions.",
      },
      { property: "og:title", content: "How ResumeIQ works" },
      {
        property: "og:description",
        content: "The steps and FAQs behind ResumeIQ's AI-powered ATS resume analysis.",
      },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  {
    icon: Upload,
    n: "01",
    title: "Upload your resume",
    text: "Drop a PDF or DOCX. We extract raw text directly in your browser — nothing is sent anywhere until you click analyze.",
  },
  {
    icon: Brain,
    n: "02",
    title: "AI analysis",
    text: "Our AI compares your resume against ATS best practices and industry expectations, scoring keywords, skills, experience, and formatting.",
  },
  {
    icon: FileDown,
    n: "03",
    title: "Report & improve",
    text: "You get an ATS score, matched and missing keywords, strengths, and concrete rewrite suggestions — downloadable as a polished PDF report.",
  },
];

const faqs = [
  {
    q: "What is an ATS score?",
    a: "Applicant Tracking Systems (ATS) are software recruiters use to filter resumes. An ATS score estimates how likely your resume is to be parsed correctly and matched to a role based on keywords, structure, and relevant experience.",
  },
  {
    q: "Which file types can I upload?",
    a: "PDF, DOCX, and plain TXT files up to 20MB. Text-based PDFs work best — scanned images of resumes will not extract cleanly.",
  },
  {
    q: "Do I need a job description?",
    a: "No. ResumeIQ analyzes your resume for general ATS compatibility and job-market fit, highlighting industry keywords, skills, and formatting issues without requiring a specific job posting.",
  },
  {
    q: "How is the ATS score calculated?",
    a: "The score is a weighted blend of four factors: keyword match, skills coverage, experience relevance, and formatting/readability. Each is scored 0–100 and combined into an overall score.",
  },
  {
    q: "What does 'missing keywords' mean?",
    a: "Words or phrases commonly expected in your industry or role that are not present in your resume. Adding them where truthful can significantly boost your ATS match rate.",
  },
  {
    q: "How do I use the improvement suggestions?",
    a: "Treat them as a checklist. Each suggestion targets a concrete change — rewording a bullet, adding a quantifiable metric, restructuring a section, or surfacing a missing skill. Apply them, then re-run the analysis.",
  },
  {
    q: "Is my resume stored?",
    a: "No. Your resume text is sent to the AI only for analysis and is not saved on our servers. Extraction happens in your browser.",
  },
  {
    q: "Can I download the report?",
    a: "Yes — after analysis, click 'Download PDF report' to save a full breakdown including score, keywords, strengths, and suggestions.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">R</span>
            <span className="font-display text-sm font-semibold">ResumeIQ</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="text-center mb-20 hero-bg -mx-6 px-6 py-16 rounded-3xl">
          <div className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4">The playbook</div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tighter">
            How <span className="text-primary italic font-normal">ResumeIQ</span> works
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Three steps from raw resume to a rewrite that clears the bots and wins the interview.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-3 mb-24">
          {steps.map((s) => (
            <Card key={s.title} className="elevated-card p-7 rounded-2xl relative overflow-hidden group">
              <div className="absolute -top-6 -right-4 font-display text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition">
                {s.n}
              </div>
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary border border-primary/25 mb-5">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Frequently asked
            </h2>
          </div>
          <Card className="elevated-card rounded-2xl p-2 md:p-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border/60 px-4">
                  <AccordionTrigger className="text-left font-display text-base md:text-lg py-5 hover:no-underline hover:text-primary transition">
                    <span className="flex gap-4 items-center">
                      <span className="font-mono text-xs text-primary/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pl-10 pb-5 text-base">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        <section className="text-center py-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-6">
            Ready when you are.
          </h2>
          <Link to="/">
            <Button size="lg" className="rounded-full h-12 px-8 lime-glow">
              Analyze my resume <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
