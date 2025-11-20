import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AnalysisData } from "@/components/AnalysisResult";

export const generateForensicReport = async (
  analysisData: AnalysisData,
  chartElements: { spectral: HTMLElement | null; temporal: HTMLElement | null }
) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFillColor(22, 47, 56); // Dark background
  pdf.rect(0, 0, pageWidth, 40, "F");
  
  pdf.setTextColor(23, 184, 217); // Primary color
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("AUDITR", margin, 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Forensic Audio Analysis Report", margin, 30);

  // Timestamp
  const timestamp = new Date().toLocaleString("en-US");
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generated: ${timestamp}`, pageWidth - margin, 30, { align: "right" });

  yPosition = 50;

  // Executive Summary Box
  const fillColor = analysisData.isAuthentic ? [34, 139, 87] : [220, 38, 38];
  pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, "F");
  
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    analysisData.isAuthentic ? "AUTHENTIC AUDIO" : "SYNTHETIC AUDIO DETECTED",
    pageWidth / 2,
    yPosition + 12,
    { align: "center" }
  );
  
  pdf.setFontSize(14);
  pdf.text(
    `Confidence: ${analysisData.confidence}%`,
    pageWidth / 2,
    yPosition + 22,
    { align: "center" }
  );

  yPosition += 40;

  // Analysis Details Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Analysis Details", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const splitDetails = pdf.splitTextToSize(
    analysisData.details,
    pageWidth - 2 * margin
  );
  pdf.text(splitDetails, margin, yPosition);
  yPosition += splitDetails.length * 5 + 10;

  // Source Attribution Section
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Source Attribution Analysis", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Type: ${analysisData.sourceAttribution.type}`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(`Vendor: ${analysisData.sourceAttribution.vendor}`, margin + 5, yPosition);
  yPosition += 6;
  pdf.text(
    `Likelihood: ${analysisData.sourceAttribution.likelihood}%`,
    margin + 5,
    yPosition
  );
  yPosition += 12;

  // Acoustic Environment Audit
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Acoustic Environment Audit", margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    `Quality Score: ${analysisData.acousticEnvironment.qualityScore}/10`,
    margin + 5,
    yPosition
  );
  yPosition += 6;
  pdf.text(
    `Background Noise: ${analysisData.acousticEnvironment.backgroundNoise}`,
    margin + 5,
    yPosition
  );
  yPosition += 10;

  if (analysisData.acousticEnvironment.artifacts.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Digital Artifacts:", margin + 5, yPosition);
    yPosition += 6;
    pdf.setFont("helvetica", "normal");
    
    analysisData.acousticEnvironment.artifacts.forEach((artifact) => {
      const splitArtifact = pdf.splitTextToSize(`• ${artifact}`, pageWidth - 2 * margin - 10);
      pdf.text(splitArtifact, margin + 10, yPosition);
      yPosition += splitArtifact.length * 5 + 2;
    });
    yPosition += 4;
  }

  if (analysisData.acousticEnvironment.manipulationPoints.length > 0) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Manipulation Points:", margin + 5, yPosition);
    yPosition += 6;
    pdf.setFont("helvetica", "normal");
    
    analysisData.acousticEnvironment.manipulationPoints.forEach((point) => {
      const splitPoint = pdf.splitTextToSize(`• ${point}`, pageWidth - 2 * margin - 10);
      pdf.text(splitPoint, margin + 10, yPosition);
      yPosition += splitPoint.length * 5 + 2;
    });
  }

  // New page for charts
  pdf.addPage();
  yPosition = margin;

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Visual Analysis", margin, yPosition);
  yPosition += 10;

  // Capture and add Spectral Analysis chart
  if (chartElements.spectral) {
    try {
      const spectralCanvas = await html2canvas(chartElements.spectral, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const spectralImgData = spectralCanvas.toDataURL("image/png");
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (spectralCanvas.height * imgWidth) / spectralCanvas.width;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Spectral Analysis", margin, yPosition);
      yPosition += 6;

      pdf.addImage(spectralImgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error("Error capturing spectral chart:", error);
    }
  }

  // Check if we need a new page for temporal chart
  if (yPosition > pageHeight - 80) {
    pdf.addPage();
    yPosition = margin;
  }

  // Capture and add Temporal Energy chart
  if (chartElements.temporal) {
    try {
      const temporalCanvas = await html2canvas(chartElements.temporal, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const temporalImgData = temporalCanvas.toDataURL("image/png");
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (temporalCanvas.height * imgWidth) / temporalCanvas.width;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Temporal Energy Distribution", margin, yPosition);
      yPosition += 6;

      pdf.addImage(temporalImgData, "PNG", margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error("Error capturing temporal chart:", error);
    }
  }

  // Footer on last page
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    "This report is generated by AUDITR AI-powered deepfake detection system.",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  pdf.text(
    `Report ID: ${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `AUDITR_Forensic_Report_${Date.now()}.pdf`;
  pdf.save(fileName);
};
