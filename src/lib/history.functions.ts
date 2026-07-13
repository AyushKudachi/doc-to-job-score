import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SaveInput = z.object({
  fileName: z.string().min(1).max(200),
  atsScore: z.number().min(0).max(100),
  summary: z.string().optional().default(""),
  analysis: z.unknown(),
});

const IdInput = z.object({ id: z.string().uuid() });

export type SavedAnalysisRow = {
  id: string;
  file_name: string;
  ats_score: number;
  summary: string | null;
  analysis: unknown;
  created_at: string;
};

export const saveAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("resume_analyses")
      .insert({
        user_id: userId,
        file_name: data.fileName,
        ats_score: Math.round(data.atsScore),
        summary: data.summary || null,
        analysis: data.analysis as never,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SavedAnalysisRow[]> => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("resume_analyses")
      .select("id, file_name, ats_score, summary, analysis, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as SavedAnalysisRow[];
  });

export const getAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }): Promise<SavedAnalysisRow | null> => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("resume_analyses")
      .select("id, file_name, ats_score, summary, analysis, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as SavedAnalysisRow) ?? null;
  });

export const deleteAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IdInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("resume_analyses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
