import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

// Attributes that commonly cause hydration mismatches
const PROBLEMATIC_ATTRIBUTES = [
  'fdprocessedid',
  'data-fdprocessedid',
  'data-form-id',
  'data-form-type',
  'data-form-version',
  'data-form-valid',
  'data-form-submitted',
  'data-form-errors',
  'data-form-warnings',
  'data-form-success',
  'data-form-loading',
  'data-form-disabled',
  'data-form-readonly',
  'data-form-required',
  'data-form-pattern',
  'data-form-minlength',
  'data-form-maxlength',
  'data-form-min',
  'data-form-max',
  'data-form-step',
  'data-form-multiple',
  'data-form-accept',
  'data-form-capture',
  'data-form-autocomplete',
  'data-form-autocorrect',
  'data-form-autocapitalize',
  'data-form-spellcheck',
  'data-form-inputmode',
  'data-form-enterkeyhint',
  'data-form-readonly',
  'data-form-disabled',
  'data-form-required',
  'data-form-pattern',
  'data-form-minlength',
  'data-form-maxlength',
  'data-form-min',
  'data-form-max',
  'data-form-step',
  'data-form-multiple',
  'data-form-accept',
  'data-form-capture',
  'data-form-autocomplete',
  'data-form-autocorrect',
  'data-form-autocapitalize',
  'data-form-spellcheck',
  'data-form-inputmode',
  'data-form-enterkeyhint'
];

export interface SafeButtonProps extends Omit<ButtonProps, keyof typeof PROBLEMATIC_ATTRIBUTES> {
  // Add any additional props here if needed
}

export const SafeButton = React.forwardRef<HTMLButtonElement, SafeButtonProps>(
  (props, ref) => {
    // Filter out problematic attributes
    const safeProps = { ...props };
    
    PROBLEMATIC_ATTRIBUTES.forEach(attr => {
      if (attr in safeProps) {
        delete (safeProps as any)[attr];
      }
    });

    // Also filter out any props that start with 'data-form-' or 'fdprocessedid'
    Object.keys(safeProps).forEach(key => {
      if (key.startsWith('data-form-') || key.includes('fdprocessedid')) {
        delete (safeProps as any)[key];
      }
    });

    return <Button ref={ref} {...safeProps} />;
  }
);

SafeButton.displayName = 'SafeButton';

export default SafeButton;
