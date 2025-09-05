import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bookingData, customerEmail } = await request.json();

    if (!bookingData || !customerEmail) {
      return NextResponse.json(
        { error: 'Booking data and customer email are required' },
        { status: 400 }
      );
    }

    // This would integrate with an email service like SendGrid, Mailgun, or AWS SES
    // For demo purposes, we'll return mock email data

    const emailData = generateMockEmailConfirmation(bookingData, customerEmail);

    return NextResponse.json(emailData);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

function generateMockEmailConfirmation(
  bookingData: any,
  customerEmail: string
): any {
  const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const sentAt = new Date().toISOString();

  return {
    emailId: emailId,
    status: 'sent',
    sentAt: sentAt,
    to: customerEmail,
    subject: `Booking Confirmation - ${bookingData.bookingReference || 'SV-DEMO'}`,
    template: 'booking-confirmation',
    metadata: {
      bookingReference: bookingData.bookingReference || 'SV-DEMO',
      customerName: bookingData.customer?.name || 'Demo Customer',
      moveDate: bookingData.date || '2024-01-01',
      moveTime: bookingData.time || '10:00',
      totalAmount: 0,
      crewSize: bookingData.crewSize || 2,
    },
    content: {
      html: generateEmailHTML(bookingData),
      text: generateEmailText(bookingData),
    },
  };
}

function generateEmailHTML(bookingData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - Speedy Van</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8fafc; }
        .footer { background: #64748b; color: white; padding: 20px; text-align: center; font-size: 12px; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .highlight { color: #2563eb; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚐 Speedy Van</h1>
          <h2>Booking Confirmed!</h2>
        </div>
        
        <div class="content">
          <p>Dear ${bookingData.customer?.name || 'Customer'},</p>
          
          <p>Thank you for choosing Speedy Van for your move! Your booking has been confirmed and we're excited to help make your move smooth and stress-free.</p>
          
          <div class="booking-details">
            <h3>📋 Booking Details</h3>
            <p><strong>Booking Reference:</strong> <span class="highlight">${bookingData.bookingReference || 'SV-DEMO'}</span></p>
            <p><strong>Move Date:</strong> ${new Date(bookingData.date).toLocaleDateString()}</p>
            <p><strong>Move Time:</strong> ${bookingData.time}</p>
            <p><strong>Crew Size:</strong> ${bookingData.crewSize} Mover${bookingData.crewSize > 1 ? 's' : ''}</p>
            <p><strong>Booking Confirmed</strong></p>
          </div>
          
          <div class="booking-details">
            <h3>📍 Move Details</h3>
            <p><strong>Pickup Address:</strong><br>
            ${bookingData.pickupAddress?.line1}<br>
            ${bookingData.pickupAddress?.city}, ${bookingData.pickupAddress?.postcode}</p>
            
            <p><strong>Drop-off Address:</strong><br>
            ${bookingData.dropoffAddress?.line1}<br>
            ${bookingData.dropoffAddress?.city}, ${bookingData.dropoffAddress?.postcode}</p>
          </div>
          
          <h3>📅 What Happens Next?</h3>
          <ol>
            <li>You'll receive a call from our team 24 hours before your move to confirm details</li>
            <li>On move day, our crew will arrive at the scheduled time</li>
            <li>You can track your move progress in real-time through our tracking system</li>
            <li>We'll handle everything with care and professionalism</li>
          </ol>
          
          <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us:</p>
          
          <p><strong>📞 Customer Support:</strong> 07901846297<br>
          <strong>📧 Email:</strong> support@speedyvan.co.uk<br>
          <strong>🆘 Emergency (24/7):</strong> 07700 900 123</p>
        </div>
        
        <div class="footer">
          <p>Speedy Van Ltd | 123 Moving Street, London, SW1A 1AA</p>
          <p>© 2024 Speedy Van. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(bookingData: any): string {
  return `
    Speedy Van - Booking Confirmation
    
    Dear ${bookingData.customer?.name || 'Customer'},
    
    Thank you for choosing Speedy Van for your move! Your booking has been confirmed.
    
    BOOKING DETAILS:
    - Booking Reference: ${bookingData.bookingReference || 'SV-DEMO'}
    - Move Date: ${new Date(bookingData.date).toLocaleDateString()}
    - Move Time: ${bookingData.time}
    - Crew Size: ${bookingData.crewSize} Mover${bookingData.crewSize > 1 ? 's' : ''}
    - Booking Confirmed
    
    MOVE DETAILS:
    - Pickup: ${bookingData.pickupAddress?.line1}, ${bookingData.pickupAddress?.city}, ${bookingData.pickupAddress?.postcode}
    - Drop-off: ${bookingData.dropoffAddress?.line1}, ${bookingData.dropoffAddress?.city}, ${bookingData.dropoffAddress?.postcode}
    
    WHAT HAPPENS NEXT:
    1. You'll receive a call 24 hours before your move
    2. Our crew will arrive at the scheduled time
    3. You can track progress in real-time
    4. We'll handle everything with care
    
    CONTACT US:
    - Customer Support: 07901846297
    - Email: support@speedyvan.co.uk
    - Emergency (24/7): 07700 900 123
    
    Thank you for choosing Speedy Van!
    
    Speedy Van Ltd
    123 Moving Street, London, SW1A 1AA
  `;
}

// In a real implementation, you would use an email service like this:
/*
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { bookingData, customerEmail } = await request.json();
    
    const msg = {
      to: customerEmail,
      from: 'noreply@speedyvan.co.uk',
      subject: `Booking Confirmation - ${bookingData.bookingReference}`,
      html: generateEmailHTML(bookingData),
      text: generateEmailText(bookingData),
      templateId: 'd-xxxxxxxxxxxxxxxxxxxxxxxx', // SendGrid template ID
      dynamicTemplateData: {
        customerName: bookingData.customer?.name,
        bookingReference: bookingData.bookingReference,
        moveDate: bookingData.date,
        moveTime: bookingData.time,
        totalAmount: 0,
        // ... other dynamic data
      },
    };
    
    await sgMail.send(msg);
    
    return NextResponse.json({
      status: 'sent',
      emailId: `email_${Date.now()}`,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
*/
