import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
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
  HelpCircle,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { extractTextFromFile } from "@/lib/extract-text";
import { analyzeResume, type ResumeAnalysis } from "@/lib/analyze-resume.functions";
import { downloadReport } from "@/lib/report";

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
  const [jobDescription, setJobDescription] = useState("");
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
        throw new Error("Could not extract enough text from this file. Try a different file.");
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
      const result = await analyze({ data: { resumeText, jobDescription } });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="border-b border-border/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            ResumeIQ
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            How it works
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" /> AI-powered ATS analysis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Get your resume past the bots.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your resume, paste the job description, and get an instant ATS score with
            missing keywords, skill gaps, and rewrite suggestions.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" /> Your resume
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              onClick={() => fileInput.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
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
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Extracting text…</span>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <div className="font-medium text-sm">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(resumeText.length / 1000).toFixed(1)}k characters extracted · click to
                    replace
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <div className="text-sm font-medium text-foreground">
                    Drop your resume here
                  </div>
                  <div className="text-xs">PDF, DOCX or TXT · up to 20MB</div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <label className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Target className="h-4 w-4" /> Job description{" "}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to tailor the analysis to a specific role…"
              className="min-h-[180px] resize-none"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Adding a job description dramatically improves keyword matching.
            </p>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!resumeText || isAnalyzing || isExtracting}
            className="min-w-[220px]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Analyze resume
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <section id="results" className="mt-16 space-y-6">
            <ScoreCard analysis={analysis} />

            <div className="grid gap-6 md:grid-cols-2">
              <KeywordCard
                title="Matched keywords"
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                keywords={analysis.matchedKeywords}
                empty="No keywords matched yet."
                variant="matched"
              />
              <KeywordCard
                title="Missing keywords"
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                keywords={analysis.missingKeywords}
                empty="Great — nothing important missing."
                variant="missing"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ListCard
                title="Strengths"
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                items={analysis.strengths}
              />
              <ListCard
                title="Improvement suggestions"
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                items={analysis.improvements}
              />
            </div>

            {analysis.detectedSkills.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Detected skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedSkills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex justify-center pt-4">
              <Button size="lg" variant="outline" onClick={() => downloadReport(analysis)}>
                <Download className="mr-2 h-4 w-4" /> Download PDF report
              </Button>
            </div>
          </section>
        )}

        <section className="mt-20 text-center">
          <HelpCircle className="mx-auto h-6 w-6 text-muted-foreground mb-3" />
          <h2 className="text-2xl font-semibold tracking-tight">Curious how it works?</h2>
          <p className="mt-2 text-muted-foreground">
            Read our short explainer and FAQ.
          </p>
          <Link to="/how-it-works" className="mt-4 inline-block">
            <Button variant="secondary">Explore how it works</Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/40 mt-16 py-8 text-center text-sm text-muted-foreground">
        Built with ResumeIQ · Your resume is analyzed securely and never stored.
      </footer>
    </div>
  );
}

function ScoreCard({ analysis }: { analysis: ResumeAnalysis }) {
  const score = analysis.atsScore;
  const tone =
    score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs work" : "Weak";

  return (
    <Card className="p-8">
      <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <div className="text-center">
          <div className={`text-6xl font-bold ${tone}`}>{score}</div>
          <div className="text-sm text-muted-foreground mt-1">out of 100</div>
          <Badge className="mt-3" variant="secondary">
            {label}
          </Badge>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
          <div className="grid gap-3 sm:grid-cols-2">
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
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
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
    <Card className="p-6">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        {icon} {title}
      </h3>
      {keywords.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <Badge
              key={k}
              variant={variant === "matched" ? "secondary" : "outline"}
              className={
                variant === "missing" ? "border-red-500/40 text-red-600 dark:text-red-400" : ""
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
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        {icon} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-foreground/90 flex gap-2">
            <span className="text-muted-foreground mt-1">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
