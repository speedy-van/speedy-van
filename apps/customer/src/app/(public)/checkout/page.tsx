'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BookingDetails {
  id: string;
  reference: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceMeters: number;
  totalGBP: number;
  lockedAmountPence: number;
  currency: string;
  lockExpiresAt: string;
  vanSize?: string;
  crewSize?: number;
  timeSlot?: string;
  scheduledAt?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const bookingId = searchParams.get('booking');
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    // Fetch booking details first
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Booking not found');
        }
        const bookingData = await response.json();
        setBooking(bookingData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Booking:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [searchParams]);

  const createCheckoutSession = async () => {
    if (!booking) return;

    try {
      setLoading(true);
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  const formatCurrency = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatDistance = (meters: number) => {
    const miles = (meters / 1609.34).toFixed(1);
    return `${miles} miles`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot: string) => {
    const timeMap: Record<string, string> = {
      am: 'Morning (8AM - 12PM)',
      pm: 'Afternoon (12PM - 5PM)',
      evening: 'Evening (5PM - 8PM)',
      night: 'Night (8PM - 8AM)',
    };
    return timeMap[timeSlot] || timeSlot;
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ fontSize: '18px', color: '#374151' }}>
          Loading your booking details...
        </div>
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
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
      <div
        style={{
          maxWidth: '600px',
          margin: '48px auto',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
          Payment Error
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/book')}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '48px auto',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
          Booking Not Found
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          The booking you're looking for doesn't exist or has expired.
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
            fontSize: '14px',
          }}
        >
          Book New Service
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '48px auto',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '24px',
        }}
      >
        <h1
          style={{
            color: '#1f2937',
            marginBottom: '8px',
            fontSize: '28px',
            fontWeight: 'bold',
          }}
        >
          Complete Your Booking
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Booking reference: <strong>{booking.reference}</strong>
        </p>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}
      >
        {/* Booking Details */}
        <div
          style={{
            background: '#f9fafb',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2
            style={{
              color: '#1f2937',
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            📍 Journey Details
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#374151' }}>From:</strong>
              <div style={{ color: '#6b7280', marginTop: '4px' }}>
                {booking.pickupAddress}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#374151' }}>To:</strong>
              <div style={{ color: '#6b7280', marginTop: '4px' }}>
                {booking.dropoffAddress}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#374151' }}>Distance:</strong>
              <div style={{ color: '#6b7280', marginTop: '4px' }}>
                {formatDistance(booking.distanceMeters)}
              </div>
            </div>
          </div>

          <h3
            style={{
              color: '#1f2937',
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            🚐 Service Details
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#374151' }}>Van Type:</strong>
              <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                {booking.vanSize || 'Standard'}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#374151' }}>Crew Size:</strong>
              <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                {booking.crewSize || 1} person(s)
              </span>
            </div>
            {booking.timeSlot && (
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#374151' }}>Time Slot:</strong>
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                  {formatTime(booking.timeSlot)}
                </span>
              </div>
            )}
            {booking.scheduledAt && (
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#374151' }}>Date:</strong>
                <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                  {formatDate(booking.scheduledAt)}
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              background: '#fef3c7',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #f59e0b',
            }}
          >
            <div
              style={{
                color: '#92400e',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              ⏰ Price locked until:{' '}
              {new Date(booking.lockExpiresAt).toLocaleTimeString('en-GB')}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div
          style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            border: '2px solid #10b981',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              color: '#1f2937',
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            💳 Payment Summary
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span style={{ color: '#374151' }}>Service Fee:</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>
                {formatCurrency(booking.lockedAmountPence)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span style={{ color: '#374151' }}>VAT (20%):</span>
              <span style={{ color: '#374151', fontWeight: '500' }}>
                {formatCurrency(Math.round(booking.lockedAmountPence * 0.2))}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#1f2937',
                paddingTop: '12px',
                borderTop: '2px solid #10b981',
              }}
            >
              <span>Total:</span>
              <span>{formatCurrency(booking.lockedAmountPence)}</span>
            </div>
          </div>

          <button
            onClick={createCheckoutSession}
            disabled={loading}
            style={{
              width: '100%',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Processing...' : 'Pay Securely with Stripe'}
          </button>

          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            🔒 Your payment is secured by Stripe
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '32px',
          textAlign: 'center',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
        }}
      >
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
          Need help? Contact us at <strong>support@speedy-van.co.uk</strong> or
          call <strong>07901846297</strong>
        </p>
      </div>
    </div>
  );
}
