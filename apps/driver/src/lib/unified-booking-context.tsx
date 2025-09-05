'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Coordinates, 
  Address, 
  PropertyDetails, 
  BookingItem, 
  TimeSlot, 
  ServiceType 
} from './booking/types';

// ============================================================================
// UNIFIED BOOKING SCHEMAS
// ============================================================================

// Base address schema
const addressSchema = z.object({
  label: z.string().min(1, 'Address is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postcode: z.string().min(1, 'Postcode is required'),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

// Property details schema
const propertySchema = z.object({
  propertyType: z.enum(['house', 'flat', 'office', 'storage', 'other']),
  floor: z.number().min(0).optional(),
  hasLift: z.boolean().default(false),
  accessNotes: z.string().optional(),
});

// Item schema
const itemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  size: z.enum(['small', 'medium', 'large']),
  quantity: z.number().min(1).max(99),
  image: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Service type schema
const serviceTypeSchema = z.enum([
  'man-and-van',
  'van-only',
  'premium',
  'express',
]);

// Time slot schema
const timeSlotSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  customRequirements: z.string().optional(),
});

// Customer details schema
const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
});

// Payment schema
const paymentSchema = z.object({
  method: z.string().min(1, 'Payment method is required'),
  cardDetails: z
    .object({
      cardholderName: z.string().optional(),
      cardNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      cvv: z.string().optional(),
    })
    .optional(),
  termsAccepted: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms'),
  marketingConsent: z.boolean().default(false),
});

// Complete booking schema
export const unifiedBookingSchema = z.object({
  // Step 1: Where & What
  pickupAddress: addressSchema.optional(),
  dropoffAddress: addressSchema.optional(),
  pickupProperty: propertySchema.optional(),
  dropoffProperty: propertySchema.optional(),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  distanceMiles: z.number().optional(),

  // Step 2: When & How
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  serviceType: serviceTypeSchema,
  customRequirements: z.string().optional(),

  // Step 3: Who & Payment
  customerDetails: customerSchema,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  cardDetails: z
    .object({
      cardholderName: z.string().optional(),
      cardNumber: z.string().optional(),
      expiryDate: z.string().optional(),
      cvv: z.string().optional(),
    })
    .optional(),
  termsAccepted: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms'),
  marketingConsent: z.boolean().default(false),
  specialInstructions: z.string().optional(),
});

// Type inference
export type UnifiedBookingData = z.infer<typeof unifiedBookingSchema>;

// Step validation schemas
export const stepSchemas = {
  1: z.object({
    pickupAddress: addressSchema.optional(),
    dropoffAddress: addressSchema.optional(),
    pickupProperty: propertySchema.optional(),
    dropoffProperty: propertySchema.optional(),
    items: z.array(itemSchema).min(1, 'At least one item is required'),
    date: z.string().min(1, 'Date is required'),
    timeSlot: z.string().min(1, 'Time slot is required'),
    serviceType: serviceTypeSchema,
    customRequirements: z.string().optional(),
  }),
  2: z.object({
    customerDetails: customerSchema,
    paymentMethod: z.string().min(1, 'Payment method is required'),
    cardDetails: z
      .object({
        cardholderName: z.string().optional(),
        cardNumber: z.string().optional(),
        expiryDate: z.string().optional(),
        cvv: z.string().optional(),
      })
      .optional(),
    termsAccepted: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms'),
    marketingConsent: z.boolean().default(false),
    specialInstructions: z.string().optional(),
  }),
  3: z.object({
    // Confirmation step - no validation needed
    confirmed: z
      .boolean()
      .refine(val => val === true, 'Please confirm your booking'),
  }),
};

// ============================================================================
// UNIFIED BOOKING CONTEXT
// ============================================================================

interface UnifiedBookingContextType {
  // Form management
  form: UseFormReturn<UnifiedBookingData>;

  // Step management
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  getStepStatus: (stepId: number) => {
    isCompleted: boolean;
    isCurrent: boolean;
  };

  // Data management
  updateData: (data: Partial<UnifiedBookingData>) => void;
  getData: () => UnifiedBookingData;
  resetData: () => void;

  // Validation
  validateCurrentStep: () => Promise<boolean>;
  getStepErrors: (step: number) => Record<string, string>;

  // Persistence
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  clearDraft: () => void;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;

  // Analytics
  trackStepStart: (step: number) => void;
  trackStepCompletion: (step: number) => void;
  trackAbandonment: (point: string) => void;
  trackIncompleteBooking: (step: number, reason: string) => void;
  trackVisitorActivity: (action: string, details?: any) => void;
  getAnalytics: () => {
    stepStartTimes: Record<number, Date>;
    stepCompletionTimes: Record<number, Date>;
    totalTimeSpent: number;
    abandonmentPoints: string[];
    incompleteBookings: Array<{
      step: number;
      reason: string;
      data: Partial<UnifiedBookingData>;
      timestamp: Date;
      sessionId: string;
    }>;
    visitorAnalytics: {
      totalVisitors: number;
      uniqueVisitors: number;
      averageSessionDuration: number;
      topCities: Array<{ city: string; count: number; region: string }>;
      topRegions: Array<{ region: string; count: number }>;
      visitorFlow: Array<{
        sessionId: string;
        visitorId: string;
        city: string;
        region: string;
        country: string;
        coordinates: { lat: number; lng: number };
        entryTime: Date;
        exitTime?: Date;
        sessionDuration: number;
        pagesVisited: Array<{
          page: string;
          timeSpent: number;
          timestamp: Date;
        }>;
        actions: Array<{ action: string; timestamp: Date; details?: any }>;
        bookingStarted: boolean;
        bookingCompleted: boolean;
        bookingAbandonedAt?: number;
        deviceInfo: {
          userAgent: string;
          screenResolution: string;
          language: string;
          timezone: string;
        };
      }>;
    };
  };

  // State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Create context
const UnifiedBookingContext = createContext<
  UnifiedBookingContextType | undefined
>(undefined);

// Storage keys
const DRAFT_STORAGE_KEY = 'speedy-van-unified-booking-draft';
const DRAFT_TIMESTAMP_KEY = 'speedy-van-unified-booking-draft-timestamp';

// Default data
const defaultBookingData: UnifiedBookingData = {
  items: [],
  date: '',
  timeSlot: '',
  serviceType: 'man-and-van',
  customerDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
  },
  paymentMethod: '',
  termsAccepted: false,
  marketingConsent: false,
  specialInstructions: '',
};

// Provider component
export const UnifiedBookingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Form setup with React Hook Form
  const form = useForm<UnifiedBookingData>({
    resolver: zodResolver(unifiedBookingSchema),
    defaultValues: defaultBookingData,
    mode: 'onChange',
  });

  // Local state
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDraftSaved, setIsDraftSaved] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = React.useState({
    stepStartTimes: {} as Record<number, Date>,
    stepCompletionTimes: {} as Record<number, Date>,
    totalTimeSpent: 0,
    abandonmentPoints: [] as string[],
    incompleteBookings: [] as Array<{
      step: number;
      reason: string;
      data: Partial<UnifiedBookingData>;
      timestamp: Date;
      sessionId: string;
    }>,
    visitorAnalytics: {
      totalVisitors: 0,
      uniqueVisitors: 0,
      averageSessionDuration: 0,
      topCities: [] as Array<{ city: string; count: number; region: string }>,
      topRegions: [] as Array<{ region: string; count: number }>,
      visitorFlow: [] as Array<{
        sessionId: string;
        visitorId: string;
        city: string;
        region: string;
        country: string;
        coordinates: { lat: number; lng: number };
        entryTime: Date;
        exitTime?: Date;
        sessionDuration: number;
        pagesVisited: Array<{
          page: string;
          timeSpent: number;
          timestamp: Date;
        }>;
        actions: Array<{ action: string; timestamp: Date; details?: any }>;
        bookingStarted: boolean;
        bookingCompleted: boolean;
        bookingAbandonedAt?: number;
        deviceInfo: {
          userAgent: string;
          screenResolution: string;
          language: string;
          timezone: string;
        };
      }>,
    },
  });

  const totalSteps = 3;

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save draft every 30 seconds if there are changes
  useEffect(() => {
    if (!isDraftSaved && Object.keys(form.getValues()).length > 0) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [form.watch(), isDraftSaved]);

  // Step navigation
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        trackStepStart(step);
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const nextStep = useCallback(async (): Promise<boolean> => {
    console.log('🚀 nextStep called for current step:', currentStep);
    const isValid = await validateCurrentStep();
    console.log('✅ Validation result:', isValid);
    if (isValid && currentStep < totalSteps) {
      console.log('🎯 Moving to next step');
      trackStepCompletion(currentStep);
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      trackStepStart(nextStepNumber);
      console.log('🎉 Successfully moved to step:', nextStepNumber);
      return true;
    } else {
      console.log(
        '❌ Cannot move to next step. Valid:',
        isValid,
        'Current:',
        currentStep,
        'Total:',
        totalSteps
      );
    }
    return false;
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      trackStepStart(currentStep - 1);
    }
  }, [currentStep]);

  const canGoNext = useMemo(() => {
    return currentStep < totalSteps;
  }, [currentStep, totalSteps]);

  const canGoPrev = useMemo(() => {
    return currentStep > 1;
  }, [currentStep]);

  // Step status helper
  const getStepStatus = useCallback(
    (stepId: number) => {
      return {
        isCompleted: stepId < currentStep,
        isCurrent: stepId === currentStep,
      };
    },
    [currentStep]
  );

  // Data management
  const updateData = useCallback(
    (data: Partial<UnifiedBookingData>) => {
      Object.entries(data).forEach(([key, value]) => {
        form.setValue(key as any, value);
      });
      setIsDraftSaved(false);
    },
    [form]
  );

  const getData = useCallback(() => {
    return form.getValues();
  }, [form]);

  const resetData = useCallback(() => {
    // Track incomplete booking before resetting
    const currentData = form.getValues();
    if (currentData.items && currentData.items.length > 0) {
      trackIncompleteBooking(currentStep, 'Data reset by user');
    }

    form.reset(defaultBookingData);
    setCurrentStep(1);
    setIsDraftSaved(false);
    setLastSavedAt(null);
    setAnalytics({
      stepStartTimes: {},
      stepCompletionTimes: {},
      totalTimeSpent: 0,
      abandonmentPoints: [],
      incompleteBookings: [],
      visitorAnalytics: {
        totalVisitors: 0,
        uniqueVisitors: 0,
        returningVisitors: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0,
        topReferrers: [],
        deviceTypes: [],
        browserTypes: [],
        locationData: [],
        timeOfDayData: [],
        dayOfWeekData: [],
        seasonalTrends: [],
        userBehavior: {
          pageViews: 0,
          interactions: 0,
          scrollDepth: 0,
          timeOnPage: 0,
          exitPages: [],
          entryPages: [],
          userPaths: [],
          engagementMetrics: {
            likes: 0,
            shares: 0,
            comments: 0,
            downloads: 0,
          },
        },
      },
    });
  }, [form, currentStep]);

  // Validation
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    console.log('🔍 validateCurrentStep called for step:', currentStep);
    setIsLoading(true);

    try {
      const stepSchema = stepSchemas[currentStep as keyof typeof stepSchemas];
      console.log('📋 Step schema found:', !!stepSchema);
      if (!stepSchema) {
        console.log('❌ No step schema found for step:', currentStep);
        return false;
      }

      const currentData = form.getValues();
      const stepData = getStepData(currentData, currentStep);
      console.log('📊 Step data:', stepData);

      // For step 1, let's be more lenient with validation
      if (currentStep === 1) {
        // Check if at least one item is selected
        if (stepData.items && stepData.items.length > 0) {
          console.log('🎉 Step 1 validation passed (items selected)');
          clearStepErrors(currentStep);
          return true;
        } else {
          console.log('❌ Step 1 validation failed (no items selected)');
          return false;
        }
      }

      const validation = stepSchema.safeParse(stepData);
      console.log('✅ Validation result:', validation.success);

      if (validation.success) {
        // Clear step-specific errors
        clearStepErrors(currentStep);
        console.log('🎉 Step validation successful');
        return true;
      } else {
        // Set step-specific errors
        console.log('❌ Validation failed:', validation.error);
        if (
          validation.error?.issues &&
          Array.isArray(validation.error.issues)
        ) {
          setStepErrors(validation.error.issues, currentStep);
        }
        return false;
      }
    } catch (error) {
      console.error('💥 Validation error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, form]);

  const getStepErrors = useCallback(
    (step: number) => {
      const errors = form.formState.errors;
      const stepData = getStepData(form.getValues(), step);
      const stepErrors: Record<string, string> = {};

      Object.keys(stepData).forEach(key => {
        if (errors[key as keyof UnifiedBookingData]) {
          stepErrors[key] =
            (errors[key as keyof UnifiedBookingData] as any)?.message ||
            'Invalid value';
        }
      });

      return stepErrors;
    },
    [form]
  );

  // Helper functions for step data and errors
  const getStepData = (data: UnifiedBookingData, step: number) => {
    switch (step) {
      case 1:
        return {
          pickupAddress: data.pickupAddress,
          dropoffAddress: data.dropoffAddress,
          pickupProperty: data.pickupProperty,
          dropoffProperty: data.dropoffProperty,
          items: data.items,
          date: data.date,
          timeSlot: data.timeSlot,
          serviceType: data.serviceType,
          customRequirements: data.customRequirements,
        };
      case 2:
        return {
          customerDetails: data.customerDetails,
          paymentMethod: data.paymentMethod,
          cardDetails: data.cardDetails,
          termsAccepted: data.termsAccepted,
          marketingConsent: data.marketingConsent,
          specialInstructions: data.specialInstructions,
        };
      case 3:
        return {
          confirmed: true, // Default to true for confirmation step
        };
      default:
        return {};
    }
  };

  const setStepErrors = (validationErrors: any[], step: number) => {
    if (!validationErrors || !Array.isArray(validationErrors)) {
      console.warn(
        'setStepErrors: validationErrors is not a valid array:',
        validationErrors
      );
      return;
    }

    validationErrors.forEach(error => {
      if (error && error.path && Array.isArray(error.path)) {
        const fieldPath = error.path.join('.') as Path<UnifiedBookingData>;
        form.setError(fieldPath, {
          type: 'manual',
          message: error.message || 'Validation error',
        });
      }
    });
  };

  const clearStepErrors = (step: number) => {
    const stepData = getStepData(form.getValues(), step);
    Object.keys(stepData).forEach(key => {
      form.clearErrors(key as Path<UnifiedBookingData>);
    });
  };

  // Persistence
  const saveDraft = useCallback(async () => {
    try {
      const data = form.getValues();
      const timestamp = new Date();

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(DRAFT_TIMESTAMP_KEY, timestamp.toISOString());

      setIsDraftSaved(true);
      setLastSavedAt(timestamp);

      // Track draft save event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_draft_saved', {
          step: currentStep,
          items_count: data.items?.length || 0,
        });
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [form, currentStep]);

  const loadDraft = useCallback(async () => {
    try {
      const draftData = localStorage.getItem(DRAFT_STORAGE_KEY);
      const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);

      if (draftData && timestamp) {
        const parsedData = JSON.parse(draftData);
        form.reset(parsedData);
        setIsDraftSaved(true);
        setLastSavedAt(new Date(timestamp));

        // Track draft load event
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'booking_draft_loaded', {
            items_count: parsedData.items?.length || 0,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
      clearDraft();
    }
  }, [form]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
      setIsDraftSaved(false);
      setLastSavedAt(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // Analytics
  const trackStepStart = useCallback((step: number) => {
    setAnalytics(prev => ({
      ...prev,
      stepStartTimes: {
        ...prev.stepStartTimes,
        [step]: new Date(),
      },
    }));
  }, []);

  const trackStepCompletion = useCallback(
    (step: number) => {
      const startTime = analytics.stepStartTimes[step];
      const completionTime = new Date();
      const timeSpent = startTime
        ? completionTime.getTime() - startTime.getTime()
        : 0;

      setAnalytics(prev => ({
        ...prev,
        stepCompletionTimes: {
          ...prev.stepCompletionTimes,
          [step]: completionTime,
        },
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
      }));
    },
    [analytics.stepStartTimes]
  );

  const trackAbandonment = useCallback((point: string) => {
    setAnalytics(prev => ({
      ...prev,
      abandonmentPoints: [...prev.abandonmentPoints, point],
    }));
  }, []);

  const trackIncompleteBooking = useCallback(
    (step: number, reason: string) => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const currentData = form.getValues();

      const incompleteBooking = {
        step,
        reason,
        data: currentData,
        timestamp: new Date(),
        sessionId,
      };

      setAnalytics(prev => ({
        ...prev,
        incompleteBookings: [...prev.incompleteBookings, incompleteBooking],
      }));

      // Send incomplete booking data to admin
      sendIncompleteBookingToAdmin(incompleteBooking);
    },
    [form]
  );

  const trackVisitorActivity = useCallback(
    (action: string, details?: any) => {
      const currentSession = analytics.visitorAnalytics.visitorFlow.find(
        session => session.sessionId === (window as any).currentSessionId
      );

      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          actions: [
            ...currentSession.actions,
            { action, timestamp: new Date(), details },
          ],
        };

        setAnalytics(prev => ({
          ...prev,
          visitorAnalytics: {
            ...prev.visitorAnalytics,
            visitorFlow: prev.visitorAnalytics.visitorFlow.map(session =>
              session.sessionId === currentSession.sessionId
                ? updatedSession
                : session
            ),
          },
        }));

        // Store updated visitor data
        storeVisitorData(updatedSession);
      }
    },
    [analytics.visitorAnalytics.visitorFlow]
  );

  const getAnalytics = useCallback(() => analytics, [analytics]);

  // Send incomplete booking data to admin
  const sendIncompleteBookingToAdmin = async (incompleteBooking: any) => {
    try {
      console.log('📊 Sending incomplete booking to admin:', incompleteBooking);

      // In production, this would be an API call to notify admin
      // await fetch('/api/admin/incomplete-booking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(incompleteBooking),
      // });

      // For now, store in localStorage for admin access
      const existingIncomplete = JSON.parse(
        localStorage.getItem('admin-incomplete-bookings') || '[]'
      );
      existingIncomplete.push(incompleteBooking);
      localStorage.setItem(
        'admin-incomplete-bookings',
        JSON.stringify(existingIncomplete)
      );
    } catch (error) {
      console.error('Failed to send incomplete booking to admin:', error);
    }
  };

  // Store visitor data
  const storeVisitorData = (visitorSession: any) => {
    try {
      const existingVisitors = JSON.parse(
        localStorage.getItem('admin-visitor-analytics') || '[]'
      );
      const updatedVisitors = existingVisitors.map((visitor: any) =>
        visitor.sessionId === visitorSession.sessionId
          ? visitorSession
          : visitor
      );

      if (
        !existingVisitors.find(
          (v: any) => v.sessionId === visitorSession.sessionId
        )
      ) {
        updatedVisitors.push(visitorSession);
      }

      localStorage.setItem(
        'admin-visitor-analytics',
        JSON.stringify(updatedVisitors)
      );
    } catch (error) {
      console.error('Failed to store visitor data:', error);
    }
  };

  // Context value
  const contextValue: UnifiedBookingContextType = {
    form,
    currentStep,
    totalSteps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    getStepStatus,
    updateData,
    getData,
    resetData,
    validateCurrentStep,
    getStepErrors,
    saveDraft,
    loadDraft,
    clearDraft,
    isDraftSaved,
    lastSavedAt,
    trackStepStart,
    trackStepCompletion,
    trackAbandonment,
    trackIncompleteBooking,
    trackVisitorActivity,
    getAnalytics,
    isLoading,
    setIsLoading,
  };

  return (
    <UnifiedBookingContext.Provider value={contextValue}>
      {children}
    </UnifiedBookingContext.Provider>
  );
};

// Hook to use the unified booking context
export const useUnifiedBooking = (): UnifiedBookingContextType => {
  const context = useContext(UnifiedBookingContext);
  if (!context) {
    throw new Error(
      'useUnifiedBooking must be used within a UnifiedBookingProvider'
    );
  }
  return context;
};

// Export types for external use

