# 🚀 UNIFIED BOOKING SYSTEM MIGRATION GUIDE

## **Overview**

This guide helps you migrate from the old booking systems to the new **Unified Booking System** that combines React Context with React Hook Form for better state management and form handling.

## **🔄 What's Changed**

### **Before (Legacy Systems)**

- **React Context**: `useBooking()` from `/lib/booking-context.tsx`
- **React Hook Form**: Individual components using `useForm()` locally
- **Mixed State Management**: Different approaches across components
- **Separate Validation**: Each component handling its own validation

### **After (Unified System)**

- **Unified Context**: `useUnifiedBooking()` from `/lib/unified-booking-context.tsx`
- **Enhanced Hook**: `useUnifiedBookingEnhanced()` with additional helpers
- **Consistent State Management**: Single source of truth for all booking data
- **Centralized Validation**: Zod schemas with step-by-step validation

## **📋 Migration Steps**

### **Step 1: Update Imports**

**Old:**

```typescript
import { useBooking } from '@/lib/booking-context';
```

**New:**

```typescript
import { useUnifiedBooking } from '@/lib/unified-booking-context';
// OR for enhanced features:
import { useUnifiedBookingEnhanced } from '@/lib/hooks/use-unified-booking';
```

### **Step 2: Update Provider Usage**

**Old:**

```typescript
import { BookingProvider } from '@/lib/booking-context';

export default function BookingPage() {
  return (
    <BookingProvider>
      <BookingContent />
    </BookingProvider>
  );
}
```

**New:**

```typescript
import { UnifiedBookingProvider } from '@/lib/unified-booking-context';

export default function BookingPage() {
  return (
    <UnifiedBookingProvider>
      <BookingContent />
    </UnifiedBookingProvider>
  );
}
```

### **Step 3: Update Hook Usage**

**Old:**

```typescript
const { state, dispatch, goToStep, nextStep, updateData } = useBooking();
const { currentStep, data, errors } = state;

// Update data
dispatch({ type: 'UPDATE_DATA', payload: newData });

// Navigate
goToStep(2);
```

**New:**

```typescript
const {
  currentStep,
  form,
  goToStep,
  nextStep,
  updateData,
  getData,
  validateCurrentStep,
} = useUnifiedBooking();

// Update data
updateData(newData);

// Navigate
goToStep(2);

// Get form data
const data = getData();
```

### **Step 4: Update Form Handling**

**Old (Local State):**

```typescript
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const handleSubmit = data => {
  setFormData(data);
  // Handle validation manually
};
```

**New (Unified Context):**

```typescript
const { form, validateCurrentStep, updateData } = useUnifiedBooking();

const handleSubmit = async data => {
  updateData(data);
  const isValid = await validateCurrentStep();
  if (isValid) {
    // Proceed to next step
  }
};
```

### **Step 5: Update Validation**

**Old:**

```typescript
const validateForm = () => {
  const errors = {};
  if (!formData.name) errors.name = 'Name is required';
  // ... more validation
  return errors;
};
```

**New:**

```typescript
const { validateCurrentStep, getStepErrors } = useUnifiedBooking();

const handleValidation = async () => {
  const isValid = await validateCurrentStep();
  if (!isValid) {
    const errors = getStepErrors(currentStep);
    // Handle errors
  }
};
```

## **🔧 Component Migration Examples**

### **Example 1: Basic Form Component**

**Before:**

```typescript
export default function CustomerDetailsStep() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (data) => {
    setFormData(data);
    // Manual validation
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

**After:**

```typescript
export default function CustomerDetailsStep() {
  const { form, updateData, validateCurrentStep } = useUnifiedBooking();

  const onSubmit = async (data) => {
    updateData(data);
    const isValid = await validateCurrentStep();
    if (isValid) {
      // Proceed to next step
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('customerDetails.firstName')} />
      <input {...form.register('customerDetails.lastName')} />
      <input {...form.register('customerDetails.email')} />
      <input {...form.register('customerDetails.phone')} />
    </form>
  );
}
```

### **Example 2: Navigation Component**

**Before:**

```typescript
export default function BookingNavigation() {
  const { state, dispatch } = useBooking();
  const { currentStep } = state;

  const handleNext = () => {
    dispatch({ type: 'SET_STEP', payload: currentStep + 1 });
  };

  const handlePrev = () => {
    dispatch({ type: 'SET_STEP', payload: currentStep - 1 });
  };

  return (
    <div>
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

**After:**

```typescript
export default function BookingNavigation() {
  const {
    currentStep,
    canGoNext,
    canGoPrev,
    nextStep,
    prevStep
  } = useUnifiedBooking();

  const handleNext = async () => {
    await nextStep();
  };

  return (
    <div>
      <button
        onClick={prevStep}
        disabled={!canGoPrev}
      >
        Previous
      </button>
      <button
        onClick={handleNext}
        disabled={!canGoNext}
      >
        Next
      </button>
    </div>
  );
}
```

## **📊 Data Structure Changes**

### **Old Data Structure:**

```typescript
interface BookingState {
  currentStep: number;
  data: Partial<BookingFormData>;
  errors: Record<string, string[]> | null;
  isLoading: boolean;
  isDraftSaved: boolean;
  lastSavedAt: Date | null;
  analytics: {
    /* ... */
  };
}
```

### **New Data Structure:**

```typescript
interface UnifiedBookingData {
  // Step 1: Where & What
  pickupAddress?: Address;
  dropoffAddress?: Address;
  pickupProperty?: Property;
  dropoffProperty?: Property;
  items: Item[];
  distanceMiles?: number;

  // Step 2: When & How
  date: string;
  timeSlot: string;
  serviceType: ServiceType;
  customRequirements?: string;

  // Step 3: Who & Payment
  customerDetails: CustomerDetails;
  paymentMethod: string;
  cardDetails?: CardDetails;
  termsAccepted: boolean;
  marketingConsent: boolean;
  specialInstructions?: string;
}
```

## **🚨 Breaking Changes**

### **1. Context Provider Change**

- **Old**: `<BookingProvider>`
- **New**: `<UnifiedBookingProvider>`

### **2. Hook Name Change**

- **Old**: `useBooking()`
- **New**: `useUnifiedBooking()` or `useUnifiedBookingEnhanced()`

### **3. State Access Change**

- **Old**: `state.data`, `state.currentStep`
- **New**: `getData()`, `currentStep`

### **4. Data Update Change**

- **Old**: `dispatch({ type: 'UPDATE_DATA', payload: data })`
- **New**: `updateData(data)`

### **5. Validation Change**

- **Old**: Manual validation in components
- **New**: `validateCurrentStep()` with automatic error handling

## **✅ Benefits of Migration**

### **1. Better Form Handling**

- React Hook Form integration for better performance
- Automatic form validation with Zod schemas
- Built-in error handling and field management

### **2. Consistent State Management**

- Single source of truth for all booking data
- Automatic draft saving and loading
- Centralized analytics tracking

### **3. Enhanced Developer Experience**

- Type-safe data structures
- Built-in validation schemas
- Helper functions for common operations

### **4. Better Performance**

- Optimized re-renders with React Hook Form
- Efficient state updates
- Automatic memoization

## **🔍 Testing Migration**

### **1. Verify Provider Setup**

```typescript
// Ensure UnifiedBookingProvider wraps your component
<UnifiedBookingProvider>
  <YourComponent />
</UnifiedBookingProvider>
```

### **2. Test Hook Usage**

```typescript
// Verify hook returns expected values
const booking = useUnifiedBooking();
console.log('Current step:', booking.currentStep);
console.log('Form data:', booking.getData());
```

### **3. Test Form Submission**

```typescript
// Verify form validation works
const isValid = await booking.validateCurrentStep();
console.log('Step valid:', isValid);
```

### **4. Test Data Persistence**

```typescript
// Verify draft saving works
await booking.saveDraft();
console.log('Draft saved:', booking.isDraftSaved);
```

## **📞 Need Help?**

If you encounter issues during migration:

1. **Check the console** for error messages
2. **Verify imports** are correct
3. **Ensure provider** wraps your component
4. **Check data structure** matches new schemas
5. **Review validation** logic for your specific use case

## **🎯 Next Steps**

After completing migration:

1. **Remove old imports** from `booking-context.tsx`
2. **Update tests** to use new hooks
3. **Optimize components** using new helper functions
4. **Add analytics** using new tracking functions
5. **Implement advanced features** like auto-save and validation

---

**Happy Migrating! 🚀**
