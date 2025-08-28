import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { applicationData } = await request.json();

    if (!applicationData) {
      return NextResponse.json(
        { error: 'Application data is required' },
        { status: 400 }
      );
    }

    // Generate comprehensive email content for admin notification
    const emailContent = generateDriverApplicationEmail(applicationData);
    
    // In a real implementation, you would send this email using a service like SendGrid, Mailgun, or AWS SES
    // For now, we'll return the email content and log it
    
    console.log('📧 Driver Application Email Notification Generated:', {
      to: 'admin@speedyvan.co.uk',
      subject: emailContent.subject,
      applicationId: applicationData.applicationId,
      driverName: applicationData.driverName,
    });

    // Create email record in database for tracking
    const emailRecord = await prisma.adminNotification.create({
      data: {
        type: 'driver_application_email_sent',
        title: 'Driver Application Email Sent',
        message: `Email notification sent for ${applicationData.driverName}`,
        priority: 'medium',
        data: {
          applicationId: applicationData.applicationId,
          driverName: applicationData.driverName,
          emailSent: true,
          sentAt: new Date().toISOString(),
        },
        actionUrl: `/admin/drivers/applications/${applicationData.applicationId}`,
        actorId: applicationData.userId,
        actorRole: 'system',
        isRead: false,
        createdAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Driver application email notification generated successfully',
      emailId: emailRecord.id,
      emailContent: {
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }
    });

  } catch (error) {
    console.error('❌ Error generating driver application email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email notification' },
      { status: 500 }
    );
  }
}

function generateDriverApplicationEmail(applicationData: any) {
  const subject = `🚨 NEW DRIVER APPLICATION: ${applicationData.driverName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Driver Application - Speedy Van</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; background: #f8fafc; }
        .footer { background: #64748b; color: white; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
        .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
        .highlight { color: #dc2626; font-weight: bold; }
        .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .document-status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-complete { background: #dcfce7; color: #166534; }
        .status-incomplete { background: #fef3c7; color: #92400e; }
        .status-missing { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚐 Speedy Van</h1>
          <h2>NEW DRIVER APPLICATION REQUIRES IMMEDIATE ATTENTION</h2>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h3>⚠️ URGENT: New Driver Application Submitted</h3>
            <p>A new driver application has been submitted and requires your immediate review. This application contains sensitive information and documents that need verification.</p>
          </div>
          
          <div class="section">
            <h3>👤 Driver Information</h3>
            <p><strong>Name:</strong> ${applicationData.driverName}</p>
            <p><strong>Email:</strong> ${applicationData.email}</p>
            <p><strong>Phone:</strong> ${applicationData.phone}</p>
            <p><strong>Date of Birth:</strong> ${new Date(applicationData.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>National Insurance Number:</strong> ${applicationData.nationalInsuranceNumber}</p>
          </div>
          
          <div class="section">
            <h3>📍 Address Information</h3>
            <p><strong>Address:</strong> ${applicationData.address.line1}</p>
            ${applicationData.address.line2 ? `<p><strong>Address Line 2:</strong> ${applicationData.address.line2}</p>` : ''}
            <p><strong>City:</strong> ${applicationData.address.city}</p>
            <p><strong>Postcode:</strong> ${applicationData.address.postcode}</p>
            <p><strong>County:</strong> ${applicationData.address.county}</p>
          </div>
          
          <div class="section">
            <h3>🚗 Driving Information</h3>
            <p><strong>License Number:</strong> ${applicationData.driving.licenseNumber}</p>
            <p><strong>License Expiry:</strong> ${new Date(applicationData.driving.licenseExpiry).toLocaleDateString()}</p>
            <p><strong>License Front Image:</strong> ${applicationData.driving.licenseFrontImage ? '✅ Uploaded' : '❌ Missing'}</p>
            <p><strong>License Back Image:</strong> ${applicationData.driving.licenseBackImage ? '✅ Uploaded' : '❌ Missing'}</p>
          </div>
          
          <div class="section">
            <h3>🛡️ Insurance Information</h3>
            <p><strong>Provider:</strong> ${applicationData.insurance.provider}</p>
            <p><strong>Policy Number:</strong> ${applicationData.insurance.policyNumber}</p>
            <p><strong>Expiry:</strong> ${new Date(applicationData.insurance.expiry).toLocaleDateString()}</p>
            <p><strong>Insurance Document:</strong> ${applicationData.insurance.document ? '✅ Uploaded' : '❌ Missing'}</p>
          </div>
          
          <div class="section">
            <h3>🏦 Banking Information</h3>
            <p><strong>Bank Name:</strong> ${applicationData.banking.bankName}</p>
            <p><strong>Account Holder:</strong> ${applicationData.banking.accountHolderName}</p>
            <p><strong>Sort Code:</strong> ${applicationData.banking.sortCode}</p>
            <p><strong>Account Number:</strong> ${applicationData.banking.accountNumber}</p>
          </div>
          
          <div class="section">
            <h3>📋 Right to Work</h3>
            <p><strong>Share Code:</strong> ${applicationData.rightToWork.shareCode}</p>
            <p><strong>Right to Work Document:</strong> ${applicationData.rightToWork.document ? '✅ Uploaded' : '❌ Missing'}</p>
          </div>
          
          <div class="section">
            <h3>🚨 Emergency Contact</h3>
            <p><strong>Name:</strong> ${applicationData.emergencyContact.name}</p>
            <p><strong>Phone:</strong> ${applicationData.emergencyContact.phone}</p>
            <p><strong>Relationship:</strong> ${applicationData.emergencyContact.relationship}</p>
          </div>
          
          <div class="section">
            <h3>✅ Terms Agreement</h3>
            <p><strong>Agree to Terms:</strong> ${applicationData.terms.agreeToTerms ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Agree to Data Processing:</strong> ${applicationData.terms.agreeToDataProcessing ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Agree to Background Check:</strong> ${applicationData.terms.agreeToBackgroundCheck ? '✅ Yes' : '❌ No'}</p>
          </div>
          
          <div class="section">
            <h3>📊 Application Summary</h3>
            <p><strong>Application ID:</strong> ${applicationData.applicationId}</p>
            <p><strong>Submitted:</strong> ${new Date(applicationData.applicationDate).toLocaleString()}</p>
            <p><strong>Status:</strong> <span class="highlight">${applicationData.status}</span></p>
          </div>
          
          <div class="urgent">
            <h3>🎯 Required Actions</h3>
            <ol>
              <li><strong>Review all uploaded documents</strong> - Verify authenticity and completeness</li>
              <li><strong>Check compliance</strong> - Ensure all documents are valid and not expired</li>
              <li><strong>Background verification</strong> - Verify provided information</li>
              <li><strong>Make decision</strong> - Approve, reject, or request additional information</li>
            </ol>
          </div>
          
          <div class="section">
            <h3>🔗 Quick Actions</h3>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://speedyvan.co.uk'}/admin/drivers/applications/${applicationData.applicationId}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Application Now</a></p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://speedyvan.co.uk'}/admin/drivers/applications" style="background: #64748b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View All Applications</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated notification from the Speedy Van Driver Application System</p>
          <p>Speedy Van Ltd | 07901846297 | support@speedyvan.co.uk</p>
          <p>© 2024 Speedy Van. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    NEW DRIVER APPLICATION REQUIRES IMMEDIATE ATTENTION
    
    A new driver application has been submitted and requires your immediate review.
    
    DRIVER INFORMATION:
    - Name: ${applicationData.driverName}
    - Email: ${applicationData.email}
    - Phone: ${applicationData.phone}
    - Date of Birth: ${new Date(applicationData.dateOfBirth).toLocaleDateString()}
    - National Insurance Number: ${applicationData.nationalInsuranceNumber}
    
    ADDRESS:
    - Address: ${applicationData.address.line1}
    ${applicationData.address.line2 ? `- Address Line 2: ${applicationData.address.line2}` : ''}
    - City: ${applicationData.address.city}
    - Postcode: ${applicationData.address.postcode}
    - County: ${applicationData.address.county}
    
    DRIVING INFORMATION:
    - License Number: ${applicationData.driving.licenseNumber}
    - License Expiry: ${new Date(applicationData.driving.licenseExpiry).toLocaleDateString()}
    - License Front Image: ${applicationData.driving.licenseFrontImage ? 'Uploaded' : 'Missing'}
    - License Back Image: ${applicationData.driving.licenseBackImage ? 'Uploaded' : 'Missing'}
    
    INSURANCE:
    - Provider: ${applicationData.insurance.provider}
    - Policy Number: ${applicationData.insurance.policyNumber}
    - Expiry: ${new Date(applicationData.insurance.expiry).toLocaleDateString()}
    - Document: ${applicationData.insurance.document ? 'Uploaded' : 'Missing'}
    
    BANKING:
    - Bank: ${applicationData.banking.bankName}
    - Account Holder: ${applicationData.banking.accountHolderName}
    - Sort Code: ${applicationData.banking.sortCode}
    - Account Number: ${applicationData.banking.accountNumber}
    
    RIGHT TO WORK:
    - Share Code: ${applicationData.rightToWork.shareCode}
    - Document: ${applicationData.rightToWork.document ? 'Uploaded' : 'Missing'}
    
    EMERGENCY CONTACT:
    - Name: ${applicationData.emergencyContact.name}
    - Phone: ${applicationData.emergencyContact.phone}
    - Relationship: ${applicationData.emergencyContact.relationship}
    
    TERMS AGREEMENT:
    - Agree to Terms: ${applicationData.terms.agreeToTerms ? 'Yes' : 'No'}
    - Agree to Data Processing: ${applicationData.terms.agreeToDataProcessing ? 'Yes' : 'No'}
    - Agree to Background Check: ${applicationData.terms.agreeToBackgroundCheck ? 'Yes' : 'No'}
    
    APPLICATION DETAILS:
    - Application ID: ${applicationData.applicationId}
    - Submitted: ${new Date(applicationData.applicationDate).toLocaleString()}
    - Status: ${applicationData.status}
    
    REQUIRED ACTIONS:
    1. Review all uploaded documents
    2. Check compliance and validity
    3. Verify background information
    4. Make approval decision
    
    LINKS:
    - Review Application: ${process.env.NEXT_PUBLIC_APP_URL || 'https://speedyvan.co.uk'}/admin/drivers/applications/${applicationData.applicationId}
    - All Applications: ${process.env.NEXT_PUBLIC_APP_URL || 'https://speedyvan.co.uk'}/admin/drivers/applications
    
    Speedy Van Ltd | 07901846297 | support@speedyvan.co.uk
  `;
  
  return {
    subject,
    html,
    text
  };
}
