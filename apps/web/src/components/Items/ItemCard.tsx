'use client';

import React from 'react';
import { Box, Text, Image, Tooltip, Button, Badge } from '@chakra-ui/react';
import { motion, Variants } from 'framer-motion';

export type ItemCardProps = {
  name: string;
  label: string;
  imageSrc: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSelect?: () => void;
  tooltip?: string;
  isNewlyAdded?: boolean;
  highlight?: string;
};

const MotionBox = motion.create(Box);

const cardVariants: Variants = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export function ItemCard(props: ItemCardProps) {
  const { label, name, imageSrc, tooltip, quantity, onIncrement, onDecrement, onSelect, isNewlyAdded, highlight } = props;

  function renderHighlightedLabel(text: string, query?: string) {
    if (!query) return text;
    const q = query.trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);
    return (
      <>
        {before}
        <mark style={{ background: 'rgba(255, 213, 0, .35)', padding: '0 2px', borderRadius: 4 }}>{match}</mark>
        {after}
      </>
    );
  }

  return (
    <MotionBox
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      cursor="pointer"
      position="relative"
      role="button"
      aria-label={label}
      borderRadius="xl"
      bg="rgba(255,255,255,0.06)"
      _light={{ bg: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)' }}
      _dark={{ bg: 'rgba(17, 24, 39, 0.45)', backdropFilter: 'blur(10px)' }}
      boxShadow="md"
      border="2px solid transparent"
      transition={{ duration: 0.18 }}
      _hover={{ borderColor: 'orange.400', boxShadow: '0 0 0 2px rgba(251, 146, 60, 0.35), 0 8px 24px rgba(0,0,0,.18)' }}
      overflow="hidden"
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: '2px',
          background: 'linear-gradient(135deg, rgba(253, 186, 116,.9), rgba(251, 146, 60,.9), rgba(234, 88, 12,.9))',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity: 0,
          transition: 'opacity 200ms ease',
          pointerEvents: 'none',
        },
        '&:hover::before': { opacity: 0.45 },
      }}
    >
      {quantity > 0 && (
        <Badge position="absolute" top={2} right={2} colorScheme="orange" borderRadius="full" px={2} py={1} display="flex" alignItems="center" gap={1} zIndex={2}>
          <span role="img" aria-label="flame">🔥</span>
          {quantity}
        </Badge>
      )}
      {isNewlyAdded && (
        <Box position="absolute" inset={0} borderRadius="xl" boxShadow="0 0 32px rgba(251, 146, 60, .55)" pointerEvents="none" zIndex={1} />
      )}
      
      {/* IMAGE AREA — zero padding, fixed height, relative positioning */}
      <Box position="relative" w="100%" h="120px" p={0}>
        <Tooltip label={tooltip || label} aria-label={`${label} tooltip`} openDelay={200}>
          <Image
            src={imageSrc}
            alt={label}
            w="100%"
            h="100%"
            objectFit="cover"
            fallbackSrc="/items/placeholder.svg"
            draggable={false}
          />
        </Tooltip>
      </Box>

      {/* CONTENT AREA — padding goes here, not on image wrapper */}
      <Box p={4}>
        <Text fontWeight="bold" textAlign="center" color="brand.600">
          {renderHighlightedLabel(label, highlight)}
        </Text>
        <Box mt={3} textAlign="center" display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Button size="xs" variant="outline" onClick={(e)=>{ e.stopPropagation(); onDecrement(); }} aria-label={`Decrease ${label}`} disabled={quantity <= 0}>−</Button>
          <Text as="span" minW="20px" fontWeight="semibold">{quantity}</Text>
          <Button size="xs" onClick={(e)=>{ e.stopPropagation(); onIncrement(); }} aria-label={`Increase ${label}`}>+</Button>
        </Box>
      </Box>
    </MotionBox>
  );
}

export default ItemCard;


