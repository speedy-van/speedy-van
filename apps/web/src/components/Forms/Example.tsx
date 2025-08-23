'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MobileForm, { FormField } from './MobileForm';

export default function MobileFormExample() {
  const [submittedData, setSubmittedData] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define form fields
  const formFields: FormField[] = [
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
      autoComplete: 'name'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'example@email.com',
      required: true,
      autoComplete: 'email'
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: '+44 7700 900000',
      required: true,
      autoComplete: 'tel'
    },
    {
      name: 'serviceType',
      label: 'Service Type',
      type: 'select',
      placeholder: 'Choose service type',
      required: true,
      options: [
        { value: 'moving', label: 'Moving Service' },
        { value: 'delivery', label: 'Delivery Service' },
        { value: 'storage', label: 'Storage Service' },
        { value: 'packing', label: 'Packing Service' }
      ]
    },
    {
      name: 'pickupAddress',
      label: 'Pickup Address',
      type: 'textarea',
      placeholder: 'Enter pickup address details',
      required: true,
      rows: 3,
      autoComplete: 'street-address'
    },
    {
      name: 'deliveryAddress',
      label: 'Delivery Address',
      type: 'textarea',
      placeholder: 'Enter delivery address details',
      required: true,
      rows: 3,
      autoComplete: 'street-address'
    },
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      placeholder: 'Any additional notes or special requirements',
      required: false,
      rows: 4,
      maxLength: 500
    }
  ];

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsLoading(true);
    
    // Simulate data submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSubmittedData(data);
    setIsLoading(false);
    
    // Show success message
    alert('Form submitted successfully!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 8px 0'
          }}
        >
          Service Request Form
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            lineHeight: '1.5'
          }}
        >
          Example of mobile-optimized form
        </p>
      </motion.div>

      {/* Form Container */}
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        <MobileForm
          title="طلب خدمة النقل"
          description="املأ النموذج التالي لطلب خدمة النقل أو التوصيل"
          fields={formFields}
          onSubmit={handleFormSubmit}
          submitText="إرسال الطلب"
          loading={isLoading}
        />
      </div>

      {/* Submitted Data Display */}
      {submittedData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '600px',
            margin: '32px auto 0',
            padding: '20px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: '12px'
          }}
        >
          <h3
            style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
              color: '#065f46'
            }}
          >
            البيانات المرسلة:
          </h3>
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#065f46'
            }}
          >
            {Object.entries(submittedData).map(([key, value]) => (
              <div
                key={key}
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px'
                }}
              >
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Features Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          maxWidth: '600px',
          margin: '32px auto 0',
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827'
          }}
        >
          الميزات المحسنة:
        </h3>
        <ul
          style={{
            margin: '0',
            paddingLeft: '20px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#374151'
          }}
        >
          <li>تصميم متجاوب يعمل على جميع أحجام الشاشات</li>
          <li>خط واضح ومقروء في جميع المدخلات</li>
          <li>تحسينات خاصة بـ iOS و Android</li>
          <li>منع التكبير التلقائي في المدخلات</li>
          <li>تحقق من صحة البيانات في الوقت الفعلي</li>
          <li>رسائل خطأ واضحة ومفيدة</li>
          <li>حركات سلسة وتفاعلية</li>
          <li>دعم الوضع المظلم</li>
          <li>تحسينات إمكانية الوصول</li>
        </ul>
      </motion.div>

      {/* Technical Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          maxWidth: '600px',
          margin: '32px auto 0',
          padding: '20px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '12px'
        }}
      >
        <h3
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#92400e'
          }}
        >
          معلومات تقنية:
        </h3>
        <div
          style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#92400e'
          }}
        >
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>حجم الخط:</strong> 16px (لمنع التكبير التلقائي في iOS)
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>الخط:</strong> -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>الارتفاع الأدنى:</strong> 48px (لمس أفضل)
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>الحدود:</strong> 8px (مظهر عصري)
          </p>
          <p style={{ margin: '0' }}>
            <strong>الانتقالات:</strong> 0.2s ease-in-out (تجربة سلسة)
          </p>
        </div>
      </motion.div>
    </div>
  );
}
