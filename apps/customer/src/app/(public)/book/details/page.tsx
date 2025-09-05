'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingDetails() {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [code, setCode] = useState('');
  const ticking = useRef<any>(null);

  useEffect(() => {
    const id = localStorage.getItem('sv_draft_id');
    if (!id) {
      router.push('/book');
      return;
    }
    (async () => {
      const r = await fetch(`/api/admin/orders?q=${id}`);
      const rows = await r.json();
      const b = rows.find((x: any) => x.id === id) || null;
      setBooking(b);
    })();
  }, [router]);

  async function holdSlot() {
    if (!booking) return;
    const slotKey = `${booking.timeSlot || 'am'}:${(booking.scheduledAt || '').slice(0, 10)}`;
    const r = await fetch('/api/bookings/lock', {
      method: 'POST',
      body: JSON.stringify({ bookingId: booking.id, ttlSeconds: 900, slotKey }),
    });
    if (r.ok) {
      const b = await r.json();
      setBooking((prev: any) => ({ ...prev, ...b }));
      const ttl = Math.max(
        0,
        Math.floor((new Date(b.lockExpiresAt).getTime() - Date.now()) / 1000)
      );
      setCountdown(ttl);
      if (ticking.current) clearInterval(ticking.current);
      ticking.current = setInterval(
        () => setCountdown(x => Math.max(0, x - 1)),
        1000
      );
    }
  }

  async function sendOtp(channel: 'sms' | 'email') {
    const destination =
      channel === 'sms' ? booking?.contactPhone : booking?.contactEmail;
    const r = await fetch('/api/otp/send', {
      method: 'POST',
      body: JSON.stringify({ bookingId: booking.id, channel, destination }),
    });
    if (r.ok) alert('Code sent');
  }

  async function verifyOtp() {
    const r = await fetch('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ bookingId: booking.id, code }),
    });
    const j = await r.json();
    if (j.ok) {
      alert('Verified');
      setBooking((b: any) => ({ ...b, phoneVerified: true }));
    } else {
      alert('Invalid or expired code');
    }
  }

  const canContinue =
    booking &&
    (booking.phoneVerified || booking.emailVerified) &&
    booking.status === 'awaiting_payment' &&
    countdown > 0;

  return (
    <main
      style={{ maxWidth: 720, margin: '24px auto', display: 'grid', gap: 12 }}
    >
      <h1>Confirm your details</h1>
      {!booking && <div>Loading...</div>}
      {booking && (
        <>
          <section
            style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}
          >
            <h3>Contact</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              <input
                defaultValue={booking.contactName || ''}
                placeholder="Full name"
              />
              <input
                defaultValue={booking.contactPhone || ''}
                placeholder="Mobile"
                inputMode="tel"
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 8,
                marginTop: 8,
              }}
            >
              <input
                defaultValue={booking.contactEmail || ''}
                placeholder="Email"
                type="email"
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => sendOtp('sms')}>Send SMS OTP</button>
              <button onClick={() => sendOtp('email')}>Send Email OTP</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                placeholder="Enter code"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <button onClick={verifyOtp}>Verify</button>
            </div>
          </section>

          <section
            style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}
          >
            <h3>Timing</h3>
            <div>
              Date: {(booking.scheduledAt || '').slice(0, 10)} • Slot:{' '}
              {booking.timeSlot?.toUpperCase() || 'AM'}
            </div>
            <div style={{ marginTop: 8 }}>
              {booking.status !== 'awaiting_payment' && (
                <button onClick={holdSlot}>Hold slot & lock price</button>
              )}
              {booking.status === 'awaiting_payment' && (
                <div>
                  Held for {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, '0')}
                </div>
              )}
            </div>
          </section>

          <aside
            style={{
              padding: 12,
              background: '#F7FAFC',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Total</strong>
              <strong>
                {booking.lockedAmountPence
                  ? `£${(booking.lockedAmountPence / 100).toFixed(2)}`
                  : 'Price not locked yet'}
              </strong>
            </div>
            {booking.lockExpiresAt && (
              <div style={{ fontSize: 12, color: '#555' }}>
                Price locked until{' '}
                {new Date(booking.lockExpiresAt).toLocaleTimeString()}
              </div>
            )}
          </aside>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={!canContinue}
              onClick={() => router.push(`/checkout?booking=${booking.id}`)}
              style={{
                background: !canContinue ? '#9ca3af' : '#10b981',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: !canContinue ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
            >
              Continue to Pay
            </button>
            {!canContinue && (
              <small>Verify contact and hold a slot to continue.</small>
            )}
          </div>
        </>
      )}
    </main>
  );
}
