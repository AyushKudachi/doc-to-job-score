import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Loader2,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  RotateCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { extractTextFromFile } from "@/lib/extract-text";
import { analyzeResume, type ResumeAnalysis } from "@/lib/analyze-resume.functions";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Resumes — ResumeIQ" },
      {
        name: "description",
        content:
          "Upload two resume versions and see ATS scores, keyword changes, and skill gains side-by-side.",
      },
      { property: "og:title", content: "Compare Resumes — ResumeIQ" },
      {
        property: "og:description",
        content: "Score two resumes side-by-side and see exactly what changed.",
      },
    ],
  }),
  component: ComparePage,
});

type Slot = "A" | "B";

interface SlotState {
  file: File | null;
  text: string;
  extracting: boolean;
  analyzing: boolean;
  analysis: ResumeAnalysis | null;
  error: string | null;
}

const initialSlot: SlotState = {
  file: null,
  text: "",
  extracting: false,
  analyzing: false,
  analysis: null,
  error: null,
};

function ComparePage() {
  const analyze = useServerFn(analyzeResume);
  const [a, setA] = useState<SlotState>(initialSlot);
  const [b, setB] = useState<SlotState>(initialSlot);

  const setSlot = (slot: Slot, updater: (s: SlotState) => SlotState) =>
    slot === "A" ? setA(updater) : setB(updater);

  const handleFile = useCallback(
    async (slot: Slot, file: File) => {
      setSlot(slot, (s) => ({
        ...s,
        file,
        extracting: true,
        analysis: null,
        error: null,
      }));
      try {
        const text = await extractTextFromFile(file);
        setSlot(slot, (s) => ({ ...s, text, extracting: false }));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to read file");
        setSlot(slot, (s) => ({ ...s, extracting: false }));
      }
    },
    [],
  );

  const runOne = useCallback(
    async (slot: Slot, text: string) => {
      setSlot(slot, (s) => ({ ...s, analyzing: true, analysis: null, error: null }));
      try {
        const res = await analyze({ data: { resumeText: text } });
        setSlot(slot, (s) => ({ ...s, analyzing: false, analysis: res }));
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Analysis failed";
        setSlot(slot, (s) => ({ ...s, analyzing: false, error: msg }));
        return false;
      }
    },
    [analyze],
  );

  const runCompare = async () => {
    if (!a.text || !b.text) {
      toast.error("Please upload both resumes first");
      return;
    }
    const [okA, okB] = await Promise.all([runOne("A", a.text), runOne("B", b.text)]);
    if (okA && okB) {
      toast.success("Comparison ready");
      setTimeout(() => {
        document.getElementById("compare-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else if (okA || okB) {
      toast.warning("One resume failed — retry the failed side");
    } else {
      toast.error("Both analyses failed");
    }
  };

  const retry = (slot: Slot) => {
    const text = slot === "A" ? a.text : b.text;
    if (!text) return;
    void runOne(slot, text);
  };


  const busy = a.extracting || b.extracting || a.analyzing || b.analyzing;
  const ready = Boolean(a.text && b.text);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/">
              <Button size="sm" variant="ghost" className="rounded-full">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="max-w-2xl">
          <Badge className="rounded-full bg-primary/15 text-primary border-primary/30 border mb-4">
            Compare mode
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Two resumes. <span className="text-primary">One clear winner.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
            Upload two versions of your resume and see ATS scores, keyword shifts, and skill
            changes side-by-side.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <UploadSlot slot="A" state={a} onFile={handleFile} />
          <UploadSlot slot="B" state={b} onFile={handleFile} />
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={runCompare}
            disabled={!ready || busy}
            className="rounded-full h-14 px-8 lime-glow"
          >
            {a.analyzing || b.analyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Comparing…
              </>
            ) : (
              <>
                Compare resumes <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {a.analysis && b.analysis && (
          <div id="compare-results" className="mt-16 space-y-8">
            <WinnerBanner a={a} b={b} />
            <ScoreCompare a={a.analysis} b={b.analysis} labelA={a.file?.name ?? "Resume A"} labelB={b.file?.name ?? "Resume B"} />
            <BreakdownCompare a={a.analysis} b={b.analysis} />
            <DiffLists a={a.analysis} b={b.analysis} />
          </div>
        )}
      </section>
    </div>
  );
}

function UploadSlot({
  slot,
  state,
  onFile,
}: {
  slot: Slot;
  state: SlotState;
  onFile: (slot: Slot, file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(slot, f);
  };

  return (
    <Card className="elevated-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary font-mono text-sm font-semibold">
            {slot}
          </span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Resume {slot}
          </span>
        </div>
        {state.file && (
          <Badge variant="secondary" className="rounded-full text-xs max-w-[180px] truncate">
            <FileText className="h-3 w-3 mr-1 shrink-0" />
            <span className="truncate">{state.file.name}</span>
          </Badge>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(slot, f);
          }}
        />
        {state.extracting ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Reading file…</span>
          </div>
        ) : state.text ? (
          <div className="flex flex-col items-center gap-2 text-foreground">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium">Ready to compare</div>
            <div className="text-xs text-muted-foreground">
              {state.text.length.toLocaleString()} characters
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-6 w-6" />
            <div className="font-medium text-foreground">Drop resume {slot}</div>
            <div className="text-xs">PDF, DOCX or TXT</div>
          </div>
        )}
      </div>
    </Card>
  );
}

function WinnerBanner({ a, b }: { a: SlotState; b: SlotState }) {
  const scoreA = a.analysis!.atsScore;
  const scoreB = b.analysis!.atsScore;
  const diff = scoreB - scoreA;
  const winner: Slot | "tie" = diff === 0 ? "tie" : diff > 0 ? "B" : "A";
  const winnerName =
    winner === "tie"
      ? "It's a tie"
      : winner === "A"
        ? a.file?.name ?? "Resume A"
        : b.file?.name ?? "Resume B";

  return (
    <Card className="elevated-card rounded-3xl p-6 md:p-8 border-l-4 border-l-primary">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15 text-primary">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Winner
            </div>
            <div className="font-display text-2xl md:text-3xl font-semibold truncate max-w-[60vw]">
              {winnerName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DeltaChip delta={diff} suffix=" pts" size="lg" />
        </div>
      </div>
    </Card>
  );
}

function ScoreCompare({
  a,
  b,
  labelA,
  labelB,
}: {
  a: ResumeAnalysis;
  b: ResumeAnalysis;
  labelA: string;
  labelB: string;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ScorePanel slot="A" label={labelA} analysis={a} accent="text-chart-2" />
      <ScorePanel slot="B" label={labelB} analysis={b} accent="text-primary" />
    </div>
  );
}

function ScorePanel({
  slot,
  label,
  analysis,
  accent,
}: {
  slot: Slot;
  label: string;
  analysis: ResumeAnalysis;
  accent: string;
}) {
  const c = 2 * Math.PI * 60;
  const offset = c - (analysis.atsScore / 100) * c;
  return (
    <Card className="elevated-card rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary font-mono text-sm font-semibold">
          {slot}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[60%] text-right">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
            <circle cx="70" cy="70" r="60" strokeWidth="8" className="stroke-border" fill="none" />
            <circle
              cx="70"
              cy="70"
              r="60"
              strokeWidth="8"
              className={accent.replace("text-", "stroke-")}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className={`font-display text-4xl font-semibold ${accent}`}>
              {analysis.atsScore}
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2 text-sm">
          <SubRow label="Keywords" value={analysis.scoreBreakdown.keywords} />
          <SubRow label="Skills" value={analysis.scoreBreakdown.skills} />
          <SubRow label="Experience" value={analysis.scoreBreakdown.experience} />
          <SubRow label="Formatting" value={analysis.scoreBreakdown.formatting} />
        </div>
      </div>
      <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{analysis.summary}</p>
    </Card>
  );
}

function SubRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <Progress value={value} className="h-1" />
    </div>
  );
}

function BreakdownCompare({ a, b }: { a: ResumeAnalysis; b: ResumeAnalysis }) {
  const rows = [
    { key: "atsScore", label: "Overall ATS", av: a.atsScore, bv: b.atsScore },
    { key: "keywords", label: "Keywords", av: a.scoreBreakdown.keywords, bv: b.scoreBreakdown.keywords },
    { key: "skills", label: "Skills", av: a.scoreBreakdown.skills, bv: b.scoreBreakdown.skills },
    { key: "experience", label: "Experience", av: a.scoreBreakdown.experience, bv: b.scoreBreakdown.experience },
    { key: "formatting", label: "Formatting", av: a.scoreBreakdown.formatting, bv: b.scoreBreakdown.formatting },
  ];

  return (
    <Card className="elevated-card rounded-3xl p-6 md:p-8">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
        Score-by-score comparison
      </h3>
      <div className="space-y-4">
        {rows.map((r) => {
          const delta = r.bv - r.av;
          const max = Math.max(r.av, r.bv, 1);
          return (
            <div key={r.key} className="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr_80px] items-center gap-3">
              <div className="text-sm font-medium">{r.label}</div>
              <MiniBar value={r.av} max={max} tone="bg-chart-2" label={`A · ${r.av}`} />
              <MiniBar value={r.bv} max={max} tone="bg-primary" label={`B · ${r.bv}`} />
              <div className="text-right">
                <DeltaChip delta={delta} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function MiniBar({ value, max, tone, label }: { value: number; max: number; tone: string; label: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 h-2.5 rounded-full bg-secondary/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${tone} transition-[width] duration-[1000ms] ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-16 shrink-0 text-right">
        {label}
      </span>
    </div>
  );
}

function DeltaChip({ delta, suffix = "", size = "sm" }: { delta: number; suffix?: string; size?: "sm" | "lg" }) {
  const tone =
    delta > 0
      ? "bg-primary/15 text-primary border-primary/30"
      : delta < 0
        ? "bg-destructive/15 text-destructive border-destructive/30"
        : "bg-secondary text-muted-foreground border-border";
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const cls =
    size === "lg"
      ? "px-4 py-2 text-base rounded-full"
      : "px-2.5 py-1 text-xs rounded-full";
  return (
    <span className={`inline-flex items-center gap-1 border font-mono ${tone} ${cls}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3 w-3"} />
      {delta > 0 ? "+" : ""}
      {delta}
      {suffix}
    </span>
  );
}

function diffSets(oldArr: string[], newArr: string[]) {
  const norm = (s: string) => s.toLowerCase().trim();
  const oldMap = new Map(oldArr.map((s) => [norm(s), s]));
  const newMap = new Map(newArr.map((s) => [norm(s), s]));
  const added: string[] = [];
  const removed: string[] = [];
  const kept: string[] = [];
  for (const [k, v] of newMap) (oldMap.has(k) ? kept : added).push(v);
  for (const [k, v] of oldMap) if (!newMap.has(k)) removed.push(v);
  return { added, removed, kept };
}

function DiffLists({ a, b }: { a: ResumeAnalysis; b: ResumeAnalysis }) {
  const kw = diffSets(a.matchedKeywords, b.matchedKeywords);
  const skills = diffSets(a.detectedSkills, b.detectedSkills);
  const missing = diffSets(a.missingKeywords, b.missingKeywords);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DiffCard
        title="Keyword changes"
        added={kw.added}
        removed={kw.removed}
        addLabel="Gained keywords"
        removeLabel="Lost keywords"
      />
      <DiffCard
        title="Skill changes"
        added={skills.added}
        removed={skills.removed}
        addLabel="Added skills"
        removeLabel="Dropped skills"
      />
      <DiffCard
        title="Missing keywords — fixed"
        added={missing.removed}
        removed={missing.added}
        addLabel="Now covered in B"
        removeLabel="New gaps in B"
        invert
      />
      <Card className="elevated-card rounded-2xl p-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Action points from newer version
        </h3>
        {b.actionPoints.length ? (
          <ul className="space-y-3">
            {b.actionPoints.map((it, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground/90">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{it}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No further action points.</p>
        )}
      </Card>
    </div>
  );
}

function DiffCard({
  title,
  added,
  removed,
  addLabel,
  removeLabel,
  invert,
}: {
  title: string;
  added: string[];
  removed: string[];
  addLabel: string;
  removeLabel: string;
  invert?: boolean;
}) {
  const addTone = invert
    ? "bg-primary/10 text-primary border-primary/30"
    : "bg-primary/10 text-primary border-primary/30";
  const removeTone = invert
    ? "bg-destructive/10 text-destructive border-destructive/30"
    : "bg-destructive/10 text-destructive border-destructive/30";
  return (
    <Card className="elevated-card rounded-2xl p-6">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        <DiffGroup label={addLabel} items={added} tone={addTone} sign="+" />
        <DiffGroup label={removeLabel} items={removed} tone={removeTone} sign="−" />
      </div>
    </Card>
  );
}

function DiffGroup({
  label,
  items,
  tone,
  sign,
}: {
  label: string;
  items: string[];
  tone: string;
  sign: string;
}) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-2">
        {label} <span className="font-mono">({items.length})</span>
      </div>
      {items.length ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <Badge
              key={it}
              variant="secondary"
              className={`rounded-full border px-2.5 py-1 text-xs ${tone}`}
            >
              <span className="mr-1 font-mono">{sign}</span>
              {it}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">None</p>
      )}
    </div>
  );
}
