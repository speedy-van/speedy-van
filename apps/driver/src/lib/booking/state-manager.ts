import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  Step1Data,
  Step2Data,
  Step3Data,
  BookingFormData,
  defaultBookingData,
} from '../booking-schemas';
import { 
  Coordinates, 
  Address, 
  PropertyDetails, 
  BookingItem, 
  TimeSlot, 
  ServiceType 
} from '../booking-schemas';

// Storage keys
const STORAGE_KEYS = {
  BOOKING_DRAFT: 'speedy-van-booking-draft',
  SESSION_ID: 'speedy-van-session-id',
  FORM_STATE: 'speedy-van-form-state',
} as const;

// Session management
const generateSessionId = (): string => {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  }
  return sessionId;
};

// Storage utilities
const saveToStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

const clearStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

// Step schemas mapping
const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
} as const;

// Extended form state interface
interface ExtendedFormState extends Partial<BookingFormData> {
  currentStep: number;
  totalSteps: number;
  sessionId: string;
  lastSavedAt?: number;
  errors: Record<number, string[]>;
  isDirty: boolean;
  isSubmitting: boolean;
  completedSteps: number[];
  metadata: {
    sessionId: string;
    completedSteps: number[];
  };
  data: {
    step1: any;
    step2: any;
    step3: any;
  };
}

// Hook for managing booking form state
export const useBookingForm = () => {
  const [formState, setFormState] = useState<ExtendedFormState>(() => {
    const savedState = loadFromStorage(
      STORAGE_KEYS.FORM_STATE,
      defaultBookingData
    );
    return {
      ...savedState,
      currentStep: 1,
      totalSteps: 3,
      sessionId: getOrCreateSessionId(),
      errors: {},
      isDirty: false,
      isSubmitting: false,
      completedSteps: [],
      metadata: {
        sessionId: getOrCreateSessionId(),
        completedSteps: [],
      },
      data: {
        step1: {},
        step2: {},
        step3: {},
      },
    };
  });

  // React Hook Form instances for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema) as any,
    defaultValues: {} as Step1Data,
    mode: 'onChange',
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema) as any,
    defaultValues: {} as Step2Data,
    mode: 'onChange',
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema) as any,
    defaultValues: {} as Step3Data,
    mode: 'onChange',
  });



  // Form instances mapping
  const forms = useMemo(
    () => ({
      1: step1Form,
      2: step2Form,
      3: step3Form,
    }),
    [step1Form, step2Form, step3Form]
  );

  // Get current form
  const getCurrentForm = useCallback((): UseFormReturn<any> => {
    return forms[formState.currentStep as keyof typeof forms];
  }, [forms, formState.currentStep]);

  // Update form state
  const updateFormState = useCallback((updates: Partial<ExtendedFormState>) => {
    setFormState(prev => {
      const newState = { ...prev, ...updates };
      saveToStorage(STORAGE_KEYS.FORM_STATE, newState);
      return newState;
    });
  }, []);

  // Save draft data
  const saveDraft = useCallback(async () => {
    const draftData = {
      ...step1Form.getValues(),
      ...step2Form.getValues(),
      ...step3Form.getValues(),
      lastSavedAt: Date.now(),
    };

    saveToStorage(STORAGE_KEYS.BOOKING_DRAFT, draftData);

    updateFormState({
      lastSavedAt: Date.now(),
    });

    return draftData;
  }, [
    step1Form,
    step2Form,
    step3Form,
    updateFormState,
  ]);

  // Load draft data
  const loadDraft = useCallback(() => {
    const draft = loadFromStorage(STORAGE_KEYS.BOOKING_DRAFT, null);

    if (draft) {
      step1Form.reset(draft);
      step2Form.reset(draft);
      step3Form.reset(draft);

      updateFormState(draft);
      return true;
    }

    return false;
  }, [
    step1Form,
    step2Form,
    step3Form,
    updateFormState,
  ]);

  // Clear draft
  const clearDraft = useCallback(() => {
    clearStorage(STORAGE_KEYS.BOOKING_DRAFT);
    clearStorage(STORAGE_KEYS.FORM_STATE);

    // Reset all forms
    step1Form.reset();
    step2Form.reset();
    step3Form.reset();

    setFormState({
      ...defaultBookingData,
      currentStep: 1,
      totalSteps: 3,
      sessionId: getOrCreateSessionId(),
      errors: {},
      isDirty: false,
      isSubmitting: false,
      completedSteps: [],
      metadata: {
        sessionId: getOrCreateSessionId(),
        completedSteps: [],
      },
      data: {
        step1: {},
        step2: {},
        step3: {},
      },
    });
  }, [step1Form, step2Form, step3Form]);

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const currentForm = getCurrentForm();
    const isValid = await currentForm.trigger();

    updateFormState({
      errors: {
        ...formState.errors,
        [formState.currentStep]: isValid
          ? []
          : Object.entries(currentForm.formState.errors).map(
              ([field, error]) => error?.message || 'Invalid value'
            ).filter(Boolean) as string[],
      },
    });

    return isValid;
  }, [
    getCurrentForm,
    updateFormState,
    formState.errors,
    formState.currentStep,
  ]);

  // Navigate to step
  const goToStep = useCallback(
    async (step: number): Promise<boolean> => {
      if (step < 1 || step > formState.totalSteps) {
        return false;
      }

      // Validate current step before moving forward
      if (step > formState.currentStep) {
        const isCurrentStepValid = await validateCurrentStep();
        if (!isCurrentStepValid) {
          return false;
        }
      }

      // Save draft before navigation
      await saveDraft();

      updateFormState({
        currentStep: step,
        completedSteps:
          step > formState.currentStep
            ? [...formState.completedSteps, formState.currentStep]
            : formState.completedSteps,
      });

      return true;
    },
    [
      formState.currentStep,
      formState.totalSteps,
      formState.completedSteps,
      validateCurrentStep,
      saveDraft,
      updateFormState,
    ]
  );

  // Navigate to next step
  const nextStep = useCallback(async (): Promise<boolean> => {
    return goToStep(formState.currentStep + 1);
  }, [formState.currentStep, goToStep]);

  // Navigate to previous step
  const prevStep = useCallback(async (): Promise<boolean> => {
    return goToStep(formState.currentStep - 1);
  }, [formState.currentStep, goToStep]);

  // Check if step is completed
  const isStepCompleted = useCallback(
    (step: number): boolean => {
      return formState.completedSteps.includes(step);
    },
    [formState.completedSteps]
  );

  // Check if can navigate to step
  const canNavigateToStep = useCallback(
    (step: number): boolean => {
      if (step <= formState.currentStep) return true;
      if (step === formState.currentStep + 1) return true;
      return isStepCompleted(step - 1);
    },
    [formState.currentStep, isStepCompleted]
  );

  // Get step progress
  const getStepProgress = useCallback((): number => {
    return Math.round((formState.currentStep / formState.totalSteps) * 100);
  }, [formState.currentStep, formState.totalSteps]);

  // Get all form data
  const getAllData = useCallback(() => {
    return {
      step1: step1Form.getValues(),
      step2: step2Form.getValues(),
      step3: step3Form.getValues(),
      
    };
  }, [step1Form, step2Form, step3Form]);

  // Submit booking
  const submitBooking = useCallback(async () => {
    updateFormState({ isSubmitting: true });

    try {
      // Validate all steps
      const allValid = await Promise.all([
        step1Form.trigger(),
        step2Form.trigger(),
        step3Form.trigger(),

      ]);

      if (!allValid.every(Boolean)) {
        throw new Error('Please complete all required fields');
      }

      const bookingData = getAllData();

      // Here you would make the API call to submit the booking
      // const result = await submitBookingAPI(bookingData);

      // Clear draft after successful submission
      clearDraft();

      return bookingData;
    } catch (error) {
      console.error('Booking submission failed:', error);
      throw error;
    } finally {
      updateFormState({ isSubmitting: false });
    }
  }, [
    step1Form,
    step2Form,
    step3Form,
    getAllData,
    clearDraft,
    updateFormState,
  ]);

  // Auto-save effect
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formState.isDirty) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formState.isDirty, saveDraft]);

  // Mark form as dirty when any form changes
  useEffect(() => {
    const subscriptions = Object.values(forms).map(form =>
      form.watch(() => {
        if (!formState.isDirty) {
          updateFormState({ isDirty: true });
        }
      })
    );

    return () => subscriptions.forEach((unsubscribe: any) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  }, [forms, formState.isDirty, updateFormState]);

  return {
    // State
    formState,

    // Forms
    forms,
    getCurrentForm,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canNavigateToStep,
    isStepCompleted,
    getStepProgress,

    // Data management
    getAllData,
    saveDraft,
    loadDraft,
    clearDraft,

    // Validation
    validateCurrentStep,

    // Submission
    submitBooking,

    // Utilities
    updateFormState,
  };
};

// Hook for step-specific form management
export const useStepForm = <T extends Record<string, any>>(step: number) => {
  const { forms, formState, updateFormState } = useBookingForm();
  const form = forms[step as keyof typeof forms] as UseFormReturn<any>;

  const isCurrentStep = formState.currentStep === step;
  const isCompleted = formState.completedSteps.includes(step);
  const errors = formState.errors[step] || [];

  const updateStepData = useCallback(
    (data: Partial<T>) => {
      Object.entries(data).forEach(([key, value]) => {
        form.setValue(key as any, value);
      });

      updateFormState({
        [`step${step}`]: {
          ...data,
        },
      });
    },
    [form, step, updateFormState]
  );

  return {
    form,
    isCurrentStep,
    isCompleted,
    errors,
    updateStepData,
  };
};

// Analytics hook for tracking form events
export const useBookingAnalytics = () => {
  const { formState } = useBookingForm();

  const trackEvent = useCallback(
    (event: string, properties: Record<string, any> = {}) => {
      // Here you would integrate with your analytics service
      console.log('Booking Analytics:', {
        event,
        properties: {
          ...properties,
          sessionId: formState.sessionId,
          currentStep: formState.currentStep,
          timestamp: Date.now(),
        },
      });
    },
    [formState.sessionId, formState.currentStep]
  );

  const trackStepStart = useCallback(
    (step: number) => {
      trackEvent('booking_step_started', { step });
    },
    [trackEvent]
  );

  const trackStepComplete = useCallback(
    (step: number) => {
      trackEvent('booking_step_completed', { step });
    },
    [trackEvent]
  );

  const trackFieldChange = useCallback(
    (field: string, value: any) => {
      trackEvent('booking_field_changed', { field, value });
    },
    [trackEvent]
  );

  const trackError = useCallback(
    (error: string, context: Record<string, any> = {}) => {
      trackEvent('booking_error', { error, context });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackStepStart,
    trackStepComplete,
    trackFieldChange,
    trackError,
  };
};

export type { BookingFormData };
