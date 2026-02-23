import { jsPDF } from 'jspdf';

export function generateMaterialPDF(material) {
  const doc = new jsPDF();
  const title = material.material_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  doc.setFontSize(20);
  doc.setTextColor(31, 78, 121);
  doc.text(title, 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date(material.generated_at).toLocaleString()}`, 20, 30);
  if (material.opportunity_title) {
    doc.text(`For: ${material.opportunity_title}`, 20, 37);
  }
  doc.text(`Word Count: ${material.word_count}`, 20, 44);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 48, 190, 48);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const contentLines = doc.splitTextToSize(material.content, 170);
  doc.text(contentLines, 20, 56);

  // Key Points on new page if needed
  if (material.key_points_highlighted?.length) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(31, 78, 121);
    doc.text('Key Points Highlighted', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let y = 32;
    material.key_points_highlighted.forEach(point => {
      const lines = doc.splitTextToSize(`• ${point}`, 165);
      doc.text(lines, 25, y);
      y += lines.length * 6 + 3;
    });

    if (material.suggestions_for_improvement) {
      y += 10;
      doc.setFontSize(14);
      doc.setTextColor(31, 78, 121);
      doc.text('Suggestions for Improvement', 20, y);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const sugLines = doc.splitTextToSize(material.suggestions_for_improvement, 170);
      doc.text(sugLines, 20, y + 10);
    }
  }

  return doc.output('arraybuffer');
}

export function generateEvaluationPDF(profile, opportunity, matchResult) {
  const doc = new jsPDF();
  const scoreColor = matchResult.compatibility_score >= 0.7 ? [34, 139, 34]
    : matchResult.compatibility_score >= 0.5 ? [255, 140, 0] : [220, 53, 69];

  doc.setFontSize(22);
  doc.setTextColor(31, 78, 121);
  doc.text('Opportunity Match Report', 105, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 32);

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 36, 190, 36);

  // Summary box
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Candidate: ${profile.name}`, 20, 46);
  doc.text(`Opportunity: ${opportunity.title}`, 20, 54);

  doc.setFontSize(16);
  doc.setTextColor(...scoreColor);
  doc.text(`Compatibility Score: ${(matchResult.compatibility_score * 100).toFixed(1)}%`, 20, 66);

  doc.setFontSize(13);
  doc.setTextColor(31, 78, 121);
  doc.text('Strengths', 20, 82);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const strengthLines = doc.splitTextToSize(matchResult.strengths, 170);
  doc.text(strengthLines, 20, 91);

  let y = 91 + strengthLines.length * 6 + 10;
  doc.setFontSize(13);
  doc.setTextColor(31, 78, 121);
  doc.text('Areas to Address', 20, y);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const gapLines = doc.splitTextToSize(matchResult.gaps, 170);
  doc.text(gapLines, 20, y + 9);

  y = y + 9 + gapLines.length * 6 + 10;
  doc.setFontSize(13);
  doc.setTextColor(31, 78, 121);
  doc.text('Recommendation', 20, y);
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const recLines = doc.splitTextToSize(matchResult.recommendation, 170);
  doc.text(recLines, 20, y + 9);

  return doc.output('arraybuffer');
}
