import React from 'react';
import { VStack, HStack } from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Button from '../common/Button';

interface BookingNavigationButtonsProps {
  onNext?: () => void;
  onBack?: () => void;
  nextText?: string;
  backText?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  nextIcon?: React.ReactElement;
  backIcon?: React.ReactElement;
  nextVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  backVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export default function BookingNavigationButtons({
  onNext,
  onBack,
  nextText = 'Continue',
  backText = 'Back',
  nextDisabled = false,
  backDisabled = false,
  showBack = true,
  showNext = true,
  nextIcon = <FaArrowRight />,
  backIcon = <FaArrowLeft />,
  nextVariant = 'primary',
  backVariant = 'outline'
}: BookingNavigationButtonsProps) {
  return (
    <VStack spacing={4} pt={6}>
      {/* Mobile Layout */}
      <VStack 
        display={{ base: 'flex', md: 'none' }} 
        spacing={3} 
        w="full"
      >
        {showNext && (
          <Button
            onClick={onNext}
            variant={nextVariant}
            size="lg"
            isCTA={nextVariant === 'primary'}
            isMobileFriendly={true}
            rightIcon={nextIcon}
            w="full"
            isDisabled={nextDisabled}
          >
            {nextText}
          </Button>
        )}
        {showBack && (
          <Button
            onClick={onBack}
            variant={backVariant}
            size="lg"
            isMobileFriendly={true}
            leftIcon={backIcon}
            isDisabled={backDisabled}
            w="full"
          >
            {backText}
          </Button>
        )}
      </VStack>

      {/* Desktop Layout */}
      <HStack 
        display={{ base: 'none', md: 'flex' }} 
        spacing={4} 
        justify="space-between" 
        w="full"
      >
        {showBack && (
          <Button
            onClick={onBack}
            variant={backVariant}
            size="lg"
            leftIcon={backIcon}
            isDisabled={backDisabled}
          >
            {backText}
          </Button>
        )}
        {showNext && (
          <Button
            onClick={onNext}
            variant={nextVariant}
            size="lg"
            isCTA={nextVariant === 'primary'}
            rightIcon={nextIcon}
            isDisabled={nextDisabled}
          >
            {nextText}
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
