import { jsPDF } from "jspdf";
import type { BuiltResume } from "./build-resume.functions";

export function downloadBuiltResume(resume: BuiltResume, filename?: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (str: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; gap?: number } = {}) => {
    const { size = 11, bold = false, color = [40, 40, 50], indent = 0, gap = 4 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(str, maxWidth - indent);
    for (const line of lines) {
      ensureSpace(size + 4);
      doc.text(line, margin + indent, y);
      y += size + 3;
    }
    y += gap;
  };

  const rule = () => {
    ensureSpace(8);
    doc.setDrawColor(200, 200, 210);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  };

  // Header
  text(resume.fullName.toUpperCase(), { size: 22, bold: true, color: [15, 20, 30], gap: 2 });
  text(resume.targetRole, { size: 12, color: [90, 90, 110], gap: 6 });

  const contactParts = [resume.contact.email, resume.contact.phone, resume.contact.location, ...(resume.contact.links || [])].filter(Boolean);
  if (contactParts.length) text(contactParts.join("  •  "), { size: 10, color: [100, 100, 120], gap: 8 });
  rule();

  // Summary
  text("SUMMARY", { size: 11, bold: true, color: [15, 20, 30], gap: 4 });
  text(resume.summary);
  rule();

  // Skills
  if (resume.skills?.length) {
    text("SKILLS", { size: 11, bold: true, color: [15, 20, 30], gap: 4 });
    text(resume.skills.join(" · "));
    rule();
  }

  // Experience
  if (resume.experience?.length) {
    text("EXPERIENCE", { size: 11, bold: true, color: [15, 20, 30], gap: 6 });
    for (const job of resume.experience) {
      text(`${job.role} — ${job.company}`, { size: 12, bold: true, color: [15, 20, 30], gap: 1 });
      const meta = [job.location, job.period].filter(Boolean).join("  •  ");
      if (meta) text(meta, { size: 10, color: [110, 110, 125], gap: 4 });
      for (const b of job.bullets) text(`• ${b}`, { indent: 10, gap: 1 });
      y += 6;
    }
    rule();
  }

  // Projects
  if (resume.projects?.length) {
    text("PROJECTS", { size: 11, bold: true, color: [15, 20, 30], gap: 4 });
    for (const p of resume.projects) {
      text(p.name, { size: 12, bold: true, gap: 1 });
      text(p.description, { gap: 2 });
      if (p.tech?.length) text(`Tech: ${p.tech.join(", ")}`, { size: 10, color: [110, 110, 125], gap: 4 });
    }
    rule();
  }

  // Education
  if (resume.education?.length) {
    text("EDUCATION", { size: 11, bold: true, color: [15, 20, 30], gap: 4 });
    for (const e of resume.education) {
      text(`${e.degree} — ${e.school}`, { size: 12, bold: true, gap: 1 });
      const meta = [e.period, e.details].filter(Boolean).join("  •  ");
      if (meta) text(meta, { size: 10, color: [110, 110, 125] });
    }
    rule();
  }

  // Achievements
  if (resume.achievements?.length) {
    text("ACHIEVEMENTS", { size: 11, bold: true, color: [15, 20, 30], gap: 4 });
    for (const a of resume.achievements) text(`• ${a}`, { indent: 10, gap: 1 });
  }

  doc.save(filename || `${resume.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
}
