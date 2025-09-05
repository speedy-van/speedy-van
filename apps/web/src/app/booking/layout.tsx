// Route layout for /booking to scope CSS fixes without touching other pages
import React from 'react';

export const metadata = {
  title: 'Booking — Speedy Van',
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-page="booking" style={{ isolation: 'isolate' }}>
      {children}
    </div>
  );
}
