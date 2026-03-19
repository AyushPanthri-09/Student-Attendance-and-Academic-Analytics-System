import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportPDF = async (elementId) => {

  const element = document.getElementById(elementId);

  const canvas = await html2canvas(element);

  const img = canvas.toDataURL("image/png");

  const pdf = new jsPDF("landscape");

  pdf.addImage(img, "PNG", 10, 10, 280, 150);

  pdf.save("analytics-report.pdf");

};