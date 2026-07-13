import { jsPDF } from "jspdf";
import type { ResumeAnalysis } from "./analyze-resume.functions";

export function downloadReport(analysis: ResumeAnalysis, filename = "resume-ats-report.pdf") {
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

  const heading = (text: string, size = 16) => {
    ensureSpace(size + 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(20, 20, 30);
    doc.text(text, margin, y);
    y += size + 8;
  };

  const paragraph = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 50);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 15;
    }
    y += 4;
  };

  const bullets = (items: string[]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 50);
    for (const item of items) {
      const lines = doc.splitTextToSize(`• ${item}`, maxWidth - 12);
      for (const line of lines) {
        ensureSpace(16);
        doc.text(line, margin + 6, y);
        y += 15;
      }
    }
    y += 4;
  };

  heading("Resume ATS Analysis Report", 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 130);
  doc.text(new Date().toLocaleString(), margin, y);
  y += 20;

  heading(`Overall ATS Score: ${analysis.atsScore}/100`);
  paragraph(analysis.summary);

  heading("Score Breakdown");
  bullets([
    `Keywords: ${analysis.scoreBreakdown.keywords}/100`,
    `Formatting: ${analysis.scoreBreakdown.formatting}/100`,
    `Experience: ${analysis.scoreBreakdown.experience}/100`,
    `Skills: ${analysis.scoreBreakdown.skills}/100`,
  ]);

  if (analysis.matchedKeywords.length) {
    heading("Matched Keywords");
    paragraph(analysis.matchedKeywords.join(", "));
  }

  if (analysis.missingKeywords.length) {
    heading("Missing Keywords");
    paragraph(analysis.missingKeywords.join(", "));
  }

  if (analysis.detectedSkills.length) {
    heading("Detected Skills");
    paragraph(analysis.detectedSkills.join(", "));
  }

  if (analysis.strengths.length) {
    heading("Strengths");
    bullets(analysis.strengths);
  }

  if (analysis.improvements.length) {
    heading("Improvement Suggestions");
    bullets(analysis.improvements);
  }

  doc.save(filename);
}
