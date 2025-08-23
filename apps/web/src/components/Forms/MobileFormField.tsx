'use client';

import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface MobileFormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'search' | 'url' | 'textarea' | 'select';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}

const MobileFormField = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, MobileFormFieldProps>(
  ({
    label,
    type = 'text',
    placeholder,
    value = '',
    onChange,
    onFocus,
    onBlur,
    error,
    required = false,
    disabled = false,
    options = [],
    rows = 4,
    maxLength,
    autoComplete,
    className = ''
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(!!value);

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      setIsFilled(!!value);
      onBlur?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = e.target.value;
      setIsFilled(!!newValue);
      onChange?.(newValue);
    };

    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <motion.div
        className={`mobile-form-field ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          marginBottom: '20px',
          width: '100%'
        }}
      >
        {/* Label */}
        <label
          htmlFor={fieldId}
          className="mobile-form-label"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: error ? '#ef4444' : '#374151',
            lineHeight: '1.4'
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>

        {/* Input Container */}
        <div
          className="mobile-form-input-container"
          style={{
            position: 'relative',
            width: '100%'
          }}
        >
          {/* Text Input */}
          {type !== 'textarea' && type !== 'select' && (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={fieldId}
              type={type}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              maxLength={maxLength}
              autoComplete={autoComplete}
              className={`mobile-form-input ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''} ${error ? 'error' : ''}`}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: '400',
                lineHeight: '1.5',
                padding: '12px 16px',
                border: `1px solid ${error ? '#ef4444' : isFocused ? '#10b981' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#111827',
                transition: 'all 0.2s ease-in-out',
                outline: 'none',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            />
          )}

          {/* Textarea */}
          {type === 'textarea' && (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={fieldId}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              maxLength={maxLength}
              rows={rows}
              className={`mobile-form-textarea ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''} ${error ? 'error' : ''}`}
              style={{
                width: '100%',
                minHeight: '80px',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: '400',
                lineHeight: '1.6',
                padding: '12px 16px',
                border: `1px solid ${error ? '#ef4444' : isFocused ? '#10b981' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#111827',
                transition: 'all 0.2s ease-in-out',
                outline: 'none',
                resize: 'vertical',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            />
          )}

          {/* Select */}
          {type === 'select' && (
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              id={fieldId}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required={required}
              disabled={disabled}
              className={`mobile-form-select ${isFocused ? 'focused' : ''} ${isFilled ? 'filled' : ''} ${error ? 'error' : ''}`}
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: '400',
                lineHeight: '1.5',
                padding: '12px 16px',
                paddingRight: '40px',
                border: `1px solid ${error ? '#ef4444' : isFocused ? '#10b981' : '#d1d5db'}`,
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#111827',
                transition: 'all 0.2s ease-in-out',
                outline: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 12px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '16px',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
            >
              <option value="">{placeholder || 'اختر...'}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {/* Focus Indicator */}
          {isFocused && (
            <motion.div
              className="mobile-form-focus-indicator"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                border: '2px solid #10b981',
                borderRadius: '10px',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mobile-form-error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: '#ef4444',
              fontWeight: '400'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Character Count */}
        {maxLength && (
          <div
            className="mobile-form-char-count"
            style={{
              marginTop: '4px',
              fontSize: '11px',
              color: '#9ca3af',
              textAlign: 'right'
            }}
          >
            {value.length}/{maxLength}
          </div>
        )}
      </motion.div>
    );
  }
);

MobileFormField.displayName = 'MobileFormField';

export default MobileFormField;
