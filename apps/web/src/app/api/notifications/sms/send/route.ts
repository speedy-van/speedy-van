import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for SMS sending
const smsSendSchema = z.object({
  to: z.string().min(10).max(15),
  message: z.string().min(1).max(1600), // Allow for multi-part messages
  sender: z.string().optional().default('SpeedyVan'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, sender } = smsSendSchema.parse(body);

    // Get The SMS Works credentials from environment
    const apiKey = process.env.THESMSWORKS_KEY;
    const apiSecret = process.env.THESMSWORKS_SECRET;
    const baseUrl = 'https://api.thesmsworks.co.uk/v1';

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'SMS Works API credentials not configured' },
        { status: 500 }
      );
    }

    // Prepare SMS data for The SMS Works
    const smsData = {
      to: to,
      body: message,
      sender: sender,
    };

    // Send SMS via The SMS Works
    const response = await fetch(`${baseUrl}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify(smsData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SMS Works error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send SMS', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      messageId: result.id,
      message: 'SMS sent successfully',
      creditsUsed: result.creditsUsed || 1,
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Batch SMS sending for multiple recipients
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = z.object({
      messages: z.array(z.object({
        to: z.string().min(10).max(15),
        message: z.string().min(1).max(1600),
        sender: z.string().optional().default('SpeedyVan'),
      })),
    }).parse(body);

    // Get The SMS Works credentials from environment
    const apiKey = process.env.THESMSWORKS_KEY;
    const apiSecret = process.env.THESMSWORKS_SECRET;
    const baseUrl = 'https://api.thesmsworks.co.uk/v1';

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'SMS Works API credentials not configured' },
        { status: 500 }
      );
    }

    // Prepare batch SMS data for The SMS Works
    const batchData = {
      messages: messages.map(msg => ({
        to: msg.to,
        body: msg.message,
        sender: msg.sender,
      })),
    };

    // Send batch SMS via The SMS Works
    const response = await fetch(`${baseUrl}/batch/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify(batchData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('SMS Works batch error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send batch SMS', details: errorData },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      message: 'Batch SMS sent successfully',
      totalCreditsUsed: result.totalCreditsUsed || messages.length,
      results: result.results,
    });
  } catch (error) {
    console.error('Batch SMS sending error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
