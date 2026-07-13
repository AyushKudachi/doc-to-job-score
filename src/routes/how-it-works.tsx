import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload, Brain, FileDown, ShieldCheck } from "lucide-react";
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
    title: "1. Upload your resume",
    text: "Drop a PDF or DOCX. We extract the raw text directly in your browser — nothing is uploaded until you click Analyze.",
  },
  {
    icon: Brain,
    title: "2. AI analysis",
    text: "Our AI compares your resume against ATS best practices and (optionally) the job description you paste in, scoring keywords, skills, experience, and formatting.",
  },
  {
    icon: FileDown,
    title: "3. Report & improve",
    text: "You get an ATS score, matched and missing keywords, strengths, and concrete rewrite suggestions — downloadable as a PDF report.",
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
    a: "No, but adding one dramatically improves the analysis. With a job description we can identify exact keywords and skills the employer is looking for, and flag what's missing.",
  },
  {
    q: "How is the ATS score calculated?",
    a: "The score is a weighted blend of four factors: keyword match, skills coverage, experience relevance, and formatting/readability. Each is scored 0–100 and combined into an overall score.",
  },
  {
    q: "What does 'missing keywords' mean?",
    a: "Words or phrases that appear in the job description (or are commonly expected in your industry) but are not present in your resume. Adding them where truthful can significantly boost your match rate.",
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="border-b border-border/40">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-sm font-semibold">ResumeIQ</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">How ResumeIQ works</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Three steps from upload to a rewritten, ATS-friendly resume.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3 mb-16">
          {steps.map((s) => (
            <Card key={s.title} className="p-6">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mb-4">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          </div>
          <Card className="p-2 sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>

        <section className="text-center">
          <Link to="/">
            <Button size="lg">Try it now</Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
