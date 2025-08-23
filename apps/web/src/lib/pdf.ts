import PDFDocument from "pdfkit";

export async function buildReceiptPDF(input: {
  company: { name: string; address?: string; email?: string };
  Booking: { reference: string; totalGBP: number; currency: string; paidAt?: Date | null; customerEmail?: string };
}) {
  const doc = new PDFDocument({ margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>(res => doc.on("end", () => res(Buffer.concat(chunks as any))));

  const amount = (input.Booking.totalGBP / 100).toFixed(2);

  doc.fontSize(18).text(`${input.company.name} — Receipt`, { align: "left" }).moveDown();
  doc.fontSize(12).text(`Booking: ${input.Booking.reference}`);
  doc.text(`Date: ${new Date(input.Booking.paidAt ?? Date.now()).toLocaleString()}`);
  doc.text(`Customer: ${input.Booking.customerEmail ?? "-"}`);
  doc.moveDown();
  doc.text(`Amount: ${input.Booking.currency.toUpperCase()} £${amount}`, { continued: false });
  if (input.company.address) doc.moveDown().text(input.company.address);
  if (input.company.email) doc.text(input.company.email);
  doc.end();
  return done;
}

export async function buildInvoicePDF(input: {
  company: { name: string; address?: string; email?: string; phone?: string; vatNumber?: string };
  invoice: {
    invoiceNumber: string;
    orderRef: string;
    date: Date;
    dueDate?: Date;
    totalGBP: number;
    currency: string;
    status: string;
    paidAt?: Date | null;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    vanSize?: string;
    crewSize?: number;
    extras?: any;
    priceBreakdown?: any;
  };
}) {
  const doc = new PDFDocument({ margin: 48 });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>(res => doc.on("end", () => res(Buffer.concat(chunks as any))));

  const amount = (input.invoice.totalGBP / 100).toFixed(2);
  const invoiceDate = input.invoice.date.toLocaleDateString('en-GB');
  const dueDate = input.invoice.dueDate?.toLocaleDateString('en-GB') || invoiceDate;

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' }).moveDown(0.5);
  
  // Company and Invoice Details
  doc.fontSize(12).font('Helvetica');
  
  // Left column - Company details
  doc.text(`${input.company.name}`, { continued: false });
  if (input.company.address) doc.text(input.company.address);
  if (input.company.email) doc.text(input.company.email);
  if (input.company.phone) doc.text(input.company.phone);
  if (input.company.vatNumber) doc.text(`VAT: ${input.company.vatNumber}`);
  
  // Right column - Invoice details
  const invoiceDetailsY = doc.y;
  doc.text('', { continued: false });
  doc.text(`Invoice Number: ${input.invoice.invoiceNumber}`, { align: 'right' });
  doc.text(`Order Reference: ${input.invoice.orderRef}`, { align: 'right' });
  doc.text(`Date: ${invoiceDate}`, { align: 'right' });
  doc.text(`Due Date: ${dueDate}`, { align: 'right' });
  doc.text(`Status: ${input.invoice.status.toUpperCase()}`, { align: 'right' });
  
  // Reset position for customer details
  doc.y = Math.max(doc.y, invoiceDetailsY + 80);
  doc.moveDown();

  // Customer Details
  doc.fontSize(14).font('Helvetica-Bold').text('Bill To:', { underline: true }).moveDown(0.5);
  doc.fontSize(12).font('Helvetica');
  doc.text(input.invoice.customerName);
  doc.text(input.invoice.customerEmail);
  if (input.invoice.customerPhone) doc.text(input.invoice.customerPhone);
  doc.moveDown();

  // Service Details
  doc.fontSize(14).font('Helvetica-Bold').text('Service Details:', { underline: true }).moveDown(0.5);
  doc.fontSize(12).font('Helvetica');
  if (input.invoice.pickupAddress) doc.text(`From: ${input.invoice.pickupAddress}`);
  if (input.invoice.dropoffAddress) doc.text(`To: ${input.invoice.dropoffAddress}`);
  if (input.invoice.vanSize) doc.text(`Vehicle: ${input.invoice.vanSize}`);
  if (input.invoice.crewSize) doc.text(`Crew: ${input.invoice.crewSize} people`);
  doc.moveDown();

  // Items Table
  doc.fontSize(14).font('Helvetica-Bold').text('Items:', { underline: true }).moveDown(0.5);
  
  // Table header
  const tableTop = doc.y;
  const itemX = 48;
  const amountX = 400;
  
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Description', itemX);
  doc.text('Amount', amountX);
  doc.moveDown(0.5);
  
  // Separator line
  doc.moveTo(itemX, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  
  // Main service item
  doc.fontSize(10).font('Helvetica');
  doc.text('Moving Service', itemX);
  doc.text(`£${amount}`, amountX);
  doc.moveDown(0.5);
  
  // Add extras if any
  if (input.invoice.extras) {
    const extras = input.invoice.extras as any;
    if (extras.assembly) {
      doc.text('Assembly Service', itemX);
      doc.text('Included', amountX);
      doc.moveDown(0.5);
    }
    if (extras.packingMaterials) {
      doc.text('Packing Materials', itemX);
      doc.text('Included', amountX);
      doc.moveDown(0.5);
    }
    if (extras.heavyItems) {
      doc.text('Heavy Items Handling', itemX);
      doc.text('Included', amountX);
      doc.moveDown(0.5);
    }
  }
  
  // Total line
  doc.moveTo(itemX, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica-Bold');
  doc.text('Total:', itemX);
  doc.text(`£${amount}`, amountX);
  doc.moveDown();

  // Payment Information
  if (input.invoice.paidAt) {
    doc.fontSize(12).font('Helvetica');
    doc.text(`Paid on: ${input.invoice.paidAt.toLocaleDateString('en-GB')}`);
  }
  
  doc.moveDown(2);
  
  // Footer
  doc.fontSize(10).font('Helvetica');
  doc.text('Thank you for choosing our services!', { align: 'center' });
  doc.text('For any questions, please contact our support team.', { align: 'center' });
  
  doc.end();
  return done;
}


