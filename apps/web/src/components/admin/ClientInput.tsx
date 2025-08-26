'use client';

import { Input, InputProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

const ClientInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <Input {...props} ref={ref} suppressHydrationWarning />;
});

ClientInput.displayName = 'ClientInput';

export default ClientInput;
