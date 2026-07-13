import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  LogOut,
  Trash2,
  Sparkles,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  listAnalyses,
  deleteAnalysis,
  type SavedAnalysisRow,
} from "@/lib/history.functions";
import type { ResumeAnalysis } from "@/lib/analyze-resume.functions";
import { downloadReport } from "@/lib/report";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — ResumeIQ" },
      { name: "description", content: "Every resume analysis you've run, saved to your account." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const router = useRouter();
  const list = useServerFn(listAnalyses);
  const remove = useServerFn(deleteAnalysis);
  const [rows, setRows] = useState<SavedAnalysisRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await list();
      setRows(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this analysis?")) return;
    try {
      await remove({ data: { id } });
      setRows((r) => (r ? r.filter((x) => x.id !== id) : r));
      if (openId === id) setOpenId(null);
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    router.navigate({ to: "/" });
  };

  const scoreColor = (n: number) =>
    n >= 80 ? "text-emerald-400" : n >= 60 ? "text-primary" : n >= 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">R</span>
            <span className="font-display text-lg font-semibold">Resume<span className="text-primary">IQ</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition">Analyzer</Link>
            <Link to="/builder" className="hover:text-foreground transition">AI Builder</Link>
            <Link to="/history" className="text-foreground">History</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[180px]">{email}</span>
            <Button size="sm" variant="ghost" onClick={onSignOut} className="rounded-full">
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to analyzer
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tighter">
              Your <span className="text-gradient">analysis history</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Every resume you've analyzed, saved automatically to your account.
            </p>
          </div>
          <Link to="/">
            <Button className="rounded-full lime-glow">
              <Sparkles className="mr-2 h-4 w-4" /> New analysis
            </Button>
          </Link>
        </div>

        <div className="mt-10 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading history...
            </div>
          )}

          {!loading && rows && rows.length === 0 && (
            <Card className="elevated-card p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">No analyses yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a resume on the analyzer page — it'll show up here automatically.
              </p>
              <Link to="/" className="mt-6 inline-block">
                <Button className="rounded-full">Run your first analysis</Button>
              </Link>
            </Card>
          )}

          {!loading &&
            rows?.map((row) => {
              const analysis = row.analysis as unknown as ResumeAnalysis;
              const open = openId === row.id;
              return (
                <Card key={row.id} className="elevated-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : row.id)}
                    className="w-full text-left p-5 flex items-center gap-4 hover:bg-secondary/30 transition"
                  >
                    <div className={`grid h-14 w-14 place-items-center rounded-xl border border-border font-display text-xl font-semibold ${scoreColor(row.ats_score)}`}>
                      {row.ats_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="font-medium truncate">{row.file_name}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                        {analysis?.detectedSkills?.length ? (
                          <Badge variant="secondary" className="rounded-full text-[10px]">
                            {analysis.detectedSkills.length} skills
                          </Badge>
                        ) : null}
                      </div>
                      {row.summary && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{row.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadReport(analysis, row.file_name.replace(/\.[^.]+$/, "") + "-report.pdf");
                        }}
                        className="rounded-full"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row.id);
                        }}
                        className="rounded-full text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-border/60 bg-background/40 p-6 space-y-5">
                      <Detail label="Score breakdown">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(analysis.scoreBreakdown ?? {}).map(([k, v]) => (
                            <div key={k} className="rounded-lg border border-border p-3">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground">{k}</p>
                              <p className="mt-1 font-display text-xl font-semibold">{v}</p>
                            </div>
                          ))}
                        </div>
                      </Detail>

                      {analysis.missingKeywords?.length > 0 && (
                        <Detail label="Missing keywords">
                          <div className="flex flex-wrap gap-1.5">
                            {analysis.missingKeywords.map((k) => (
                              <Badge key={k} variant="outline" className="rounded-full text-xs">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </Detail>
                      )}

                      {analysis.improvements?.length > 0 && (
                        <Detail label="Improvement suggestions">
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {analysis.improvements.map((s, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-primary">✦</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </Detail>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      {children}
    </div>
  );
}
