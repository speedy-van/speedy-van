'use client';

import React from 'react';
import { EnhancedBookingDisplay } from '@/components/booking';

export default function TestMobileEnhancementsPage() {
  // بيانات تجريبية للحجوزات
  const sampleBookings = [
    {
      id: '1',
      reference: 'SV001',
      pickupAddress: 'الرياض، حي النرجس، شارع الملك فهد',
      deliveryAddress: 'جدة، حي الشاطئ، شارع التحلية',
      scheduledAt: '2024-01-15',
      timeSlot: '09:00-12:00',
      totalGBP: 15000,
      lockedAmountPence: 15000,
      status: 'CONFIRMED',
      contactName: 'أحمد محمد',
      contactPhone: '+966501234567',
      contactEmail: 'ahmed@example.com',
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      reference: 'SV002',
      pickupAddress: 'الدمام، حي الشاطئ، شارع الملك خالد',
      deliveryAddress: 'الخبر، حي الكورنيش، شارع الأمير محمد',
      scheduledAt: '2024-01-16',
      timeSlot: '14:00-17:00',
      totalGBP: 20000,
      lockedAmountPence: 20000,
      status: 'in-progress',
      contactName: 'فاطمة علي',
      contactPhone: '+966507654321',
      contactEmail: 'fatima@example.com',
      createdAt: '2024-01-11T14:30:00Z'
    },
    {
      id: '3',
      reference: 'SV003',
      pickupAddress: 'مكة المكرمة، حي العزيزية، شارع الملك عبدالله',
      deliveryAddress: 'المدينة المنورة، حي قباء، شارع الملك فهد',
      scheduledAt: '2024-01-17',
      timeSlot: '08:00-11:00',
      totalGBP: 25000,
      lockedAmountPence: 25000,
      status: 'COMPLETED',
      contactName: 'محمد عبدالله',
      contactPhone: '+966509876543',
      contactEmail: 'mohammed@example.com',
      createdAt: '2024-01-12T09:15:00Z'
    }
  ];

  const handleBookingPress = (booking: any) => {
    console.log('تم الضغط على الحجز:', booking);
    alert(`تم الضغط على الحجز: ${booking.reference}`);
  };

  const handleBookingLongPress = (booking: any) => {
    console.log('تم الضغط المطول على الحجز:', booking);
    alert(`تم الضغط المطول على الحجز: ${booking.reference}`);
  };

  const handleLongPress = (booking: any) => {
    console.log('Long press on Booking:', booking);
    alert(`Long press on Booking: ${booking.reference}`);
  };

  const handleNotificationAction = (action: string, booking: any) => {
    console.log('Notification action:', action, booking);
    alert(`Notification action: ${action} for booking ${booking.reference}`);
  };

  const handleShare = (booking: any) => {
    console.log('Share Booking:', booking);
    alert(`Share Booking: ${booking.reference}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '16px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 8px 0'
        }}>
          Mobile Enhancements Test
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Comprehensive test page for all booking display improvements in mobile browser
        </p>
      </div>

      {/* Enhanced Booking Display */}
      <EnhancedBookingDisplay
        bookings={sampleBookings}
        onBookingPress={handleBookingPress}
        onBookingLongPress={handleBookingLongPress}
        onNotificationAction={handleNotificationAction}
        onShare={handleShare}
      />

      {/* Info Section */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 16px 0'
        }}>
          Tested Features:
        </h2>
        <ul style={{
          margin: '0',
          paddingLeft: '20px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          <li>✅ Responsive display that works on all screen sizes</li>
          <li>✅ Enhanced booking cards with smooth animations</li>
          <li>✅ Smart notification system</li>
          <li>✅ Customizable user preferences</li>
          <li>✅ Integration with native apps</li>
          <li>✅ Performance monitoring (in development mode)</li>
          <li>✅ Dark mode support</li>
          <li>✅ Accessibility improvements</li>
          <li>✅ Offline mode support</li>
          <li>✅ Clear and readable font in all inputs</li>
        </ul>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '16px',
        padding: '20px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '12px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#92400e',
          margin: '0 0 12px 0'
        }}>
          Test Instructions:
        </h3>
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#92400e'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>1. Test Display:</strong> Try changing window size or using developer tools
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>2. Test Interactions:</strong> Tap on cards and test gestures
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>3. Test Settings:</strong> Tap the settings button at the top
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>4. Test Performance:</strong> Tap the performance monitoring button (in development mode)
          </p>
          <p style={{ margin: '0' }}>
            <strong>5. Test Mobile:</strong> Use developer tools to simulate mobile devices
          </p>
        </div>
      </div>
    </div>
  );
}
