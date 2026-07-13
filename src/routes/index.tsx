import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Download,
  CheckCircle2,
  XCircle,
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight,
  Zap,
  ScanLine,
  FileCheck2,
  Wand2,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { extractTextFromFile } from "@/lib/extract-text";
import { analyzeResume, type ResumeAnalysis } from "@/lib/analyze-resume.functions";
import { downloadReport } from "@/lib/report";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeIQ — AI Resume ATS Score & Optimization" },
      {
        name: "description",
        content:
          "Upload your resume PDF or DOCX and get an instant ATS score, missing keywords, skill match, and actionable improvement suggestions.",
      },
      { property: "og:title", content: "ResumeIQ — AI Resume ATS Score & Optimization" },
      {
        property: "og:description",
        content:
          "Instant ATS analysis: score, missing keywords, skill gaps, and improvement tips for your resume.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const analyze = useServerFn(analyzeResume);


  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setAnalysis(null);
    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(f);
      if (!text || text.length < 50) {
        throw new Error("Could not extract enough text from this file.");
      }
      setResumeText(text);
      toast.success("Resume text extracted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to read file");
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer.files?.[0];
      if (f) void handleFile(f);
    },
    [handleFile],
  );

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.length < 50) {
      toast.error("Please upload a resume first");
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyze({ data: { resumeText } });
      setAnalysis(result);
      toast.success("Analysis complete");
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scrollToAnalyzer = () => {
    document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
              R
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Resume<span className="text-primary">IQ</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#analyzer" className="hover:text-foreground transition">Analyzer</a>
            <Link to="/builder" className="hover:text-foreground transition">AI Builder</Link>
            <Link to="/compare" className="hover:text-foreground transition">Compare</Link>
            <Link to="/how-it-works" className="hover:text-foreground transition">How it works</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" onClick={scrollToAnalyzer} className="rounded-full">
              Analyze <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="hero-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden />
        {/* Aurora blobs */}
        <div
          className="aurora"
          aria-hidden
          style={{
            width: 520,
            height: 520,
            top: -120,
            left: -80,
            background: "oklch(0.9 0.19 122 / 0.55)",
          }}
        />
        <div
          className="aurora"
          aria-hidden
          style={{
            width: 620,
            height: 620,
            top: 40,
            right: -160,
            background: "oklch(0.65 0.2 300 / 0.45)",
            animationDelay: "-6s",
          }}
        />
        <div
          className="aurora"
          aria-hidden
          style={{
            width: 480,
            height: 480,
            bottom: -180,
            left: "35%",
            background: "oklch(0.75 0.16 200 / 0.4)",
            animationDelay: "-12s",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
          <div className="reveal-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            AI-powered · Instant results
          </div>

          <h1 className="reveal-up-d1 mt-8 font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[0.95]">
            <span className="shimmer-text">Beat the bots.</span>
            <br />
            <span className="text-foreground">Land the </span>
            <span className="relative inline-block">
              <span className="relative z-10 gradient-pan italic font-normal">interview.</span>
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-primary/60"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 50 2, 100 6 T 198 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  className="signature-draw"
                />
              </svg>
            </span>
          </h1>

          <p className="reveal-up-d2 mx-auto mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            Drop your resume. Get an instant ATS score, missing keywords, skill gaps, and rewrite
            suggestions — powered by AI that thinks like a recruiter.
          </p>

          <div className="reveal-up-d3 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={scrollToAnalyzer} className="rounded-full h-12 px-7 glow-pulse text-base group">
              <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" /> Analyze my resume
              <ArrowRight className="ml-2 h-4 w-4 bounce-arrow" />
            </Button>
            <Link to="/builder">
              <Button size="lg" variant="secondary" className="rounded-full h-12 px-7 text-base bg-secondary/50 border border-border hover:border-primary/50 transition">
                <Wand2 className="mr-2 h-4 w-4" /> Build with AI
              </Button>
            </Link>
          </div>

          <div className="reveal-up-d3 mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground/60">
            <span>PDF & DOCX</span>
            <span className="text-primary/60">✦</span>
            <span>Zero storage</span>
            <span className="text-primary/60">✦</span>
            <span>Downloadable report</span>
            <span className="text-primary/60">✦</span>
            <span>Free forever</span>
          </div>
        </div>


        {/* Floating preview mockup */}
        <div className="relative mx-auto max-w-5xl px-6 pb-12 -mt-8">
          <div className="animate-float tilt-hover elevated-card rounded-3xl p-1.5">
            <div className="rounded-[22px] bg-background/60 backdrop-blur p-8 md:p-10">

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  </div>
                  <span className="ml-2 font-mono">resume_v3.pdf · analyzing</span>
                </div>
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-primary/30">
                  <Zap className="mr-1 h-3 w-3" /> Live
                </Badge>
              </div>
              <div className="grid gap-6 md:grid-cols-[auto_1fr] items-center">
                <div className="text-center">
                  <div className="font-display text-7xl font-semibold text-primary">87</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">ATS Score</div>
                </div>
                <div className="space-y-3">
                  {[
                    { l: "Keywords match", v: 92 },
                    { l: "Skills coverage", v: 84 },
                    { l: "Experience", v: 88 },
                    { l: "Formatting", v: 90 },
                  ].map((r) => (
                    <div key={r.l}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">{r.l}</span>
                        <span className="font-mono text-foreground">{r.v}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${r.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section id="features" className="border-y border-border/60 bg-secondary/20">
        <div className="mx-auto max-w-7xl px-6 py-16 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ScanLine,
              title: "Parse anything",
              text: "PDF, DOCX, TXT — extracted directly in your browser. Nothing leaves until you hit analyze.",
            },
            {
              icon: Target,
              title: "Match the market",
              text: "We compare your resume against industry-standard keywords, skills, and experience expectations with recruiter-level rigor.",
            },
            {
              icon: FileCheck2,
              title: "Actionable rewrites",
              text: "Not just a score — get concrete, section-by-section suggestions and a downloadable PDF report.",
            },
          ].map((f) => (
            <div key={f.title} className="group">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-5 group-hover:scale-110 transition">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYZER */}
      <section id="analyzer" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">Step 01 · Upload & analyze</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Let's see what recruiters see.
            </h2>
          </div>

          <div className="mx-auto max-w-xl">
            <div className="elevated-card rounded-2xl p-6">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-2 mb-4">
                <FileText className="h-3.5 w-3.5" /> Resume file
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={onDrop}
                onClick={() => fileInput.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all ${
                  dragActive
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFile(f);
                  }}
                />
                {isExtracting ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm">Extracting text…</span>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary mb-2">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div className="font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {(resumeText.length / 1000).toFixed(1)}k chars · click to replace
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary mb-2 border border-border">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="font-medium">Drop your resume here</div>
                    <div className="text-xs text-muted-foreground">
                      PDF · DOCX · TXT — up to 20MB
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!resumeText || isAnalyzing || isExtracting}
              className="rounded-full h-14 px-10 text-base lime-glow"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing your resume…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Run ATS analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {analysis && (
        <section id="results" className="relative py-16 border-t border-border/60 bg-secondary/10">
          <div className="mx-auto max-w-6xl px-6 space-y-6">
            <div className="text-center mb-8">
              <div className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">Step 02 · Your results</div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
                Here's the breakdown.
              </h2>
            </div>

            <ScoreCard analysis={analysis} />

            <BreakdownCard analysis={analysis} />

            <div className="grid gap-6 md:grid-cols-2">
              <KeywordCard
                title="Matched keywords"
                icon={<CheckCircle2 className="h-4 w-4" />}
                keywords={analysis.matchedKeywords}
                empty="No keywords matched yet."
                variant="matched"
              />
              <KeywordCard
                title="Missing keywords"
                icon={<XCircle className="h-4 w-4" />}
                keywords={analysis.missingKeywords}
                empty="Nothing important missing — nice."
                variant="missing"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ListCard
                title="Strengths"
                icon={<CheckCircle2 className="h-4 w-4" />}
                accent="text-primary"
                items={analysis.strengths}
              />
              <ListCard
                title="Weaknesses"
                icon={<XCircle className="h-4 w-4" />}
                accent="text-destructive"
                items={analysis.weaknesses.length ? analysis.weaknesses : ["No major weaknesses detected."]}
              />
            </div>

            <ListCard
              title="Improvement suggestions"
              icon={<TrendingUp className="h-4 w-4" />}
              accent="text-primary"
              items={analysis.improvements}
            />

            {analysis.actionPoints.length > 0 && (
              <Card className="elevated-card rounded-2xl p-6 border-l-4 border-l-primary">
                <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  <Zap className="h-4 w-4 text-primary" />
                  Action points — do this week
                </h3>
                <ul className="space-y-3">
                  {analysis.actionPoints.map((it, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-foreground/90 rounded-xl bg-secondary/40 p-3 transition-transform hover:translate-x-1"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{it}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.detectedSkills.length > 0 && (
              <Card className="elevated-card p-6 rounded-2xl">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                  Detected skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full px-3 py-1 border border-border bg-secondary/60">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                onClick={() => downloadReport(analysis)}
                className="rounded-full h-14 px-8 lime-glow"
              >
                <Download className="mr-2 h-5 w-5" /> Download PDF report
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Wondering <span className="text-primary italic font-normal">how</span> this works?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Read the 3-step explainer and answers to the questions we get most often.
          </p>
          <Link to="/how-it-works" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="rounded-full h-12 px-7 border border-border">
              Explore how it works <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-border/60 py-12 overflow-hidden">
        <div
          className="aurora"
          aria-hidden
          style={{
            width: 500,
            height: 300,
            bottom: -160,
            left: "50%",
            transform: "translateX(-50%)",
            background: "oklch(0.9 0.19 122 / 0.25)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-primary text-primary-foreground text-xs font-bold">R</span>
            <span>ResumeIQ · analyzed securely, never stored.</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
              Crafted by
            </span>
            <a
              href="#"
              className="group inline-flex items-center gap-2 font-display text-lg"
            >
              <span className="gradient-pan font-semibold tracking-tight">Ayush.K</span>
              <svg
                width="60"
                height="14"
                viewBox="0 0 60 14"
                className="text-primary/70"
                fill="none"
              >
                <path
                  d="M2 10 Q 15 2, 30 8 T 58 6"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  className="signature-draw"
                />
              </svg>
            </a>
          </div>

          <div className="font-mono text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} — built for job seekers
          </div>
        </div>
      </footer>

    </div>
  );
}

function ScoreCard({ analysis }: { analysis: ResumeAnalysis }) {
  const score = analysis.atsScore;
  const tone =
    score >= 80 ? "text-primary" : score >= 60 ? "text-chart-3" : "text-destructive";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs work" : "Weak";
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="elevated-card p-8 md:p-10 rounded-3xl">
      <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-center">
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" strokeWidth="8" className="stroke-secondary" fill="none" />
            <circle
              cx="80"
              cy="80"
              r="70"
              strokeWidth="8"
              className="stroke-primary"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-score">
            <div className={`font-display text-6xl font-semibold ${tone}`}>{score}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">/ 100</div>
          </div>
          <Badge className="mt-4 rounded-full bg-primary/15 text-primary border-primary/30 border">
            {label}
          </Badge>
        </div>
        <div className="space-y-5">
          <p className="text-base md:text-lg text-foreground/90 leading-relaxed">{analysis.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreBar label="Keywords" value={analysis.scoreBreakdown.keywords} />
            <ScoreBar label="Skills" value={analysis.scoreBreakdown.skills} />
            <ScoreBar label="Experience" value={analysis.scoreBreakdown.experience} />
            <ScoreBar label="Formatting" value={analysis.scoreBreakdown.formatting} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

function toneFor(value: number) {
  if (value >= 80) return { text: "text-primary", stroke: "stroke-primary", bg: "bg-primary", label: "Strong" };
  if (value >= 60) return { text: "text-chart-3", stroke: "stroke-chart-3", bg: "bg-chart-3", label: "Fair" };
  if (value >= 40) return { text: "text-chart-4", stroke: "stroke-chart-4", bg: "bg-chart-4", label: "Weak" };
  return { text: "text-destructive", stroke: "stroke-destructive", bg: "bg-destructive", label: "Critical" };
}

function MiniGauge({ value, label, hint }: { value: number; label: string; hint: string }) {
  const tone = toneFor(value);
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="group relative rounded-2xl border border-border bg-secondary/40 p-5 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} strokeWidth="8" className="stroke-border" fill="none" />
            <circle
              cx="50"
              cy="50"
              r={r}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={tone.stroke}
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <span className={`font-display text-2xl font-semibold ${tone.text}`}>{value}</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className={`mt-1 text-sm font-medium ${tone.text}`}>{tone.label}</div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{hint}</p>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ analysis }: { analysis: ResumeAnalysis }) {
  const b = analysis.scoreBreakdown;
  const missingCount = analysis.missingKeywords.length;
  const items = [
    { key: "formatting", value: b.formatting, label: "Formatting", hint: "Structure, headings, and ATS parseability." },
    { key: "keywords", value: b.keywords, label: "Keywords", hint: "Role-relevant terms recruiters search for." },
    { key: "experience", value: b.experience, label: "Experience match", hint: "Depth, seniority signals, and impact." },
    { key: "skills", value: b.skills, label: "Skills coverage", hint: "Breadth and relevance of listed skills." },
  ];

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <Card className="elevated-card rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Target className="h-4 w-4 text-primary" />
            ATS score breakdown
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Sub-scores show exactly where the resume passes or trips an ATS. Prioritize the lowest bars first.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs">
          <span className={`h-2 w-2 rounded-full ${missingCount > 0 ? "bg-destructive" : "bg-primary"}`} />
          <span className="text-muted-foreground">Missing skills</span>
          <span className="font-mono text-foreground">{missingCount}</span>
        </div>
      </div>

      {/* Radial gauges */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <MiniGauge key={it.key} value={it.value} label={it.label} hint={it.hint} />
        ))}
      </div>

      {/* Comparative bars */}
      <div className="mt-8 space-y-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Comparative view</div>
        {items.map((it) => {
          const tone = toneFor(it.value);
          const relPct = (it.value / max) * 100;
          return (
            <div key={it.key} className="grid grid-cols-[110px_1fr_48px] items-center gap-3">
              <span className="text-xs text-muted-foreground truncate">{it.label}</span>
              <div className="h-2.5 w-full rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${tone.bg} transition-[width] duration-[1200ms] ease-out`}
                  style={{ width: `${relPct}%` }}
                />
              </div>
              <span className={`text-right font-mono text-sm ${tone.text}`}>{it.value}</span>
            </div>
          );
        })}
      </div>

      {/* Missing skills preview */}
      {missingCount > 0 && (
        <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-destructive mb-3">
            <XCircle className="h-4 w-4" />
            Top missing skills / keywords
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.slice(0, 12).map((k) => (
              <Badge
                key={k}
                variant="secondary"
                className="rounded-full border border-destructive/30 bg-destructive/10 text-destructive px-3 py-1"
              >
                {k}
              </Badge>
            ))}
            {missingCount > 12 && (
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                +{missingCount - 12} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function KeywordCard({
  title,
  icon,
  keywords,
  empty,
  variant,
}: {
  title: string;
  icon: React.ReactNode;
  keywords: string[];
  empty: string;
  variant: "matched" | "missing";
}) {
  return (
    <Card className="elevated-card rounded-2xl p-6">
      <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
        <span className={variant === "matched" ? "text-primary" : "text-destructive"}>{icon}</span>
        {title}
      </h3>
      {keywords.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <Badge
              key={k}
              variant="secondary"
              className={
                variant === "matched"
                  ? "rounded-full px-3 py-1 bg-primary/10 text-primary border border-primary/30"
                  : "rounded-full px-3 py-1 bg-destructive/10 text-destructive border border-destructive/30"
              }
            >
              {k}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

function ListCard({
  title,
  icon,
  items,
  accent = "text-primary",
}: {
  title: string;
  icon?: React.ReactNode;
  items: string[];
  accent?: string;
}) {
  return (
    <Card className="elevated-card rounded-2xl p-6">
      <h3 className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-4">
        {icon && <span className={accent}>{icon}</span>}
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-sm text-foreground/90">
            <span className={`font-mono text-xs pt-0.5 ${accent}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
