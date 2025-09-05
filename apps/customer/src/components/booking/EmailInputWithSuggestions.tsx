import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Button,
  useOutsideClick,
  Icon,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaEnvelope, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface EmailInputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  size?: string;
}

const EMAIL_DOMAINS = [
  // Popular International
  '@gmail.com',
  '@yahoo.com',
  '@hotmail.com',
  '@outlook.com',
  '@icloud.com',
  '@aol.com',
  '@gmx.com',
  '@protonmail.com',
  '@mail.com',
  '@live.com',
  '@msn.com',
  '@yandex.com',
  '@zoho.com',
  '@fastmail.com',
  '@tutanota.com',
  '@hushmail.com',
  '@rocketmail.com',
  '@me.com',
  '@mac.com',

  // UK Providers
  '@btinternet.com',
  '@virginmedia.com',
  '@sky.com',
  '@talktalk.net',
  '@plus.net',
  '@ntlworld.com',
  '@blueyonder.co.uk',
  '@orange.net',

  // French Providers
  '@wanadoo.fr',
  '@laposte.net',
  '@free.fr',
  '@sfr.fr',

  // German Providers
  '@gmx.de',
  '@web.de',
  '@t-online.de',
  '@freenet.de',
  '@arcor.de',
  '@1und1.de',
  '@vodafone.de',
  '@telekom.de',

  // Italian Providers
  '@tiscali.it',
  '@libero.it',
  '@virgilio.it',
  '@alice.it',
  '@fastwebnet.it',
  '@tim.it',
  '@vodafone.it',
  '@wind.it',

  // Belgian Providers
  '@telenet.be',
  '@skynet.be',
  '@belgacom.be',
  '@scarlet.be',
  '@base.be',
  '@proximus.be',
  '@mobistar.be',
  '@orange.be',

  // Temporary/Disposable
  '@guerrillamail.com',
  '@10minutemail.com',
  '@mailinator.com',
  '@tempmail.org',
  '@sharklasers.com',
  '@grr.la',
  '@guerrillamailblock.com',
  '@pokemail.net',
  '@spam4.me',
  '@bccto.me',
  '@chacuo.net',
  '@dispostable.com',
  '@fakeinbox.com',
  '@getairmail.com',
  '@mailnesia.com',
  '@maildrop.cc',
  '@mailmetrash.com',
  '@trashmail.net',
  '@throwaway.email',
  '@mailnull.com',
  '@getnada.com',
  '@mailcatch.com',
  '@tempr.email',
  '@minuteinbox.com',
  '@inboxbear.com',

  // Middle East & Regional
  '@maktoob.com',
  '@yahoo.ae',
  '@yahoo.sa',
  '@yahoo.eg',
  '@hotmail.ae',
  '@hotmail.sa',
  '@hotmail.eg',
  '@outlook.ae',
  '@outlook.sa',
  '@outlook.eg',
];

export default function EmailInputWithSuggestions({
  value,
  onChange,
  placeholder = 'Enter your email address',
  isInvalid = false,
  size = 'lg',
}: EmailInputWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredDomains, setFilteredDomains] =
    useState<string[]>(EMAIL_DOMAINS);
  const [localValue, setLocalValue] = useState(value);
  const [justSelected, setJustSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useOutsideClick({
    ref: containerRef,
    handler: () => setIsOpen(false),
  });

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);

    // Don't show suggestions if we just selected a domain
    if (justSelected) {
      onChange(inputValue);
      return;
    }

    // Show suggestions as soon as user starts typing
    if (inputValue.length > 0) {
      if (inputValue.includes('@')) {
        const [localPart, domainPart] = inputValue.split('@');
        if (domainPart) {
          const filtered = EMAIL_DOMAINS.filter(domain =>
            domain.toLowerCase().startsWith('@' + domainPart.toLowerCase())
          );
          setFilteredDomains(filtered);
        } else {
          setFilteredDomains(EMAIL_DOMAINS);
        }
      } else {
        // Show popular domains even before @ symbol
        setFilteredDomains(EMAIL_DOMAINS.slice(0, 10));
      }
    } else {
      setFilteredDomains([]);
    }

    // Update parent component
    onChange(inputValue);
  };

  const handleDomainSelect = (domain: string) => {
    const [localPart] = localValue.split('@');
    const newValue = localPart + domain;
    setLocalValue(newValue);
    setJustSelected(true);
    setIsOpen(false);
    onChange(newValue);

    // Add a small delay before focusing to prevent immediate re-opening
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    // Reset the justSelected flag after a longer delay
    setTimeout(() => {
      setJustSelected(false);
    }, 500);
  };

  const handleInputFocus = () => {
    // Show suggestions when user focuses on input
    // Only show if there's content and dropdown isn't being closed and we haven't just selected
    if (localValue.length > 0 && !isOpen && !justSelected) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    // Show suggestions when user clicks on input
    // Only show if there's content and dropdown isn't being closed and we haven't just selected
    if (localValue.length > 0 && !isOpen && !justSelected) {
      setIsOpen(true);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getLocalPart = () => {
    return localValue.includes('@') ? localValue.split('@')[0] : localValue;
  };

  const getDomainPart = () => {
    return localValue.includes('@') ? localValue.split('@')[1] : '';
  };

  return (
    <Box ref={containerRef} position="relative" w="full">
      <InputGroup size={size}>
        <Input
          ref={inputRef}
          type="email"
          value={localValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          placeholder={placeholder}
          isInvalid={isInvalid}
        />
      </InputGroup>

      {/* Domain Suggestions Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          width="100%"
          zIndex={1000}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
          maxH="200px"
          overflowY="auto"
          mt={1}
        >
          <VStack spacing={0} align="stretch">
            {/* Popular domains section */}
            <Box
              p={3}
              bg="bg.surface"
              borderBottomWidth="1px"
              borderColor="border.primary"
            >
              <Text fontSize="sm" fontWeight="semibold" color="neon.500">
                {localValue.includes('@')
                  ? 'Popular Domains'
                  : 'Popular Email Domains'}
              </Text>
            </Box>

            {/* Domain suggestions */}
            {filteredDomains.slice(0, 20).map((domain, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                justifyContent="flex-start"
                px={3}
                py={2}
                h="auto"
                borderRadius={0}
                _hover={{ bg: 'bg.surface.hover' }}
                onClick={() => handleDomainSelect(domain)}
                textAlign="left"
              >
                <Flex align="center" justify="space-between" w="full">
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">
                      {getLocalPart()}
                    </Text>
                    <Text as="span" color="text.tertiary">
                      {domain}
                    </Text>
                  </Text>
                  {index < 10 && (
                    <Badge colorScheme="neon" size="sm">
                      Popular
                    </Badge>
                  )}
                </Flex>
              </Button>
            ))}

            {/* Show more domains if available */}
            {filteredDomains.length > 20 && (
              <Box
                p={3}
                bg="bg.surface"
                borderTopWidth="1px"
                borderColor="border.primary"
              >
                <Text fontSize="xs" color="text.tertiary" textAlign="center">
                  +{filteredDomains.length - 20} more domains available
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}
