import { jsPDF } from "jspdf";

import { technologyOwnershipToolkit as toolkit } from "../content/technology-ownership-toolkit";

export function downloadTechnologyOwnershipToolkitPdf(): void {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 18;

  let cursorY = 20;

  const ensureSpace = (requiredHeight: number): void => {
    if (cursorY + requiredHeight > pageHeight - bottomMargin) {
      pdf.addPage();
      cursorY = 20;
    }
  };

  const addParagraph = (
    text: string,
    options?: {
      fontSize?: number;
      bold?: boolean;
      indent?: number;
      spacingAfter?: number;
    },
  ): void => {
    const fontSize = options?.fontSize ?? 10;
    const indent = options?.indent ?? 0;
    const spacingAfter = options?.spacingAfter ?? 4;

    pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
    pdf.setFontSize(fontSize);

    const availableWidth = contentWidth - indent;
    const lines = pdf.splitTextToSize(text, availableWidth);
    const lineHeight = fontSize * 0.45;
    const blockHeight = lines.length * lineHeight + spacingAfter;

    ensureSpace(blockHeight);

    pdf.text(lines, margin + indent, cursorY);
    cursorY += blockHeight;
  };

  const addHeading = (text: string, level: 1 | 2 = 1): void => {
    const fontSize = level === 1 ? 17 : 12;
    const spacingBefore = level === 1 ? 5 : 3;
    const spacingAfter = level === 1 ? 5 : 3;

    ensureSpace(fontSize * 0.8 + spacingBefore + spacingAfter);

    cursorY += spacingBefore;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(fontSize);

    const lines = pdf.splitTextToSize(text, contentWidth);
    pdf.text(lines, margin, cursorY);

    cursorY += lines.length * fontSize * 0.45 + spacingAfter;
  };

  const addBulletList = (items: readonly string[]): void => {
    for (const item of items) {
      addParagraph(`- ${item}`, {
        fontSize: 9,
        indent: 3,
        spacingAfter: 2,
      });
    }
    cursorY += 2;
  };

  // Cover heading
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(23);
  pdf.text(pdf.splitTextToSize(toolkit.title, contentWidth), margin, cursorY);

  cursorY += 14;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const subtitleLines = pdf.splitTextToSize(toolkit.subtitle, contentWidth);
  pdf.text(subtitleLines, margin, cursorY);

  cursorY += subtitleLines.length * 6 + 5;

  addHeading(toolkit.introduction.heading, 1);
  addParagraph(toolkit.introduction.description, { fontSize: 10 });
  addParagraph(toolkit.introduction.principle, {
    fontSize: 10,
    bold: true,
    spacingAfter: 6,
  });

  // Technology ownership lifecycle
  addHeading("The Technology Ownership Lifecycle", 1);

  for (const stage of toolkit.lifecycle) {
    addHeading(stage.title, 2);
    addParagraph(stage.objective, { fontSize: 9 });

    addParagraph("Checklist", { fontSize: 10, bold: true, spacingAfter: 2 });
    addBulletList(stage.checklist);

    addParagraph("Evidence to retain", {
      fontSize: 10,
      bold: true,
      spacingAfter: 2,
    });
    addBulletList(stage.evidence);

    addParagraph("Ownership question", {
      fontSize: 10,
      bold: true,
      spacingAfter: 2,
    });
    addParagraph(stage.ownershipQuestion, {
      fontSize: 9,
      spacingAfter: 5,
    });
  }

  // Production readiness
  addHeading("Production Readiness Checklist", 1);
  addBulletList(toolkit.readinessChecklist);

  // Evidence record
  addHeading("Technology Ownership Evidence Record", 1);
  addParagraph(
    "Use this record to capture the technical evidence associated with a work item.",
    { fontSize: 9 },
  );
  addBulletList(toolkit.evidenceRecord);

  // Review questions
  addHeading("Ownership Review Questions", 1);
  addBulletList(toolkit.reviewQuestions);

  // Ownership boundaries
  addHeading("Ownership Boundaries", 1);

  addParagraph("Product Ownership", {
    fontSize: 10,
    bold: true,
    spacingAfter: 2,
  });
  addParagraph(toolkit.ownershipBoundaries.productOwnership, {
    fontSize: 9,
  });

  addParagraph("Technology Ownership", {
    fontSize: 10,
    bold: true,
    spacingAfter: 2,
  });
  addParagraph(toolkit.ownershipBoundaries.technologyOwnership, {
    fontSize: 9,
  });

  // Closing principle
  addHeading("The Ownership Principle", 1);
  addParagraph(toolkit.slogan, {
    fontSize: 11,
    bold: true,
    spacingAfter: 6,
  });

  // Page numbers
  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
      `Technology Ownership Toolkit | Page ${page} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 9,
      { align: "center" },
    );
  }

  pdf.save("technology-ownership-toolkit.pdf");
}
