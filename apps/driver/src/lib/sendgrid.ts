import sg from '@sendgrid/mail';
import { buildReceiptPDF } from './pdf';

// Only set API key if it exists and is valid
if (
  process.env.SENDGRID_API_KEY &&
  process.env.SENDGRID_API_KEY.startsWith('SG.')
) {
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendReceipt(
  to: string,
  booking: {
    reference: string;
    totalGBP: number;
    currency: string;
    paidAt?: Date | null;
  }
) {
  try {
    if (
      !process.env.SENDGRID_API_KEY ||
      !process.env.SENDGRID_API_KEY.startsWith('SG.')
    ) {
      console.warn('SendGrid API key not configured, skipping email send');
      return;
    }

    const pdf = await buildReceiptPDF({
      company: {
        name: 'Speedy Van',
        address: '140 Charles Street, Glasgow City, G21 2QB',
        email: process.env.MAIL_FROM,
      },
      Booking: { ...booking, customerEmail: to },
    });
    await sg.send({
      to,
      from: process.env.MAIL_FROM!,
      subject: `Receipt — ${booking.reference}`,
      html: `<p>Thanks for your payment. Your booking <b>${booking.reference}</b> is confirmed.</p>`,
      attachments: [
        {
          content: pdf.toString('base64'),
          filename: `Receipt-${booking.reference}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
}

export async function notifyAdmin(reference: string, totalGBP: number) {
  try {
    if (
      !process.env.SENDGRID_API_KEY ||
      !process.env.SENDGRID_API_KEY.startsWith('SG.')
    ) {
      console.warn(
        'SendGrid API key not configured, skipping admin notification'
      );
      return;
    }

    await sg.send({
      to: process.env.MAIL_ADMIN!,
      from: process.env.MAIL_FROM!,
      subject: `New paid booking ${reference}`,
      text: `Paid booking ${reference}: £${(totalGBP / 100).toFixed(2)}`,
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}
