# Speedy Van Invoice Download Features

## Overview

This guide explains the professional invoice download functionality that allows customers to download detailed invoices after successful payment.

## Invoice Features

### ✅ **Professional Invoice Design**
- **Company Branding**: Includes Speedy Van logo and company details
- **Professional Layout**: Clean, organized format suitable for business use
- **Complete Information**: All booking and payment details included

### ✅ **Invoice Content**
- **Header Section**:
  - Company name, address, phone, email, website
  - Speedy Van logo
  - Professional formatting

- **Invoice Details**:
  - Invoice number (INV-{bookingId})
  - Invoice date and due date
  - Booking ID reference

- **Customer Information**:
  - Customer name, email, phone, address
  - Complete billing details

- **Service Details**:
  - Service description
  - Quantity and unit price
  - Total calculation

- **Payment Summary**:
  - Subtotal amount
  - VAT calculation (20%)
  - Total amount including VAT

- **Payment Information**:
  - Payment method (Stripe)
  - Payment status (Paid)
  - Transaction ID
  - Payment date

- **Terms & Conditions**:
  - Payment terms
  - Cancellation policy
  - Legal requirements

## Technical Implementation

### 1. API Endpoint
**Location**: `/api/invoice/generate`

**Methods**:
- `POST`: Generate invoice with full data
- `GET`: Generate sample invoice for testing

**Request Body (POST)**:
```json
{
  "bookingId": "SV12345678",
  "amount": 150.00,
  "customerData": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "07700 900 123",
    "address": "123 Main Street, London, SW1A 1AA"
  },
  "bookingDetails": {
    "description": "Professional moving service",
    "date": "15/01/2024",
    "service": "Speedy Van Move Service"
  }
}
```

**Response**:
```json
{
  "success": true,
  "invoice": {
    "content": {
      "header": { /* company details */ },
      "invoice": { /* invoice details */ },
      "customer": { /* customer details */ },
      "services": [ /* service items */ ],
      "totals": { /* payment totals */ },
      "payment": { /* payment info */ },
      "terms": [ /* terms & conditions */ ]
    },
    "filename": "invoice-SV12345678.pdf",
    "bookingId": "SV12345678",
    "amount": 150.00,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Client-Side Implementation
**Location**: `src/app/booking/success/page.tsx`

**Features**:
- Automatic invoice generation after payment
- Professional PDF formatting
- Direct download functionality
- Error handling and user feedback

### 3. PDF Generation
**Current Implementation**: Text-based PDF simulation
**Production Options**:
- **jsPDF**: Client-side PDF generation
- **PDFKit**: Server-side PDF generation
- **Puppeteer**: HTML to PDF conversion
- **DocRaptor**: Professional PDF service

## User Experience

### 1. After Payment Success
1. **User completes payment** via Stripe
2. **Redirected to success page** (`/booking/success`)
3. **Invoice download button** appears automatically
4. **One-click download** of professional invoice

### 2. Invoice Download Process
1. **Click "Download Invoice"** button
2. **API call** to generate invoice
3. **PDF creation** with all details
4. **Automatic download** to user's device
5. **Success notification** with invoice details

### 3. Invoice Features
- **Professional Format**: Business-ready PDF
- **Complete Details**: All booking information
- **VAT Calculation**: Automatic 20% VAT
- **Payment Proof**: Transaction details included
- **Re-downloadable**: Can be downloaded multiple times

## Testing

### 1. Test Page
**URL**: `/test-invoice`

**Features**:
- Test invoice generation with custom data
- API testing functionality
- Sample invoice preview
- Download testing

### 2. Test Scenarios
```bash
# Test invoice generation
curl -X POST http://localhost:3000/api/invoice/generate \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "SV12345678",
    "amount": 150.00,
    "customerData": {
      "name": "Test Customer",
      "email": "test@example.com"
    }
  }'

# Test API endpoint
curl http://localhost:3000/api/invoice/generate?bookingId=SV12345678&amount=150.00
```

### 3. Manual Testing
1. **Complete booking flow** to payment
2. **Make payment** via Stripe
3. **Download invoice** from success page
4. **Verify invoice content** and format

## Production Implementation

### 1. Install PDF Library
```bash
# For client-side PDF generation
npm install jspdf

# For server-side PDF generation
npm install pdfkit puppeteer
```

### 2. Update API Route
Replace text-based generation with actual PDF:

```typescript
import jsPDF from 'jspdf';

// Generate actual PDF
const doc = new jsPDF();
doc.setFontSize(20);
doc.text('SPEEDY VAN - INVOICE', 105, 20, { align: 'center' });
// ... add all invoice content
const pdfBlob = doc.output('blob');
```

### 3. Enhanced Features
- **Email Integration**: Send invoice via email
- **Storage**: Save invoices to cloud storage
- **Digital Signatures**: Add digital signatures
- **Multi-language**: Support multiple languages
- **Custom Templates**: Branded invoice templates

## Security Considerations

### 1. Data Protection
- **Customer Data**: Secure handling of personal information
- **Payment Details**: PCI DSS compliance
- **Invoice Storage**: Encrypted storage if saved

### 2. Access Control
- **Authentication**: Verify user owns the booking
- **Authorization**: Check payment status before download
- **Rate Limiting**: Prevent abuse of invoice generation

### 3. Audit Trail
- **Download Logs**: Track invoice downloads
- **Access History**: Monitor invoice access
- **Security Events**: Log security-related activities

## Error Handling

### 1. Common Errors
- **Network Issues**: Retry mechanism for failed downloads
- **Invalid Data**: Validation of invoice data
- **PDF Generation**: Fallback to text format
- **Storage Issues**: Alternative download methods

### 2. User Feedback
- **Loading States**: Show progress during generation
- **Error Messages**: Clear error descriptions
- **Retry Options**: Easy retry functionality
- **Support Contact**: Help for persistent issues

## Future Enhancements

### 1. Advanced Features
- **Email Integration**: Automatic email delivery
- **Cloud Storage**: Save to Google Drive, Dropbox
- **Digital Signatures**: Legally binding signatures
- **Multi-format**: PDF, Word, Excel formats

### 2. Business Features
- **Invoice Management**: Customer invoice portal
- **Payment Tracking**: Link invoices to payments
- **Tax Reporting**: Automated tax calculations
- **Analytics**: Invoice download analytics

### 3. Integration Features
- **Accounting Software**: QuickBooks, Xero integration
- **CRM Integration**: Customer relationship management
- **Email Marketing**: Follow-up emails
- **SMS Notifications**: Download confirmations

## Support

### 1. Troubleshooting
- **Check API Status**: Verify invoice generation API
- **Browser Compatibility**: Test in different browsers
- **File Permissions**: Ensure download permissions
- **Network Issues**: Check internet connectivity

### 2. Common Issues
- **Download Blocked**: Browser security settings
- **File Corrupted**: Regenerate invoice
- **Wrong Amount**: Verify booking data
- **Missing Details**: Check customer information

### 3. Contact Information
- **Technical Support**: developers@speedyvan.co.uk
- **Customer Support**: support@speedyvan.co.uk
- **Emergency**: 0800 123 4567

The invoice system is designed to provide a professional, reliable, and user-friendly experience for customers while maintaining security and compliance standards.
