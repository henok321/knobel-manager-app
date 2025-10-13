import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
}

export const createPDF = (options: PDFOptions): jsPDF => {
  const { title, subtitle, orientation = 'portrait' } = options;
  const doc = new jsPDF({ orientation });

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 22);

  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 30);
  }

  return doc;
};

export const addPageHeader = (
  doc: jsPDF,
  title: string,
  pageNumber?: number,
) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 10);

  if (pageNumber) {
    const pageText = `Page ${pageNumber}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont('helvetica', 'normal');
    doc.text(pageText, pageWidth - 14, 10, { align: 'right' });
  }
};
