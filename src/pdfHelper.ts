import { jsPDF } from "jspdf";
import { StudyData } from "./types";

export function generatePDF(title: string, data: StudyData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageHeight = 297; // A4 height in mm
  let y = 25;

  function drawHeader() {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115); // gray-500
    doc.text("AI Academic Study Deck & Revision Guide", 20, 12);
    doc.line(20, 14, 190, 14);
  }

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 25;
      drawHeader();
    }
  }

  // Cover and Main Info
  drawHeader();
  
  // Slate color for title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(title, 170);
  doc.text(titleLines, 20, y);
  y += titleLines.length * 7 + 4;

  // Metadata subtitle
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | College Revision Assistant`, 20, y);
  y += 12;

  // SECTION 1: REVISION NOTES
  if (data.revisionNotes && data.revisionNotes.length > 0) {
    checkPageBreak(25);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("SECTION 1: STUDY & REVISION POINTS", 20, y);
    doc.line(20, y + 2, 70, y + 2); // Underline header
    y += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85); // slate-700

    data.revisionNotes.forEach((note, index) => {
      const sentence = `[ ] ${note}`;
      const lines = doc.splitTextToSize(sentence, 168);
      const height = lines.length * 6 + 1;
      checkPageBreak(height);
      doc.text(lines, 20, y);
      y += height;
    });
    y += 12;
  }

  // SECTION 2: KEY ACADEMIC CONCEPTS
  if (data.keyConcepts && data.keyConcepts.length > 0) {
    checkPageBreak(25);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("SECTION 2: KEY CONCEPTS & DEFINITIONS", 20, y);
    doc.line(20, y + 2, 75, y + 2);
    y += 8;

    data.keyConcepts.forEach((concept, index) => {
      // Estimate heights: Term (5mm), Definition (split lines), Explanation (split lines) + padding
      const termLines = doc.splitTextToSize(`${index + 1}. ${concept.term}`, 165);
      const defLines = doc.splitTextToSize(`Definition: ${concept.definition}`, 165);
      const expLines = doc.splitTextToSize(`Explanation: ${concept.explanation}`, 165);
      
      const neededHeight = (termLines.length * 5) + (defLines.length * 5) + (expLines.length * 5) + 10;
      checkPageBreak(neededHeight);

      // Term title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(termLines, 20, y);
      y += termLines.length * 5 + 1;

      // Definition
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(defLines, 22, y);
      y += defLines.length * 5 + 1;

      // Explanation
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139); // slate-400
      doc.text(expLines, 22, y);
      y += expLines.length * 5 + 5;
    });
    y += 8;
  }

  // SECTION 3: FLASHCARDS
  if (data.flashcards && data.flashcards.length > 0) {
    checkPageBreak(25);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text("SECTION 3: REVISION FLASHCARDS", 20, y);
    doc.line(20, y + 2, 65, y + 2);
    y += 8;

    data.flashcards.forEach((card, index) => {
      const qLines = doc.splitTextToSize(`Question ${index + 1}: ${card.question}`, 168);
      const aLines = doc.splitTextToSize(`Answer: ${card.answer}`, 168);
      const neededHeight = (qLines.length * 5) + (aLines.length * 5) + 8;
      
      checkPageBreak(neededHeight);

      // Draw a thin separating line
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.line(20, y, 190, y);
      y += 4;

      // Question
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(qLines, 20, y);
      y += qLines.length * 5 + 1;

      // Answer
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(aLines, 20, y);
      y += aLines.length * 5 + 4;
    });
  }

  // Page Numbers Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 156, 169); // gray-400
    doc.text(`Page ${i} of ${pageCount}`, 100, 287, { align: "center" });
  }

  // Download trigger
  const escapedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`Study_Guide_${escapedTitle}.pdf`);
}
