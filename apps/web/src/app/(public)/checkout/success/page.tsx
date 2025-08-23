'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentVerification {
  paid: boolean;
  bookingCode: string | null;
  sessionId: string | null;
  status: string;
}

export default function Success() {
  const router = useRouter();
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const url = new URL(window.location.href);
        const sessionId = url.searchParams.get("session_id");
        const bookingCode = url.searchParams.get("booking");
        
        if (!sessionId) {
          setError('No session ID found');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        setVerification(data);
        setLoading(false);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Payment verification failed');
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  const downloadReceipt = () => {
    if (verification?.bookingCode) {
      window.open(`/api/receipt/${verification.bookingCode}`, '_blank');
    }
  };

  const trackBooking = () => {
    if (verification?.bookingCode) {
      router.push(`/track?booking=${verification.bookingCode}`);
    } else {
      router.push('/track');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', color: '#374151' }}>
          Verifying your payment...
        </div>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid #e5e7eb', 
          borderTop: '3px solid #10b981', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '48px auto', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: '#fef2f2', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <span style={{ fontSize: '32px' }}>❌</span>
        </div>
        <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
          Payment Verification Failed
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          {error}
        </p>
        <button 
          onClick={() => router.push('/book')}
          style={{
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Book Again
        </button>
      </div>
    );
  }

  if (!verification?.paid) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '48px auto', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: '#fef3c7', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <span style={{ fontSize: '32px' }}>⏳</span>
        </div>
        <h1 style={{ color: '#92400e', marginBottom: '16px' }}>
          Payment Processing
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Your payment is being processed. If you completed 3D Secure authentication, 
          this will update shortly. Please wait a moment and refresh the page.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Refresh Page
          </button>
          <button 
            onClick={() => router.push('/track')}
            style={{
              background: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Track Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '48px auto', 
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Success Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: '#d1fae5', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <span style={{ fontSize: '40px' }}>✅</span>
        </div>
        <h1 style={{ 
          color: '#065f46', 
          marginBottom: '8px',
          fontSize: '32px',
          fontWeight: 'bold'
        }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          Your booking has been confirmed and payment processed
        </p>
      </div>

      {/* Booking Details Card */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '24px', 
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h2 style={{ 
          color: '#1f2937', 
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          📋 Booking Information
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <strong style={{ color: '#374151' }}>Booking reference:</strong>
            <div style={{ 
              color: '#10b981', 
              fontSize: '18px',
              fontWeight: 'bold',
              marginTop: '4px'
            }}>
              {verification.bookingCode}
            </div>
          </div>
          <div>
            <strong style={{ color: '#374151' }}>Payment Status:</strong>
            <div style={{ 
              color: '#059669', 
              fontSize: '16px',
              fontWeight: '500',
              marginTop: '4px'
            }}>
              ✅ Paid
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <button 
          onClick={trackBooking}
          style={{
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '16px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📍 Track Your Move
        </button>
        
        <button 
          onClick={downloadReceipt}
          style={{
            background: '#ffffff',
            color: '#374151',
            border: '2px solid #d1d5db',
            padding: '16px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📄 Download Receipt
        </button>
      </div>

      {/* Next Steps */}
      <div style={{ 
        background: '#eff6ff', 
        padding: '24px', 
        borderRadius: '12px',
        border: '1px solid #bfdbfe'
      }}>
        <h3 style={{ 
          color: '#1e40af', 
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          🚀 What's Next?
        </h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#3b82f6', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              1
            </div>
            <span style={{ color: '#1e40af' }}>
              You'll receive a confirmation email with your booking details
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#3b82f6', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              2
            </div>
            <span style={{ color: '#1e40af' }}>
              Our team will contact you to confirm pickup time and details
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              background: '#3b82f6', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              3
            </div>
            <span style={{ color: '#1e40af' }}>
              Track your move in real-time on the day of service
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ 
        marginTop: '32px',
        textAlign: 'center',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>
          Need help? Contact our support team:
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '14px' }}>
          <span style={{ color: '#374151' }}>
            📧 <strong>support@speedyvan.com</strong>
          </span>
          <span style={{ color: '#374151' }}>
            📞 <strong>0800 123 4567</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

