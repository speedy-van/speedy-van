'use client';

import { useCallback, useMemo } from 'react';
import { useUnifiedBooking } from '../unified-booking-context';
import type { UnifiedBookingData } from '../unified-booking-context';

/**
 * Enhanced hook for unified booking with additional helper functions
 */
export const useUnifiedBookingEnhanced = () => {
  const context = useUnifiedBooking();

  // Enhanced step validation
  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      if (step === context.currentStep) {
        return await context.validateCurrentStep();
      }

      // Validate specific step without changing current step
      const stepSchema = context.form.formState.errors;
      const stepData = getStepData(context.getData(), step);

      // Check if step has any errors
      const hasErrors = Object.keys(stepData).some(key => {
        return stepSchema[key as keyof UnifiedBookingData];
      });

      return !hasErrors;
    },
    [context]
  );

  // Get step completion status
  const getStepStatus = useCallback(
    (step: number) => {
      const stepData = getStepData(context.getData(), step);
      const hasData = Object.keys(stepData).some(key => {
        const value = stepData[key as keyof typeof stepData];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'boolean') return value === true;
        if (typeof value === 'number') return value > 0;
        return !!value;
      });

      return {
        isCompleted: hasData,
        isCurrent: step === context.currentStep,
        isAccessible: step <= context.currentStep || hasData,
      };
    },
    [context.currentStep, context.getData]
  );

  // Get progress percentage
  const getProgress = useMemo(() => {
    const completedSteps = [1, 2, 3].filter(step => {
      const status = getStepStatus(step);
      return status.isCompleted;
    }).length;

    return {
      percentage: (completedSteps / 3) * 100,
      completedSteps,
      totalSteps: 3,
    };
  }, [getStepStatus]);

  // Enhanced data helpers
  const getStepData = useCallback((data: UnifiedBookingData, step: number) => {
    switch (step) {
      case 1:
        return {
          pickupAddress: data.pickupAddress,
          dropoffAddress: data.dropoffAddress,
          pickupProperty: data.pickupAddress,
          dropoffProperty: data.dropoffProperty,
          items: data.items,
        };
      case 2:
        return {
          date: data.date,
          timeSlot: data.timeSlot,
          serviceType: data.serviceType,
          customRequirements: data.customRequirements,
        };
      case 3:
        return {
          customerDetails: data.customerDetails,
          paymentMethod: data.paymentMethod,
          cardDetails: data.cardDetails,
          termsAccepted: data.termsAccepted,
          marketingConsent: data.marketingConsent,
          specialInstructions: data.specialInstructions,
        };
      default:
        return {};
    }
  }, []);

  // Quick data accessors
  const getPickupAddress = useCallback(
    () => context.getData().pickupAddress,
    [context]
  );
  const getDropoffAddress = useCallback(
    () => context.getData().dropoffAddress,
    [context]
  );
  const getItems = useCallback(() => context.getData().items, [context]);
  const getServiceType = useCallback(
    () => context.getData().serviceType,
    [context]
  );
  const getCustomerDetails = useCallback(
    () => context.getData().customerDetails,
    [context]
  );
  const getPaymentMethod = useCallback(
    () => context.getData().paymentMethod,
    [context]
  );

  // Enhanced navigation
  const goToNextStep = useCallback(async () => {
    const success = await context.nextStep();
    if (success) {
      // Auto-save draft after successful step completion
      await context.saveDraft();
    }
    return success;
  }, [context]);

  const goToPreviousStep = useCallback(() => {
    context.prevStep();
    // Auto-save draft when going back
    context.saveDraft();
  }, [context]);

  // Form submission helpers
  const canSubmit = useMemo(() => {
    const data = context.getData();
    return (
      data.pickupAddress &&
      data.dropoffAddress &&
      data.items.length > 0 &&
      data.date &&
      data.timeSlot &&
      data.serviceType &&
      data.customerDetails.firstName &&
      data.customerDetails.lastName &&
      data.customerDetails.email &&
      data.customerDetails.phone &&
      data.paymentMethod &&
      data.termsAccepted
    );
  }, [context.getData]);

  const submitBooking = useCallback(async () => {
    if (!canSubmit) {
      throw new Error('Cannot submit: incomplete booking data');
    }

    context.setIsLoading(true);

    try {
      // Validate all steps
      const step1Valid = await validateStep(1);
      const step2Valid = await validateStep(2);
      const step3Valid = await validateStep(3);

      if (!step1Valid || !step2Valid || !step3Valid) {
        throw new Error('Validation failed for one or more steps');
      }

      const data = context.getData();

      // Here you would typically send the data to your API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const result = await response.json();

      // Clear draft after successful submission
      context.clearDraft();

      return result;
    } catch (error) {
      console.error('Booking submission failed:', error);
      throw error;
    } finally {
      context.setIsLoading(false);
    }
  }, [canSubmit, validateStep, context]);

  // Analytics helpers
  const trackStepInteraction = useCallback(
    (step: number, action: string) => {
      context.trackStepStart(step);

      // Track additional analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_step_interaction', {
          step,
          action,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [context]
  );

  const trackFormAbandonment = useCallback(
    (reason: string) => {
      context.trackAbandonment(reason);

      // Track additional analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'booking_abandoned', {
          reason,
          step: context.currentStep,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [context]
  );

  // Return enhanced context with additional helpers
  return {
    ...context,

    // Enhanced validation
    validateStep,

    // Step status and progress
    getStepStatus,
    getProgress,

    // Quick data accessors
    getPickupAddress,
    getDropoffAddress,
    getItems,
    getServiceType,
    getCustomerDetails,
    getPaymentMethod,

    // Enhanced navigation
    goToNextStep,
    goToPreviousStep,

    // Form submission
    canSubmit,
    submitBooking,

    // Enhanced analytics
    trackStepInteraction,
    trackFormAbandonment,
  };
};

// Export the base hook as well
export { useUnifiedBooking } from '../unified-booking-context';
