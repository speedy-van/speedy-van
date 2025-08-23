'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MobileFormField from './MobileFormField';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'search' | 'url' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  maxLength?: number;
  autoComplete?: string;
  rows?: number;
}

export interface MobileFormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  submitText?: string;
  loading?: boolean;
  className?: string;
}

export default function MobileForm({
  title,
  description,
  fields,
  onSubmit,
  submitText = 'Submit',
  loading = false,
  className = ''
}: MobileFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Email validation
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid email address';
        }
      } else if (field.type === 'tel' && formData[field.name]) {
        // Basic phone validation - at least 10 digits
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid phone number';
        }
      } else if (field.type === 'url' && formData[field.name]) {
        try {
          new URL(formData[field.name]);
        } catch {
          newErrors[field.name] = 'Invalid URL';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className={`mobile-form-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        width: '100%',
        maxWidth: '100%',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Form Header */}
      {(title || description) && (
        <div
          className="mobile-form-header"
          style={{
            marginBottom: '24px',
            textAlign: 'center'
          }}
        >
          {title && (
            <h2
              className="mobile-form-title"
              style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.3'
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              className="mobile-form-description"
              style={{
                margin: '0',
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mobile-form"
        style={{
          width: '100%'
        }}
      >
        {/* Form Fields */}
        <div
          className="mobile-form-fields"
          style={{
            marginBottom: '24px'
          }}
        >
          {fields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MobileFormField
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={(value) => handleFieldChange(field.name, value)}
                error={errors[field.name]}
                required={field.required}
                options={field.options}
                maxLength={field.maxLength}
                autoComplete={field.autoComplete}
                rows={field.rows}
              />
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || loading}
          className="mobile-form-submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            minHeight: '48px',
            fontSize: '16px',
            fontWeight: '500',
            padding: '12px 24px',
            backgroundColor: isSubmitting || loading ? '#9ca3af' : '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting || loading ? (
            <>
              <div
                className="loading-spinner"
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              جاري الإرسال...
            </>
          ) : (
            submitText
          )}
        </motion.button>
      </form>

      {/* Form Footer */}
      <div
        className="mobile-form-footer"
        style={{
          marginTop: '16px',
          textAlign: 'center'
        }}
      >
        <p
          style={{
            margin: '0',
            fontSize: '12px',
            color: '#9ca3af',
            lineHeight: '1.4'
          }}
        >
          جميع البيانات محمية ومشفرة
        </p>
      </div>

      {/* Loading Overlay */}
      {(isSubmitting || loading) && (
        <motion.div
          className="mobile-form-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            zIndex: 10
          }}
        >
          <div
            className="loading-spinner-large"
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
        </motion.div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
