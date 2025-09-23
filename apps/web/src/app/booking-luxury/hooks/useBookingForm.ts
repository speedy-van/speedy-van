'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';
// import {
//   addressSchema,
//   customerSchema,
//   propertyDetailsSchema,
//   bookingItemSchema,
// } from '@/lib/schemas/booking-schemas';

// Use shared property details schema (imported above)
// Local property details schema for frontend compatibility
const frontendPropertyDetailsSchema = z.object({
  type: z.enum(['house', 'apartment', 'office', 'warehouse', 'other']).default('house'),
  floors: z.number().int().min(0).max(50).optional().default(0),
  hasLift: z.boolean().optional().default(false),
  hasParking: z.boolean().optional().default(true),
  accessNotes: z.string().max(1000).optional(),
  requiresPermit: z.boolean().optional().default(false),
});

// Item schema
const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  size: z.enum(['small', 'medium', 'large']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  weight: z.number().min(0),
  volume: z.number().min(0),
  image: z.string().optional(),
});

// Service type schema
const serviceTypeSchema = z.enum(['man-and-van', 'van-only', 'premium', 'express']);

// Customer details schema
const customerDetailsSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens and apostrophes')
    .transform(s => s.trim()),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name can only contain letters, spaces, hyphens and apostrophes')
    .transform(s => s.trim()),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .transform(s => s.toLowerCase().trim()),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^(?:(?:\+44)|(?:0))(?:\d\s?){9,10}$/, 'Please enter a valid UK phone number')
    .transform(s => s.replace(/\s+/g, '').replace(/^0/, '+44')),
  company: z.string()
    .max(100, 'Company name too long')
    .optional()
    .transform(s => s ? s.trim() : s),
});

// Payment method schema - Stripe only
const paymentMethodSchema = z.object({
  type: z.enum(['stripe']).default('stripe'),
  stripeDetails: z.object({
    paymentIntentId: z.string().optional(),
    sessionId: z.string().optional(),
  }).optional(),
});

// Pricing breakdown schema
const pricingBreakdownSchema = z.object({
  baseFee: z.number().min(0),
  distanceFee: z.number().min(0),
  volumeFee: z.number().min(0),
  serviceFee: z.number().min(0),
  urgencyFee: z.number().min(0).default(0),
  vat: z.number().min(0),
  total: z.number().min(0),
  distance: z.number().min(0), // Distance in miles for display purposes
});

// Frontend-compatible address schema
const frontendAddressSchema = z.object({
  address: z.string()
    .min(1, 'Address is required')
    .max(100, 'Address too long')
    .transform(s => s.trim()),
  city: z.string()
    .min(1, 'City is required')
    .max(50, 'City name too long')
    .transform(s => s.trim()),
  postcode: z.string()
    .min(1, 'Postcode is required')
    .max(10, 'Invalid postcode length')
    .regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, 'Invalid UK postcode format')
    .transform(s => s.toUpperCase().replace(/\s+/g, ' ').trim()),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  // Additional fields for enhanced pricing calculation
  houseNumber: z.string().optional(),
  flatNumber: z.string().optional(),
  formatted_address: z.string().optional(),
  place_name: z.string().optional(),
});

const step1Schema = z.object({
  pickupAddress: frontendAddressSchema,
  dropoffAddress: frontendAddressSchema,
  pickupProperty: frontendPropertyDetailsSchema,
  dropoffProperty: frontendPropertyDetailsSchema,
  items: z.array(itemSchema).min(1, 'Please select at least one item'),
  serviceType: serviceTypeSchema,
  pickupDate: z.string()
    .min(1, 'Please select a pickup date')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !isNaN(selectedDate.getTime()) && selectedDate >= today;
    }, 'Please select a valid future date'),
  pickupTimeSlot: z.string()
    .min(1, 'Please select a time slot'),
  urgency: z.enum(['same-day', 'next-day', 'scheduled'])
    .default('scheduled'),
  distance: z.number().min(0),
  estimatedDuration: z.number().min(0),
  pricing: pricingBreakdownSchema,
});

const step2Schema = z.object({
  customerDetails: customerDetailsSchema,
  paymentMethod: paymentMethodSchema,
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  marketingOptIn: z.boolean().optional(),
  specialInstructions: z.string().optional(),
  bookingId: z.string().optional(),
});

// Complete form schema (2 steps unified)
const formSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
});

export type Address = z.infer<typeof frontendAddressSchema>;
export type PropertyDetails = z.infer<typeof frontendPropertyDetailsSchema>;
export type Item = z.infer<typeof itemSchema>;
export type ServiceType = z.infer<typeof serviceTypeSchema>;
export type CustomerDetails = z.infer<typeof customerDetailsSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PricingBreakdown = z.infer<typeof pricingBreakdownSchema>;
export type FormData = z.infer<typeof formSchema>;

const initialFormData: FormData = {
  step1: {
    pickupAddress: {
      address: '',
      city: '',
      postcode: '',
      coordinates: { lat: 0, lng: 0 },
      houseNumber: '',
      flatNumber: '',
      formatted_address: '',
      place_name: '',
    },
    dropoffAddress: {
      address: '',
      city: '',
      postcode: '',
      coordinates: { lat: 0, lng: 0 },
      houseNumber: '',
      flatNumber: '',
      formatted_address: '',
      place_name: '',
    },
    pickupProperty: {
      type: 'house',
      floors: 0,
      hasLift: false,
      hasParking: false,
      requiresPermit: false,
      accessNotes: '',
    },
    dropoffProperty: {
      type: 'house',
      floors: 0,
      hasLift: false,
      hasParking: false,
      requiresPermit: false,
      accessNotes: '',
    },
    items: [],
    serviceType: 'man-and-van',
    pickupDate: '',
    pickupTimeSlot: '',
    urgency: 'scheduled',
    distance: 0,
    estimatedDuration: 0,
    pricing: {
      baseFee: 0,
      distanceFee: 0,
      volumeFee: 0,
      serviceFee: 0,
      urgencyFee: 0,
      vat: 0,
      total: 0,
      distance: 0,
    },
  },
  step2: {
    customerDetails: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
    },
    paymentMethod: {
      type: 'stripe',
      stripeDetails: {
        paymentIntentId: '',
        sessionId: '',
      },
    },
    termsAccepted: false,
    privacyAccepted: false,
    marketingOptIn: false,
    specialInstructions: '',
    bookingId: '',
  },
};

export function useBookingForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');

  const updateFormData = useCallback((step: keyof FormData, data: Partial<FormData[keyof FormData]>) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [step]: {
          ...prev[step],
          ...data,
        },
      };
      
      // Validate the updated step in real-time
      try {
        const schema = step === 'step1' ? step1Schema : step2Schema;
        schema.parse(newData[step]);
        
        // Only clear errors for fields that were just updated
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          Object.keys(data).forEach(field => {
            const errorKey = `${step}.${field}`;
            delete newErrors[errorKey];
          });
          return newErrors;
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            error.issues.forEach(err => {
              // Only set errors for fields that were just updated
              const path = err.path.join('.');
              if (path.startsWith(step + '.') && Object.keys(data).some(field => path.includes(field))) {
                newErrors[path] = err.message;
              }
            });
            return newErrors;
          });
        }
      }
      
      return newData;
    });
  }, []);

  const validateStep = useCallback(async (stepNumber: number): Promise<boolean> => {
    try {
      let schema;
      let data;

      switch (stepNumber) {
        case 1:
          schema = step1Schema;
          data = formData.step1;
          break;
        case 2:
          schema = step2Schema;
          data = formData.step2;
          break;
        default:
          return false;
      }

      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const isStepValid = useCallback((stepNumber: number): boolean => {
    try {
      let schema;
      let data;

      switch (stepNumber) {
        case 1:
          schema = step1Schema;
          data = formData.step1;
          break;
        case 2:
          schema = step2Schema;
          data = formData.step2;
          break;
        default:
          return false;
      }

      schema.parse(data);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const currentData = stepNumber === 1 ? formData.step1 : formData.step2;
        console.log(`❌ Step ${stepNumber} validation failed:`, {
          errors: error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          })),
          data: currentData
        });
      }
      return false;
    }
  }, [formData]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  return {
    formData,
    updateFormData,
    validateStep,
    isStepValid,
    errors,
    clearErrors,
    resetForm,
  };
}