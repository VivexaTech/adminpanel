import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency, formatAmount } from './currency';

export const generateInvoicePDF = async (invoice) => {
  const doc = new jsPDF();
  
  // Invoice Header
  doc.setFontSize(20);
  doc.text('Vivexa Tech', 20, 20);
  doc.setFontSize(12);
  doc.text('Invoice', 20, 30);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 45);
  doc.text(`Date: ${invoice.createdAt?.toDate ? invoice.createdAt.toDate().toLocaleDateString() : 'N/A'}`, 20, 50);
  doc.text(`Client: ${invoice.clientId}`, 20, 55);
  
  // Services Table
  let yPos = 70;
  doc.setFontSize(10);
  doc.text('Services', 20, yPos);
  yPos += 10;
  
  if (invoice.services && invoice.services.length > 0) {
    invoice.services.forEach((service, index) => {
      const serviceTotal = (service.quantity || 0) * (service.price || 0);
      doc.text(
        `${service.name || 'Service'} - Qty: ${service.quantity || 0} - Price: ${formatCurrency(service.price || 0)} - Total: ${formatCurrency(serviceTotal)}`,
        20,
        yPos
      );
      yPos += 7;
    });
  }
  
  // Totals
  yPos += 5;
  doc.text(`Subtotal: ${formatCurrency((invoice.totalAmount || 0) - (invoice.tax || 0))}`, 150, yPos);
  yPos += 7;
  doc.text(`Tax: ${formatCurrency(invoice.tax || 0)}`, 150, yPos);
  yPos += 7;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ${formatCurrency(invoice.totalAmount || 0)}`, 150, yPos);
  
  // Save PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};
